import datetime
from typing import Any

def normalize_fare_record(raw_dict: dict[str, Any], raw_id: int) -> dict[str, Any]:
    """
    Transforms raw quote into normalized schema (DATA-002 NormalizedFare).
    Standardizes route, separates base fare, taxes, and fees,
    and handles availability status (FR-005, FR-006, TEST-003).
    """
    origin = raw_dict["origin"].upper()
    dest = raw_dict["destination"].upper()
    route_id = f"{origin}-{dest}"

    # Departure and booking dates
    dep_date = raw_dict["departure_date"]
    if isinstance(dep_date, str):
        dep_date = datetime.date.fromisoformat(dep_date)

    lead_time = int(raw_dict["lead_time"])
    # Booking date = travel_date - lead_time
    booking_date = dep_date - datetime.timedelta(days=lead_time)

    base = float(raw_dict.get("base_fare") or 0.0)
    taxes = float(raw_dict.get("taxes") or 0.0)
    fees = float(raw_dict.get("airport_fee") or 0.0) + \
           float(raw_dict.get("udf") or 0.0) + \
           float(raw_dict.get("convenience_fee") or 0.0)

    # Consumer paid price = base + taxes + fees
    total_consumer_price = round(base + taxes + fees, 2)

    # Availability status
    avail = str(raw_dict.get("availability", "available")).lower()
    if avail not in ["available", "sold_out"]:
        avail = "available"

    quality_flag = raw_dict.get("quality_flag", "clean")

    return {
        "raw_id": raw_id,
        "route_id": route_id,
        "carrier": str(raw_dict.get("airline", "6E")).upper(),
        "travel_date": dep_date,
        "booking_date": booking_date,
        "lead_time": lead_time,
        "fare_type": str(raw_dict.get("fare_class", "Economy")),
        "base_fare": base,
        "mandatory_taxes": taxes,
        "mandatory_fees": round(fees, 2),
        "total_consumer_price": total_consumer_price,
        "availability_status": avail,
        "quality_flag": quality_flag
    }
