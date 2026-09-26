"""Unit tests for statistical index helper utilities."""
from app.utils.statistics import calculate_median, calculate_iqr_bounds, calculate_geometric_mean

def test_calculate_median_odd_and_even():
    assert calculate_median([100.0, 200.0, 300.0]) == 200.0
    assert calculate_median([100.0, 200.0, 300.0, 400.0]) == 250.0
    assert calculate_median([]) == 0.0

def test_calculate_iqr_bounds():
    # Regular distribution
    vals = [1000.0, 1100.0, 1200.0, 1300.0, 1400.0, 1500.0, 1600.0, 5000.0]
    lower, upper = calculate_iqr_bounds(vals)
    assert lower >= 0.0
    assert upper < 5000.0

def test_calculate_geometric_mean():
    assert round(calculate_geometric_mean([2.0, 8.0]), 2) == 4.0
    assert calculate_geometric_mean([]) == 0.0
