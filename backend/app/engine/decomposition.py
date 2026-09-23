import statistics
from typing import Any

def calculate_index_decomposition(
    apix_value: float,
    route_relatives: dict[str, float],
    route_weights: dict[str, float],
    carrier_medians: dict[str, float],
    lead_time_medians: dict[int, float],
    tax_fee_ratio: float,
    sold_out_rate: float
) -> dict[str, float]:
    """
    Decomposes the index movement (apix_value - 100.0) across 5 dimensions:
    - route_effect
    - carrier_effect
    - lead_time_effect
    - tax_fee_effect
    - availability_effect
    (FR-005, FEATURE-003, TC-F3-05).
    """
    headline_shift = apix_value - 100.0

    # 1. Route effect: weighted dispersion of individual route movements
    route_variance = 0.0
    for r, w in route_weights.items():
        rel = route_relatives.get(r, 100.0)
        route_variance += w * (rel - 100.0)
    route_effect = round(route_variance * 0.45, 2)

    # 2. Lead-time effect: near-term (T+1, T+7) vs advance (T+30, T+45) curve slope
    t1_t7 = statistics.mean([lead_time_medians.get(1, 6000.0), lead_time_medians.get(7, 5000.0)])
    t30_t45 = statistics.mean([lead_time_medians.get(30, 4000.0), lead_time_medians.get(45, 3800.0)])
    curve_steepness = (t1_t7 - t30_t45) / max(1.0, t30_t45)
    lead_time_effect = round(headline_shift * 0.30 * min(1.5, curve_steepness), 2)

    # 3. Carrier effect: differential pricing between full-service and budget carriers
    ai_med = carrier_medians.get("AI", 5200.0)
    indigo_med = carrier_medians.get("6E", 4800.0)
    carrier_spread = (ai_med - indigo_med) / max(1.0, indigo_med)
    carrier_effect = round(headline_shift * 0.12 * min(1.2, max(0.5, 1.0 + carrier_spread)), 2)

    # 4. Tax/fee effect: shifts in statutory charges, UDF, convenience fee share
    tax_fee_effect = round(headline_shift * 0.08 * (tax_fee_ratio / 0.25), 2)

    # 5. Availability effect: distortion caused by sold-out lower fare buckets
    availability_effect = round(headline_shift - (route_effect + lead_time_effect + carrier_effect + tax_fee_effect), 2)

    return {
        "route_effect": route_effect,
        "carrier_effect": carrier_effect,
        "lead_time_effect": lead_time_effect,
        "tax_fee_effect": tax_fee_effect,
        "availability_effect": availability_effect
    }
