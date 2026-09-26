"""Unit tests for index factor decomposition."""

def test_decomposition_structure(client):
    resp = client.get("/api/index/current")
    assert resp.status_code == 200
    data = resp.json()
    assert "decomposition" in data
    decomp = data["decomposition"]
    assert isinstance(decomp, dict)
    assert len(decomp) > 0
