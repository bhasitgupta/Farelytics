"""Data validation rules for raw airfare quotes."""
from typing import Dict, Any, List

REQUIRED_QUOTE_FIELDS = [
    "origin", "destination", "airline", "travel_date", 
    "total_fare", "base_fare", "lead_time"
]

def validate_quote_integrity(quote: Dict[str, Any]) -> List[str]:
    """Validate quote dictionary fields and return list of validation errors."""
    errors = []
    for field in REQUIRED_QUOTE_FIELDS:
        if field not in quote or quote[field] is None:
            errors.append(f"Missing required field: {field}")
            
    if "total_fare" in quote and quote["total_fare"] is not None:
        if quote["total_fare"] <= 0:
            errors.append("Total fare must be strictly positive")
        if quote["total_fare"] > 250000:
            errors.append("Total fare exceeds reasonable domestic threshold")
            
    if "base_fare" in quote and quote["base_fare"] is not None:
        if quote["base_fare"] < 0:
            errors.append("Base fare cannot be negative")
            
    return errors
