"""Statistical calculation helpers for Farelytics index engine."""
from typing import List, Tuple
import math

def calculate_median(values: List[float]) -> float:
    """Return median of a list of float values."""
    if not values:
        return 0.0
    sorted_vals = sorted(values)
    n = len(sorted_vals)
    mid = n // 2
    if n % 2 == 1:
        return float(sorted_vals[mid])
    return float((sorted_vals[mid - 1] + sorted_vals[mid]) / 2.0)

def calculate_iqr_bounds(values: List[float], multiplier: float = 1.5) -> Tuple[float, float]:
    """Calculate lower and upper IQR outlier fences."""
    if len(values) < 4:
        return (0.0, float("inf"))
    sorted_vals = sorted(values)
    n = len(sorted_vals)
    
    q1 = sorted_vals[int(n * 0.25)]
    q3 = sorted_vals[int(n * 0.75)]
    iqr = q3 - q1
    
    lower = max(0.0, q1 - multiplier * iqr)
    upper = q3 + multiplier * iqr
    return (float(lower), float(upper))

def calculate_geometric_mean(values: List[float]) -> float:
    """Calculate Jevons elementary price aggregate using geometric mean."""
    valid_vals = [v for v in values if v > 0]
    if not valid_vals:
        return 0.0
    log_sum = sum(math.log(v) for v in valid_vals)
    return math.exp(log_sum / len(valid_vals))
