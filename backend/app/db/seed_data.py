import datetime
import json
import logging
from sqlalchemy.orm import Session
from app.config import settings
from app.db.models import RawQuote, ValidatedQuote, IndexObservation, DataQualityRun, Route, Provider
from app.engine.weights import get_route_weights

logger = logging.getLogger(__name__)

def seed_routes_and_providers(db: Session):
    """
    Seeds canonical domestic route configurations and active providers.
    """
    if db.query(Route).count() == 0:
        logger.info("Seeding canonical route configurations...")
        routes_to_seed = [
            Route(route_id="DEL-BOM", origin_airport="DEL", destination_airport="BOM", distance_km=1148, traffic_weight=0.2546, is_active=True),
            Route(route_id="DEL-BLR", origin_airport="DEL", destination_airport="BLR", distance_km=1740, traffic_weight=0.2073, is_active=True),
            Route(route_id="BOM-BLR", origin_airport="BOM", destination_airport="BLR", distance_km=842,  traffic_weight=0.1444, is_active=True),
            Route(route_id="DEL-CCU", origin_airport="DEL", destination_airport="CCU", distance_km=1305, traffic_weight=0.1234, is_active=True),
            Route(route_id="BLR-HYD", origin_airport="BLR", destination_airport="HYD", distance_km=500,  traffic_weight=0.1102, is_active=True),
            Route(route_id="MAA-DEL", origin_airport="MAA", destination_airport="DEL", distance_km=1760, traffic_weight=0.1024, is_active=True),
            Route(route_id="DEL-HYD", origin_airport="DEL", destination_airport="HYD", distance_km=1253, traffic_weight=0.0971, is_active=True),
        ]
        for r in routes_to_seed:
            db.merge(r)
        db.commit()

    if db.query(Provider).count() == 0:
        logger.info("Seeding configurable providers...")
        providers_to_seed = [
            Provider(provider_id="indigo",     name="IndiGo Direct",    provider_type="airline",    base_url="https://www.goindigo.in",   is_active=True, rate_limit_per_min=30, requires_browser=False),
            Provider(provider_id="air_india",  name="Air India Direct", provider_type="airline",    base_url="https://www.airindia.com",  is_active=True, rate_limit_per_min=30, requires_browser=False),
            Provider(provider_id="akasa",      name="Akasa Air Direct", provider_type="airline",    base_url="https://www.akasaair.com",  is_active=True, rate_limit_per_min=30, requires_browser=False),
            Provider(provider_id="spicejet",   name="SpiceJet Direct",  provider_type="airline",    base_url="https://www.spicejet.com",  is_active=True, rate_limit_per_min=30, requires_browser=False),
            Provider(provider_id="makemytrip", name="MakeMyTrip Portal", provider_type="aggregator", base_url="https://www.makemytrip.com", is_active=True, rate_limit_per_min=20, requires_browser=False),
        ]
        for p in providers_to_seed:
            db.merge(p)
        db.commit()

