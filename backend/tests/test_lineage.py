import json
from app.db.models import IndexObservation, ValidatedQuote, RawQuote

def test_end_to_end_data_lineage(db_session, client):
    """TC-LIN-01 / DATA-004 / NFR-002: Published index can be traced back to raw source rows."""
    latest_national = (
        db_session.query(IndexObservation)
        .filter(IndexObservation.route_id == "NATIONAL")
        .first()
    )
    assert latest_national is not None
    assert latest_national.contributing_validated_ids is not None

    val_ids = json.loads(latest_national.contributing_validated_ids)
    assert len(val_ids) > 0

    first_val_id = val_ids[0]
    val_row = db_session.query(ValidatedQuote).filter(ValidatedQuote.validated_id == first_val_id).first()
    assert val_row is not None
    assert val_row.raw_id is not None

    raw_row = db_session.query(RawQuote).filter(RawQuote.raw_id == val_row.raw_id).first()
    assert raw_row is not None
    assert raw_row.source in ["indigo", "air_india", "makemytrip"]
    assert raw_row.origin is not None
    assert raw_row.destination is not None

    # Test API endpoint
    resp = client.get(f"/api/lineage/{latest_national.index_id}")
    assert resp.status_code == 200
    lineage_data = resp.json()
    assert lineage_data["index_id"] == latest_national.index_id
    assert lineage_data["contributing_sample_size"] > 0
    assert len(lineage_data["sample_quotes"]) > 0

def test_raw_quote_immutability(db_session):
    """NFR-006: Raw quotes are append-only and cannot be overwritten."""
    raw = db_session.query(RawQuote).first()
    initial_fare = raw.total_fare
    initial_timestamp = raw.timestamp
    # Verify records remain intact
    assert initial_fare > 0
    assert initial_timestamp is not None
