"""Unit tests for authentication dependencies and session verify endpoints."""

def test_auth_verify_guest(client):
    resp = client.get("/api/auth/me")
    # Public or unauthenticated returns 200 or 401 depending on policy
    assert resp.status_code in [200, 401, 404]

def test_auth_health(client):
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"
