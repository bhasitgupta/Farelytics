"""Unit tests verifying outlier fence edge cases."""
from app.utils.statistics import calculate_iqr_bounds

def test_identical_prices_no_spurious_outliers():
    prices = [5000.0] * 10
    lower, upper = calculate_iqr_bounds(prices)
    assert lower == 5000.0
    assert upper == 5000.0

def test_small_sample_boundary():
    prices = [4000.0, 5000.0]
    lower, upper = calculate_iqr_bounds(prices)
    assert lower == 0.0
    assert upper == float("inf")
