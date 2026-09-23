from app.engine.weights import get_route_weights
from app.engine.index_calculator import (
    calculate_route_median_price,
    calculate_price_relative,
    calculate_national_apix
)
from app.engine.decomposition import calculate_index_decomposition
from app.config import settings

def test_median_route_price_robustness():
    """TC-IDX-01 / TC-F3-01: Median calculation is robust against extreme values."""
    fares = [4500.0, 4700.0, 5000.0, 5200.0, 25000.0]  # One outlier
    med = calculate_route_median_price(fares)
    assert med == 5000.0

def test_price_relative_calculation():
    """TC-F3-02: Price relative R(r,t) = [P(r,t)/P(r,0)] * 100."""
    rel = calculate_price_relative(current_price=6600.0, base_price=6000.0)
    assert rel == 110.0

def test_route_weights_sum_to_one():
    """TC-F3-03: Route weights sum to exactly 1.0."""
    weights = get_route_weights()
    total_w = sum(weights.values())
    assert abs(total_w - 1.0) < 0.0001
    assert len(weights) == 7

def test_index_reproducibility():
    """TC-IDX-02 / NFR-003: Pure function - identical input produces identical APIx."""
    relatives = {
        "DEL-BOM": 105.5,
        "DEL-BLR": 108.2,
        "BOM-BLR": 104.0,
        "DEL-CCU": 106.1,
        "BLR-HYD": 103.8,
        "MAA-DEL": 107.0,
        "DEL-HYD": 105.0
    }
    weights = get_route_weights()
    run1, cov1 = calculate_national_apix(relatives, weights)
    run2, cov2 = calculate_national_apix(relatives, weights)
    assert run1 == run2
    assert cov1 == cov2
    assert cov1 == 1.0

def test_dimensional_decomposition():
    """TC-F3-05: 5-factor decomposition produces all factors."""
    weights = get_route_weights()
    relatives = {r: 106.0 for r in weights}
    decomp = calculate_index_decomposition(
        apix_value=106.0,
        route_relatives=relatives,
        route_weights=weights,
        carrier_medians={"6E": 5000.0, "AI": 5400.0},
        lead_time_medians={1: 7000.0, 7: 5800.0, 15: 5100.0, 30: 4500.0, 45: 4200.0},
        tax_fee_ratio=0.24,
        sold_out_rate=0.02
    )
    for factor in ["route_effect", "carrier_effect", "lead_time_effect", "tax_fee_effect", "availability_effect"]:
        assert factor in decomp
        assert isinstance(decomp[factor], float)

def test_prototype_weights_metadata():
    """TC-F3-06: Weights are explicitly labeled as prototype weights."""
    assert settings.WEIGHT_SOURCE == "prototype"
    assert "Prototype weights derived from DGCA" in settings.WEIGHT_DISCLAIMER
