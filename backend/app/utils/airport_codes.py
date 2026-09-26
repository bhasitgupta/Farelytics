"""Airport metadata and sector definitions for the representative basket."""
from typing import Dict, Any

METRO_AIRPORTS: Dict[str, Dict[str, Any]] = {
    "DEL": {"name": "Indira Gandhi International Airport", "city": "Delhi", "lat": 28.5562, "lon": 77.1000},
    "BOM": {"name": "Chhatrapati Shivaji Maharaj International Airport", "city": "Mumbai", "lat": 19.0896, "lon": 72.8656},
    "BLR": {"name": "Kempegowda International Airport", "city": "Bengaluru", "lat": 13.1986, "lon": 77.7066},
    "CCU": {"name": "Netaji Subhash Chandra Bose International Airport", "city": "Kolkata", "lat": 22.6547, "lon": 88.4467},
    "HYD": {"name": "Rajiv Gandhi International Airport", "city": "Hyderabad", "lat": 17.2403, "lon": 78.4294},
    "MAA": {"name": "Chennai International Airport", "city": "Chennai", "lat": 12.9941, "lon": 80.1709},
}

def is_valid_iata_code(code: str) -> bool:
    """Check if code matches recognized metro airport."""
    return code.upper() in METRO_AIRPORTS

def get_city_for_code(code: str) -> str:
    """Resolve 3-letter IATA code to primary city name."""
    return METRO_AIRPORTS.get(code.upper(), {}).get("city", code)
