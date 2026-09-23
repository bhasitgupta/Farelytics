from typing import Any

def detect_and_flag_outliers(normalized_fares: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    Detects statistical price outliers using IQR bounds per route and lead-time window.
    Flags quote as 'outlier' without deleting (FR-004, TEST-005).
    """
    # Group prices by (route_id, lead_time)
    buckets: dict[tuple[str, int], list[float]] = {}
    for f in normalized_fares:
        if f.get("availability_status") == "available":
            key = (f["route_id"], f["lead_time"])
            buckets.setdefault(key, []).append(f["total_consumer_price"])

    # Compute IQR bounds
    bounds: dict[tuple[str, int], tuple[float, float]] = {}
    for key, prices in buckets.items():
        if len(prices) >= 3:
            s_prices = sorted(prices)
            n = len(s_prices)
            q25 = s_prices[int(0.25 * (n - 1))]
            q75 = s_prices[int(0.75 * (n - 1))]
            iqr = q75 - q25
            lower = max(500.0, q25 - 1.75 * iqr)
            upper = q75 + 2.0 * iqr
            bounds[key] = (lower, upper)
        else:
            bounds[key] = (800.0, 35000.0)

    # Flag outliers
    flagged_records = []
    for f in normalized_fares:
        rec = dict(f)
        key = (rec["route_id"], rec["lead_time"])
        lower, upper = bounds.get(key, (800.0, 35000.0))
        price = rec["total_consumer_price"]

        if price < lower or price > upper:
            rec["quality_flag"] = "outlier"
        flagged_records.append(rec)

    return flagged_records


def compute_data_quality_metrics(
    total_collected: int,
    valid_count: int,
    duplicate_count: int,
    missing_invalid_count: int,
    sold_out_count: int,
    outliers_count: int
) -> dict[str, float]:
    """
    Computes per-run Data Quality Score (FEATURE-006, TC-F6-01).
    Returns completeness, freshness, validity, duplicate rate, and overall score.
    """
    if total_collected <= 0:
        return {
            "completeness_score": 0.0,
            "freshness_score": 1.0,
            "validity_score": 0.0,
            "duplicate_rate": 0.0,
            "overall_quality_score": 0.0
        }

    validity = max(0.0, min(1.0, (total_collected - missing_invalid_count) / float(total_collected)))
    completeness = max(0.0, min(1.0, valid_count / float(total_collected)))
    dup_rate = max(0.0, min(1.0, duplicate_count / float(total_collected)))
    freshness = 1.0

    overall = round(
        completeness * 0.35 +
        validity * 0.35 +
        (1.0 - dup_rate) * 0.20 +
        freshness * 0.10,
        3
    )

    return {
        "completeness_score": round(completeness, 3),
        "freshness_score": round(freshness, 3),
        "validity_score": round(validity, 3),
        "duplicate_rate": round(dup_rate, 3),
        "overall_quality_score": overall
    }
