"""Unit tests specifically covering Akasa Air adapter behavior."""
import datetime
from app.adapters.akasa import AkasaAirProvider

def test_akasa_provider_initialization():
    provider = AkasaAirProvider()
    assert provider.name == "Akasa Air"
    assert provider.airline_code == "QP"

def test_akasa_quote_collection_fields():
    provider = AkasaAirProvider()
    date_target = datetime.date(2026, 10, 5)
    quotes = provider.collect_quotes("DEL", "BOM", date_target, lead_time=9)
    assert len(quotes) > 0
    q = quotes[0]
    assert q["airline"] == "QP"
    assert q["origin"] == "DEL"
    assert q["destination"] == "BOM"
    assert q["lead_time"] == 9
    assert q["total_fare"] > 0
