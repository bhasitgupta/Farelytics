def test_get_current_index(client):
    """TC-API-01: GET /api/index/current returns documented schema with index and coverage."""
    resp = client.get("/api/index/current")
    assert resp.status_code == 200
    data = resp.json()
    assert "index" in data
    assert "period" in data
    assert "base_period" in data
    assert "coverage" in data
    assert "weight_source" in data
    assert "decomposition" in data
    assert data["weight_source"] == "prototype"

def test_get_index_history(client):
    """TC-API-02: GET /api/index/history supports daily, weekly, monthly granularity."""
    # Daily
    resp_daily = client.get("/api/index/history?granularity=daily")
    assert resp_daily.status_code == 200
    assert len(resp_daily.json()) > 0

    # Weekly
    resp_weekly = client.get("/api/index/history?granularity=weekly")
    assert resp_weekly.status_code == 200
    assert len(resp_weekly.json()) > 0

    # Monthly
    resp_monthly = client.get("/api/index/history?granularity=monthly")
    assert resp_monthly.status_code == 200
    assert len(resp_monthly.json()) > 0

def test_get_index_routes(client):
    """TC-API-03: GET /api/index/routes returns per-route weights and price relatives."""
    resp = client.get("/api/index/routes")
    assert resp.status_code == 200
    routes = resp.json()
    assert len(routes) == 7
    total_w = sum(r["weight"] for r in routes)
    assert abs(total_w - 1.0) < 0.001

def test_get_fares(client):
    """TC-API-04: GET /api/fares returns underlying normalized fare records."""
    resp = client.get("/api/fares?limit=10")
    assert resp.status_code == 200
    fares = resp.json()
    assert len(fares) == 10
    first = fares[0]
    assert "total_consumer_price" in first
    assert "route_id" in first
    assert "lead_time" in first

def test_get_quality_metrics(client):
    """TC-API-05: GET /api/quality returns data quality metrics."""
    resp = client.get("/api/quality")
    assert resp.status_code == 200
    q = resp.json()
    assert "overall_quality_score" in q
    assert "completeness_score" in q
    assert "validity_score" in q

def test_invalid_query_params(client):
    """TC-API-06 / TEST-006: Malformed inputs return 400 or 422 with documented schema."""
    # Invalid granularity
    resp = client.get("/api/index/history?granularity=hourly")
    assert resp.status_code == 422 or resp.status_code == 400

    # Invalid date
    resp_date = client.get("/api/index/history?from_date=not-a-date")
    assert resp_date.status_code == 400

def test_lead_time_and_airline_endpoints(client):
    """Validates supplemental visualization endpoints for UI-003, UI-004, UI-005."""
    r_lt = client.get("/api/lead-time-curve")
    assert r_lt.status_code == 200
    assert len(r_lt.json()) == 5  # T+1, T+7, T+15, T+30, T+45

    r_air = client.get("/api/airline-comparison")
    assert r_air.status_code == 200
    assert len(r_air.json()) == 3  # 6E, AI, QP

    r_split = client.get("/api/fare-breakdown")
    assert r_split.status_code == 200
    assert "base_fare_percentage" in r_split.json()

def test_on_demand_pipeline_trigger(client):
    """Validates on-demand pipeline execution."""
    resp = client.post("/api/pipeline/run")
    assert resp.status_code == 200
    data = resp.json()
    assert "apix_value" in data
    assert "data_quality_score" in data
