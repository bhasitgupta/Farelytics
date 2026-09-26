"""Core statistical constants, tax rates, and canonical route parameters."""
from typing import Dict, List

# Statutory tax and surcharge constants
DEFAULT_GST_RATE: float = 0.05       # 5% GST on economy domestic flights
DEFAULT_UDF_RATE: float = 450.0      # Average User Development Fee (INR)
DEFAULT_CONVENIENCE_FEE: float = 300.0 # Standard OTA convenience fee

# Canonical advance-purchase horizons
CANONICAL_HORIZONS: List[int] = [1, 7, 15, 30, 45]

# Route passenger volume weights based on official DGCA statistics
ROUTE_WEIGHTS: Dict[str, float] = {
    "DEL-BOM": 0.24495,
    "DEL-BLR": 0.19950,
    "BOM-BLR": 0.13889,
    "DEL-CCU": 0.11869,
    "BLR-HYD": 0.10606,
    "MAA-DEL": 0.09848,
    "DEL-HYD": 0.09343
}
