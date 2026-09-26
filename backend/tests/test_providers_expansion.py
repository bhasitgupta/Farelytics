import datetime
from app.adapters.akasa import AkasaAirProvider
from app.adapters.spicejet import SpiceJetProvider
from app.adapters.registry import provider_registry
from app.adapters.base import BaseProvider

def test_akasa_and_spicejet_providers():
    akasa = AkasaAirProvider()
    spicejet = SpiceJetProvider()

    travel_date = datetime.date.today() + datetime.timedelta(days=7)
    q_akasa = akasa.collect_quotes("DEL", "BOM", travel_date, 7)
    assert len(q_akasa) == 1
    assert q_akasa[0]["airline"] == "QP"
    assert q_akasa[0]["source"] == "akasa"
    assert q_akasa[0]["lead_time"] == 7
    assert q_akasa[0]["total_fare"] > 0

    q_sj = spicejet.collect_quotes("DEL", "BLR", travel_date, 15)
    assert len(q_sj) == 1
    assert q_sj[0]["airline"] == "SG"
    assert q_sj[0]["source"] == "spicejet"
    assert q_sj[0]["lead_time"] == 15
    assert q_sj[0]["total_fare"] > 0

def test_challenge_detection():
    provider = AkasaAirProvider()
    # 403 / 429 status detection
    assert provider.detect_challenge(403, "Forbidden") is True
    assert provider.detect_challenge(429, "Too Many Requests") is True

    # Cloudflare / CAPTCHA HTML detection
    html_cf = "<html><head><title>Just a moment...</title></head><body><div class='cf-turnstile'></div></body></html>"
    assert provider.detect_challenge(200, html_cf) is True

    html_clean = "<html><body>Flight search results for DEL to BOM</body></html>"
    assert provider.detect_challenge(200, html_clean) is False

def test_provider_registry_all_sources():
    providers = provider_registry.list_providers()
    provider_ids = [p["provider_id"] for p in providers]
    assert "indigo" in provider_ids
    assert "air_india" in provider_ids
    assert "akasa" in provider_ids
    assert "spicejet" in provider_ids
    assert "makemytrip" in provider_ids

def test_routes_and_providers_endpoints(client):
    r_providers = client.get("/api/providers")
    assert r_providers.status_code == 200
    providers_data = r_providers.json()
    assert len(providers_data) >= 5

    r_routes = client.get("/api/routes")
    assert r_routes.status_code == 200
    routes_data = r_routes.json()
    assert len(routes_data) >= 7

    r_scheduler = client.get("/api/scheduler/status")
    assert r_scheduler.status_code == 200
    scheduler_data = r_scheduler.json()
    assert "is_running" in scheduler_data

def test_idempotent_pipeline_execution(client):
    today = datetime.date.today().isoformat()
    r1 = client.post(f"/api/pipeline/run?date={today}")
    assert r1.status_code == 200
    data1 = r1.json()

    # Re-running on same date must succeed and not crash with unique constraint errors
    r2 = client.post(f"/api/pipeline/run?date={today}")
    assert r2.status_code == 200
    data2 = r2.json()
    assert data1["date"] == data2["date"]
