import datetime
import json
import logging
import statistics
import uuid
from sqlalchemy.orm import Session
from app.config import settings
from app.adapters.registry import provider_registry
from app.pipeline.validator import validate_raw_quote
from app.pipeline.cleaner import deduplicate_quotes, clean_quote_components
from app.pipeline.normalizer import normalize_fare_record
from app.pipeline.quality import detect_and_flag_outliers, compute_data_quality_metrics
from app.engine.weights import get_route_weights
from app.engine.index_calculator import (
    calculate_route_median_price,
    calculate_price_relative,
    calculate_national_apix
)
from app.engine.decomposition import calculate_index_decomposition
from app.db.models import RawQuote, ValidatedQuote, IndexObservation, DataQualityRun, Route, CollectionJob

logger = logging.getLogger(__name__)

class PipelineOrchestrator:
    def __init__(self, db: Session):
        self.db = db

    def run_collection_cycle(self, target_date: datetime.date | None = None) -> dict:
        """
        Executes end-to-end data pipeline cycle:
        Source Adapters -> Raw Store -> Validation -> Cleaning -> Normalisation ->
        Quality Engine -> Index Engine -> Lineage Storage.
        Supports configurable routes, providers, lead times, and enforces idempotency.
        """
        now_utc = datetime.datetime.now(datetime.timezone.utc)
        if target_date is None:
            target_date = datetime.date.today()

        # Fetch active routes from DB or fall back to settings
        db_routes = self.db.query(Route).filter(Route.is_active == True).all()
        if db_routes:
            routes = [r.route_id for r in db_routes]
        else:
            routes = settings.ROUTE_BASKET

        lead_times = settings.LEAD_TIMES
        providers = provider_registry.list_providers()

        raw_collected = []
        invalid_quotes_count = 0
        jobs_created = []

        # Step 1: Collect quotes via provider adapters with job tracking
        for r_code in routes:
            parts = r_code.split("-")
            if len(parts) != 2:
                continue
            origin, dest = parts[0], parts[1]

            for lt in lead_times:
                travel_date = target_date + datetime.timedelta(days=lt)

                for prov_info in providers:
                    prov_id = prov_info["provider_id"]
                    adapter = provider_registry.get(prov_id)
                    if not adapter or not prov_info.get("is_active", True):
                        continue

                    job = CollectionJob(
                        job_id=str(uuid.uuid4()),
                        target_date=target_date,
                        lead_time_days=lt,
                        route_id=r_code,
                        provider_id=prov_id,
                        status="running",
                        started_at=now_utc
                    )
                    self.db.add(job)
                    self.db.flush()
                    jobs_created.append(job)

                    quotes = adapter.collect_quotes(origin, dest, travel_date, lt)
                    valid_for_job = 0

                    for q in quotes:
                        q["_job_id"] = job.job_id
                        is_valid, reason = validate_raw_quote(q)
                        if is_valid:
                            raw_collected.append(q)
                            valid_for_job += 1
                        else:
                            invalid_quotes_count += 1
                            logger.warning(f"Rejected raw quote: {reason}")

                    job.status = "completed"
                    job.quotes_count = valid_for_job
                    job.completed_at = datetime.datetime.now(datetime.timezone.utc)
                    self.db.flush()

        # Step 2: Persist immutable raw quotes (DATA-001)
        persisted_raw = []
        for q in raw_collected:
            dep_date = q["departure_date"]
            if isinstance(dep_date, str):
                dep_date = datetime.date.fromisoformat(dep_date)

            raw_row = RawQuote(
                job_id=q.get("_job_id"),
                timestamp=now_utc,
                source=q["source"],
                airline=q["airline"],
                origin=q["origin"],
                destination=q["destination"],
                departure_date=dep_date,
                return_date=None,
                lead_time=q["lead_time"],
                fare_class=q.get("fare_class", "Economy"),
                base_fare=q.get("base_fare"),
                taxes=q.get("taxes"),
                airport_fee=q.get("airport_fee"),
                udf=q.get("udf"),
                convenience_fee=q.get("convenience_fee"),
                total_fare=q.get("total_fare"),
                currency=q.get("currency", "INR"),
                availability=q.get("availability", "available"),
                scrape_method=q.get("scrape_method", "adapter"),
                source_url=q.get("source_url"),
                raw_payload=q.get("raw_payload")
            )
            self.db.add(raw_row)
            self.db.flush()
            q["_db_raw_id"] = raw_row.raw_id
            persisted_raw.append(q)

        # Step 3: Deduplicate (FR-002, TEST-004)
        unique_raw, duplicate_count = deduplicate_quotes(persisted_raw)

        # Step 4: Clean components & handle missing fields (FR-003, TEST-002)
        cleaned_raw = [clean_quote_components(q) for q in unique_raw]

        # Step 5: Normalize records (FR-005, FR-006, TEST-003)
        normalized_records = [
            normalize_fare_record(q, q["_db_raw_id"])
            for q in cleaned_raw
        ]

        # Step 6: Flag statistical outliers (FR-004, TEST-005)
        outlier_checked = detect_and_flag_outliers(normalized_records)

        outlier_count = sum(1 for rec in outlier_checked if rec.get("quality_flag") == "outlier")
        sold_out_count = sum(1 for rec in outlier_checked if rec.get("availability_status") == "sold_out")

        # Step 7: Persist validated quotes
        persisted_val_ids = []
        route_fares_map: dict[str, list[float]] = {}
        carrier_fares_map: dict[str, list[float]] = {}
        lead_time_fares_map: dict[int, list[float]] = {}
        total_taxes_fees = 0.0
        total_consumer_spend = 0.0

        for val_dict in outlier_checked:
            val_row = ValidatedQuote(
                raw_id=val_dict["raw_id"],
                route_id=val_dict["route_id"],
                carrier=val_dict["carrier"],
                travel_date=val_dict["travel_date"],
                booking_date=val_dict["booking_date"],
                lead_time=val_dict["lead_time"],
                fare_type=val_dict["fare_type"],
                base_fare=val_dict["base_fare"],
                mandatory_taxes=val_dict["mandatory_taxes"],
                mandatory_fees=val_dict["mandatory_fees"],
                total_consumer_price=val_dict["total_consumer_price"],
                availability_status=val_dict["availability_status"],
                quality_flag=val_dict["quality_flag"]
            )
            self.db.add(val_row)
            self.db.flush()
            val_id = val_row.validated_id
            persisted_val_ids.append(val_id)

            if val_dict["availability_status"] == "available" and val_dict["quality_flag"] != "outlier":
                r_id = val_dict["route_id"]
                p = val_dict["total_consumer_price"]
                route_fares_map.setdefault(r_id, []).append(p)
                carrier_fares_map.setdefault(val_dict["carrier"], []).append(p)
                lead_time_fares_map.setdefault(val_dict["lead_time"], []).append(p)
                total_taxes_fees += val_dict["mandatory_taxes"] + val_dict["mandatory_fees"]
                total_consumer_spend += p

        # Step 8: Compute Data Quality Score (FEATURE-006)
        total_collected = len(persisted_raw) + invalid_quotes_count
        quality_metrics = compute_data_quality_metrics(
            total_collected=total_collected,
            valid_count=len(persisted_val_ids),
            duplicate_count=duplicate_count,
            missing_invalid_count=invalid_quotes_count,
            sold_out_count=sold_out_count,
            outliers_count=outlier_count
        )

        dq_run = DataQualityRun(
            run_timestamp=now_utc,
            quotes_collected=total_collected,
            valid_quotes=len(persisted_val_ids),
            duplicates=duplicate_count,
            missing_invalid=invalid_quotes_count,
            sold_out=sold_out_count,
            outliers_removed=outlier_count,
            completeness_score=quality_metrics["completeness_score"],
            freshness_score=quality_metrics["freshness_score"],
            validity_score=quality_metrics["validity_score"],
            duplicate_rate=quality_metrics["duplicate_rate"],
            overall_quality_score=quality_metrics["overall_quality_score"]
        )
        self.db.add(dq_run)
        self.db.flush()

        # Step 9: Statistical Index Calculation with Idempotent Replacement
        # Clear existing observations for this target_date to guarantee idempotency
        self.db.query(IndexObservation).filter(
            IndexObservation.period_date == target_date,
            IndexObservation.granularity == "daily"
        ).delete()
        self.db.flush()

        route_weights = get_route_weights()
        base_route_nominal_prices = {
            "DEL-BOM": 6800.0,
            "DEL-BLR": 8100.0,
            "BOM-BLR": 5200.0,
            "DEL-CCU": 7100.0,
            "BLR-HYD": 4100.0,
            "MAA-DEL": 7800.0,
            "DEL-HYD": 6200.0,
        }

        route_relatives: dict[str, float] = {}
        for r_code in routes:
            f_list = route_fares_map.get(r_code, [])
            median_p = calculate_route_median_price(f_list)
            base_p = base_route_nominal_prices.get(r_code, 6000.0)
            if median_p is not None:
                rel = calculate_price_relative(median_p, base_p)
                route_relatives[r_code] = rel

                route_obs = IndexObservation(
                    period_date=target_date,
                    granularity="daily",
                    route_id=r_code,
                    route_weight=route_weights.get(r_code, 0.1),
                    base_period=settings.BASE_PERIOD,
                    price_relative=rel,
                    apix_value=rel,
                    contributing_validated_ids=json.dumps(persisted_val_ids[:10]),
                    coverage_ratio=1.0
                )
                self.db.add(route_obs)

        # Step 10: Weighted National APIx Aggregation (ALGO-003)
        national_apix, coverage = calculate_national_apix(route_relatives, route_weights)

        # Step 11: 5-Factor Decomposition (FR-005)
        carrier_meds = {c: float(statistics.median(f)) for c, f in carrier_fares_map.items() if f}
        lead_meds = {lt: float(statistics.median(f)) for lt, f in lead_time_fares_map.items() if f}
        tax_fee_ratio = (total_taxes_fees / max(1.0, total_consumer_spend)) if total_consumer_spend > 0 else 0.25
        sold_out_rate = (sold_out_count / max(1.0, len(persisted_val_ids)))

        decomp = calculate_index_decomposition(
            apix_value=national_apix,
            route_relatives=route_relatives,
            route_weights=route_weights,
            carrier_medians=carrier_meds,
            lead_time_medians=lead_meds,
            tax_fee_ratio=tax_fee_ratio,
            sold_out_rate=sold_out_rate
        )

        # Step 12: Persist Headline National Index with Strict Lineage (DATA-004)
        national_obs = IndexObservation(
            period_date=target_date,
            granularity="daily",
            route_id="NATIONAL",
            route_weight=1.0,
            base_period=settings.BASE_PERIOD,
            price_relative=national_apix,
            apix_value=national_apix,
            route_effect=decomp["route_effect"],
            carrier_effect=decomp["carrier_effect"],
            lead_time_effect=decomp["lead_time_effect"],
            tax_fee_effect=decomp["tax_fee_effect"],
            availability_effect=decomp["availability_effect"],
            contributing_validated_ids=json.dumps(persisted_val_ids),
            coverage_ratio=coverage
        )
        self.db.add(national_obs)
        self.db.commit()

        logger.info(f"Pipeline run completed for {target_date}: APIx={national_apix}, Coverage={coverage}")
        return {
            "date": target_date.isoformat(),
            "apix_value": national_apix,
            "coverage_ratio": coverage,
            "quotes_collected": total_collected,
            "validated_quotes_stored": len(persisted_val_ids),
            "data_quality_score": quality_metrics["overall_quality_score"],
            "decomposition": decomp
        }
