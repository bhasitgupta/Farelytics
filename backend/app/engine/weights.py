from app.config import settings

def get_route_weights() -> dict[str, float]:
    """
    Computes normalized route weights summing to 1.0 from DGCA passenger traffic statistics (ALGO-005).
    Weights are labeled 'prototype weights' per ASSUMPTION-002 / QA-007.
    """
    raw_traffic = settings.DGCA_ROUTE_TRAFFIC
    total_traffic = sum(raw_traffic.values())
    
    weights = {
        route: round(traffic / total_traffic, 5)
        for route, traffic in raw_traffic.items()
    }
    
    # Normalize to ensure exact 1.0 sum
    diff = round(1.0 - sum(weights.values()), 5)
    first_route = next(iter(weights))
    weights[first_route] = round(weights[first_route] + diff, 5)
    
    return weights
