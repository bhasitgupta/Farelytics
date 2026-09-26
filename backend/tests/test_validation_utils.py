"""Unit tests for raw quote validation utilities."""
from app.utils.validation import validate_quote_integrity

def test_validate_quote_success():
    quote = {
        "origin": "DEL",
        "destination": "BOM",
        "airline": "6E",
        "travel_date": "2026-10-01",
        "total_fare": 4500.0,
        "base_fare": 3800.0,
        "lead_time": 7
    }
    errors = validate_quote_integrity(quote)
    assert len(errors) == 0

def test_validate_quote_negative_fare():
    quote = {
        "origin": "DEL",
        "destination": "BOM",
        "airline": "6E",
        "travel_date": "2026-10-01",
        "total_fare": -50.0,
        "base_fare": 100.0,
        "lead_time": 7
    }
    errors = validate_quote_integrity(quote)
    assert any("strictly positive" in err for err in errors)
