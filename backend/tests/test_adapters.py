import datetime
from app.adapters.base import BaseSourceAdapter
from app.adapters.indigo import IndiGoAdapter
from app.adapters.registry import SourceRegistry

class BrokenAdapter(BaseSourceAdapter):
    def __init__(self):
        super().__init__("broken_airline", "Broken Carrier", "https://broken.com")

    def fetch_live_quotes(self, origin, destination, travel_date, lead_time):
        raise ConnectionError("Site down or blocking access")

    def get_fallback_quotes(self, origin, destination, travel_date, lead_time):
        return []

def test_source_failure_isolation():
    """TEST-001 / NFR-005: Failure of one adapter does not crash collection."""
    broken = BrokenAdapter()
    quotes = broken.collect_quotes("DEL", "BOM", datetime.date.today(), 7)
    assert isinstance(quotes, list)
    assert len(quotes) == 0  # Gracefully handled exception, returned empty without crashing

def test_robots_txt_fallback():
    """TC-COMP-01 / TC-F1-03: Compliance restriction triggers demo dataset fallback."""
    indigo = IndiGoAdapter()
    indigo.is_authorized = False  # Simulate access restriction
    assert not indigo.check_compliance()
    quotes = indigo.collect_quotes("DEL", "BOM", datetime.date.today(), 1)
    assert len(quotes) > 0
    assert quotes[0]["airline"] == "6E"
    assert quotes[0]["scrape_method"] == "adapter_replay"

def test_quote_metadata_completeness():
    """TC-F1-04: Stored observations contain timestamp, lead-time, and raw payload."""
    indigo = IndiGoAdapter()
    quotes = indigo.collect_quotes("DEL", "BLR", datetime.date.today(), 15)
    assert len(quotes) == 1
    q = quotes[0]
    assert "timestamp" in q
    assert q["lead_time"] == 15
    assert q["origin"] == "DEL"
    assert q["destination"] == "BLR"
    assert "raw_payload" in q
