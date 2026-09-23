import datetime
from typing import Any, Tuple

REQUIRED_FIELDS = [
    "source", "airline", "origin", "destination",
    "departure_date", "lead_time", "total_fare"
]

def validate_raw_quote(quote: dict[str, Any]) -> Tuple[bool, str]:
    """
    Validates raw quote schema (DATA-001 / TC-SCH-01).
    Rejects malformed quotes or missing mandatory fields.
    """
    for field in REQUIRED_FIELDS:
        if field not in quote or quote[field] is None:
            return False, f"Missing required field: {field}"

    if not isinstance(quote["lead_time"], int) or quote["lead_time"] <= 0:
        return False, f"Invalid lead_time: {quote.get('lead_time')}"

    try:
        total = float(quote["total_fare"])
        if total <= 0:
            return False, f"Non-positive total_fare: {total}"
    except (ValueError, TypeError):
        return False, f"Invalid numeric total_fare: {quote.get('total_fare')}"

    # Origin & destination format check
    if len(str(quote["origin"])) != 3 or len(str(quote["destination"])) != 3:
        return False, f"Invalid IATA city codes: {quote.get('origin')}-{quote.get('destination')}"

    return True, "valid"
