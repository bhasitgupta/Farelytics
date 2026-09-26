"""Unit tests for date calculation helpers."""
import datetime
from app.utils.date_helpers import get_departure_date, format_iso_date, calculate_lead_time_days

def test_get_departure_date():
    ref = datetime.date(2026, 9, 26)
    dep = get_departure_date(ref, 15)
    assert dep == datetime.date(2026, 10, 11)

def test_format_iso_date():
    d = datetime.date(2026, 9, 26)
    assert format_iso_date(d) == "2026-09-26"

def test_calculate_lead_time_days():
    d1 = datetime.date(2026, 9, 26)
    d2 = datetime.date(2026, 10, 3)
    assert calculate_lead_time_days(d1, d2) == 7
