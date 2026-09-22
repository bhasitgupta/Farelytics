import datetime
from app.engine.backtest import run_30_day_backtest

def test_30_day_backtest_metrics():
    """TC-IDX-03 / TC-F7-01: Backtest computes MAE, RMSE, Pearson r, and directional accuracy."""
    dates = [(datetime.date(2026, 8, 1) + datetime.timedelta(days=i)).isoformat() for i in range(30)]

    apix_series = [{"date": d, "index": 102.0 + (i * 0.2) + (i % 3) * 0.1} for i, d in enumerate(dates)]
    dgca_series = [{"date": d, "fare_index": 102.1 + (i * 0.19)} for i, d in enumerate(dates)]

    results = run_30_day_backtest(apix_series, dgca_series)

    assert "mae" in results
    assert "rmse" in results
    assert "correlation" in results
    assert "directional_accuracy" in results
    assert results["sample_size"] == 30
    assert results["mae"] >= 0.0
    assert results["rmse"] >= 0.0
    assert -1.0 <= results["correlation"] <= 1.0
    assert 0.0 <= results["directional_accuracy"] <= 100.0

def test_backtest_disclaimer_compliance():
    """TC-F7-02 / ASSUMPTION-003: Mandatory disclaimer language framing external validation."""
    dates = [(datetime.date(2026, 8, 1) + datetime.timedelta(days=i)).isoformat() for i in range(10)]
    apix_series = [{"date": d, "index": 105.0} for d in dates]
    dgca_series = [{"date": d, "fare_index": 105.0} for d in dates]

    res = run_30_day_backtest(apix_series, dgca_series)
    assert "external validation" in res["disclaimer"].lower()
    assert "not proof of official cpi" in res["disclaimer"].lower()

def test_backtest_api_endpoint(client):
    """TC-API-07: REST endpoint /api/backtest returns 200 and documented schema."""
    resp = client.get("/api/backtest")
    assert resp.status_code == 200
    data = resp.json()
    assert "mae" in data
    assert "rmse" in data
    assert "correlation" in data
    assert "series" in data
    assert len(data["series"]) >= 30
