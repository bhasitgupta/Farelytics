"""Date manipulation and advance purchase horizon utilities."""
import datetime
from typing import List

STANDARD_HORIZONS: List[int] = [1, 7, 15, 30, 45]

def get_departure_date(reference_date: datetime.date, lead_time_days: int) -> datetime.date:
    """Calculate travel date from reference collection date and lead time."""
    return reference_date + datetime.timedelta(days=lead_time_days)

def format_iso_date(dt: datetime.date) -> str:
    """Format date to ISO 8601 YYYY-MM-DD string."""
    return dt.strftime("%Y-%m-%d")

def calculate_lead_time_days(collection_date: datetime.date, travel_date: datetime.date) -> int:
    """Calculate difference in days between collection and departure."""
    delta = travel_date - collection_date
    return max(0, delta.days)
