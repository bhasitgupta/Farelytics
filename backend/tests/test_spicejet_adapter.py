"""Unit tests specifically covering SpiceJet adapter behavior."""
import datetime
from app.adapters.spicejet import SpiceJetProvider

def test_spicejet_provider_initialization():
    provider = SpiceJetProvider()
    assert provider.name == "SpiceJet"
    assert provider.airline_code == "SG"

def test_spicejet_quote_collection_fields():
    provider = SpiceJetProvider()
    date_target = datetime.date(2026, 10, 15)
    quotes = provider.collect_quotes("BOM", "BLR", date_target, lead_time=19)
    assert len(quotes) > 0
    q = quotes[0]
    assert q["airline"] == "SG"
    assert q["origin"] == "BOM"
    assert q["destination"] == "BLR"
    assert q["lead_time"] == 19
    assert q["total_fare"] > 0
