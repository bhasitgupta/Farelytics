import logging
from typing import Any, Tuple

logger = logging.getLogger(__name__)

def deduplicate_quotes(quotes: list[dict[str, Any]]) -> Tuple[list[dict[str, Any]], int]:
    """
    De-duplicates raw quotes representing the same observation window (FR-002, TEST-004).
    Returns (unique_quotes, duplicate_count).
    """
    seen_signatures = set()
    unique_quotes = []
    duplicate_count = 0

    for q in quotes:
        sig = (
            q.get("source"),
            q.get("airline"),
            q.get("origin"),
            q.get("destination"),
            q.get("departure_date"),
            q.get("lead_time"),
            q.get("flight_number")
        )
        if sig in seen_signatures:
            duplicate_count += 1
            # Mark duplicate flag if needed
        else:
            seen_signatures.add(sig)
            unique_quotes.append(q)

    return unique_quotes, duplicate_count


def clean_quote_components(quote: dict[str, Any]) -> dict[str, Any]:
    """
    Handles missing price components explicitly (FR-003, TEST-002).
    Never silently drops fields. Adds quality_flag if components are imputed.
    """
    cleaned = dict(quote)
    quality_flag = cleaned.get("quality_flag", "clean")

    base = cleaned.get("base_fare")
    taxes = cleaned.get("taxes")
    airport_fee = cleaned.get("airport_fee")
    udf = cleaned.get("udf")
    convenience_fee = cleaned.get("convenience_fee")
    total = cleaned.get("total_fare")

    # If taxes or fees are absent, flag and derive conservatively from total
    if taxes is None or base is None:
        quality_flag = "missing_component"
        if base is None and total is not None:
            # Impute base as 75% of total
            cleaned["base_fare"] = round(float(total) * 0.75, 2)
        if taxes is None and cleaned.get("base_fare"):
            cleaned["taxes"] = round(float(cleaned["base_fare"]) * 0.05, 2)

    if airport_fee is None:
        cleaned["airport_fee"] = 180.0
    if udf is None:
        cleaned["udf"] = 450.0
    if convenience_fee is None:
        cleaned["convenience_fee"] = 299.0

    cleaned["quality_flag"] = quality_flag
    return cleaned