def seed_30_day_history(db: Session):
    """
    Populates 30 days of realistic historical airfare observations, validated quotes,
    daily/weekly/monthly index records, and quality runs for immediate evaluation and backtesting.
    """
    existing_count = db.query(IndexObservation).filter(IndexObservation.route_id == "NATIONAL").count()
    if existing_count >= 30:
        logger.info("30-day history already seeded.")
        return

    logger.info("Seeding 30-day historical airfare observations and indices...")

    today = datetime.date.today()
    routes = settings.ROUTE_BASKET
    weights = get_route_weights()
    lead_times = settings.LEAD_TIMES
    carriers = ["6E", "AI", "QP"]

    base_prices = {
        "DEL-BOM": 6800.0,
        "DEL-BLR": 8100.0,
        "BOM-BLR": 5200.0,
        "DEL-CCU": 7100.0,
        "BLR-HYD": 4100.0,
        "MAA-DEL": 7800.0,
        "DEL-HYD": 6200.0,
    }

    # Generate 30 days backwards
    for day_offset in range(30, -1, -1):
        obs_date = today - datetime.timedelta(days=day_offset)

        # Realistic inflation trend + weekend / festive cycle
        # Baseline trend starts at ~104 and trends towards ~108.4 with slight cyclical fluctuation
        cycle = (day_offset % 7) * 0.45  # Weekend spike
        trend = (30 - day_offset) * 0.12
        day_noise = ((int(obs_date.strftime("%Y%m%d")) * 17) % 100) / 100.0 * 1.2
        target_apix = round(103.5 + trend + cycle + day_noise, 2)

        collected_val_ids = []
        route_relatives = {}

        for r_code in routes:
            origin, dest = r_code.split("-")
            b_price = base_prices.get(r_code, 6000.0)
            route_shift = ((int(r_code[0]) if r_code[0].isdigit() else ord(r_code[0])) % 5) - 2.0
            r_rel = round(target_apix + route_shift * 0.35, 2)
            route_relatives[r_code] = r_rel

            # Generate individual fare observations for this route
            for lt in lead_times:
                for carrier in carriers:
                    dep_date = obs_date + datetime.timedelta(days=lt)
                    lt_factor = {1: 1.85, 7: 1.35, 15: 1.15, 30: 1.0, 45: 0.90}[lt]
                    c_factor = 1.08 if carrier == "AI" else (0.97 if carrier == "QP" else 1.0)

                    # Compute simulated price
                    nominal_base = round(b_price * (r_rel / 100.0) * lt_factor * c_factor * 0.75, 2)
                    taxes = round(nominal_base * 0.05, 2)
                    fees = 929.0
                    total = round(nominal_base + taxes + fees, 2)

                    avail = "sold_out" if (lt == 1 and day_offset % 8 == 0 and carrier == "QP") else "available"

                    # Raw quote
                    raw_q = RawQuote(
                        timestamp=datetime.datetime.combine(obs_date, datetime.time(8, 0)),
                        source="indigo" if carrier == "6E" else ("air_india" if carrier == "AI" else "makemytrip"),
                        airline=carrier,
                        origin=origin,
                        destination=dest,
                        departure_date=dep_date,
                        return_date=None,
                        lead_time=lt,
                        fare_class="Economy",
                        base_fare=nominal_base,
                        taxes=taxes,
                        airport_fee=180.0,
                        udf=450.0,
                        convenience_fee=299.0,
                        total_fare=total,
                        currency="INR",
                        availability=avail,
                        scrape_method="historical_seed",
                        source_url="https://portal.apix.internal/seed",
                        raw_payload=json.dumps({"seeded": True, "date": obs_date.isoformat()})
                    )
                    db.add(raw_q)
                    db.flush()

                    # Validated quote
                    val_q = ValidatedQuote(
                        raw_id=raw_q.raw_id,
                        route_id=r_code,
                        carrier=carrier,
                        travel_date=dep_date,
                        booking_date=obs_date,
                        lead_time=lt,
                        fare_type="standard_economy",
                        base_fare=nominal_base,
                        mandatory_taxes=taxes,
                        mandatory_fees=fees,
                        total_consumer_price=total,
                        availability_status=avail,
                        quality_flag="clean"
                    )
                    db.add(val_q)
                    db.flush()
                    collected_val_ids.append(val_q.validated_id)

            # Store route level observation
            db.add(IndexObservation(
                period_date=obs_date,
                granularity="daily",
                route_id=r_code,
                route_weight=weights[r_code],
                base_period=settings.BASE_PERIOD,
                price_relative=r_rel,
                apix_value=r_rel,
                contributing_validated_ids=json.dumps(collected_val_ids[:5]),
                coverage_ratio=1.0
            ))

        # Store National Index Observation
        decomp_diff = target_apix - 100.0
        db.add(IndexObservation(
            period_date=obs_date,
            granularity="daily",
            route_id="NATIONAL",
            route_weight=1.0,
            base_period=settings.BASE_PERIOD,
            price_relative=target_apix,
            apix_value=target_apix,
            route_effect=round(decomp_diff * 0.42, 2),
            carrier_effect=round(decomp_diff * 0.15, 2),
            lead_time_effect=round(decomp_diff * 0.28, 2),
            tax_fee_effect=round(decomp_diff * 0.08, 2),
            availability_effect=round(decomp_diff * 0.07, 2),
            contributing_validated_ids=json.dumps(collected_val_ids),
            coverage_ratio=0.96
        ))

        # Store Data Quality Run
        db.add(DataQualityRun(
            run_timestamp=datetime.datetime.combine(obs_date, datetime.time(23, 59)),
            quotes_collected=len(collected_val_ids),
            valid_quotes=len(collected_val_ids),
            duplicates=0,
            missing_invalid=0,
            sold_out=2,
            outliers_removed=0,
            completeness_score=0.98,
            freshness_score=1.0,
            validity_score=1.0,
            duplicate_rate=0.0,
            overall_quality_score=0.985
        ))

    db.commit()
    logger.info("30-day historical seed completed successfully.")
