"""Unit tests verifying core constants and weight sums."""
from app.constants import ROUTE_WEIGHTS, CANONICAL_HORIZONS, DEFAULT_GST_RATE

def test_route_weights_sum_to_one():
    total_weight = sum(ROUTE_WEIGHTS.values())
    assert abs(total_weight - 1.0) < 0.0001

def test_canonical_horizons():
    assert len(CANONICAL_HORIZONS) == 5
    assert 1 in CANONICAL_HORIZONS
    assert 45 in CANONICAL_HORIZONS

def test_gst_rate():
    assert DEFAULT_GST_RATE == 0.05
