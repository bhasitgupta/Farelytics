import statistics
from typing import Any
from app.engine.weights import get_route_weights

def calculate_route_median_price(valid_fares: list[float]) -> float | None:
    """
    Computes route-level price as median of valid, available fares (ALGO-001).
    Robust against extreme outliers and availability distortions.
    """
    if not valid_fares:
        return None
    return round(float(statistics.median(valid_fares)), 2)


def calculate_price_relative(current_price: float, base_price: float) -> float:
    """
    Computes price relative against labelled base period (ALGO-002):
    R(r,t) = [ P(r,t) / P(r,0) ] * 100
    """
    if base_price <= 0:
        return 100.0
    return round((current_price / base_price) * 100.0, 3)


def calculate_national_apix(
    route_relatives: dict[str, float],
    route_weights: dict[str, float]
) -> tuple[float, float]:
    """
    Computes weighted national Airfare Price Index APIx(t) = sum(w_r * R(r,t)) (ALGO-003).
    Returns (apix_value, coverage_ratio).
    """
    total_index = 0.0
    active_weight = 0.0

    for route, weight in route_weights.items():
        if route in route_relatives:
            total_index += weight * route_relatives[route]
            active_weight += weight

    coverage = round(active_weight, 3)
    if active_weight > 0:
        normalized_apix = round(total_index / active_weight, 2)
    else:
        normalized_apix = 100.0

    return normalized_apix, coverage
