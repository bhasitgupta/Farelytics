import datetime
from app.pipeline.validator import validate_raw_quote
from app.pipeline.cleaner import deduplicate_quotes, clean_quote_components
from app.pipeline.normalizer import normalize_fare_record
from app.pipeline.quality import detect_and_flag_outliers, compute_data_quality_metrics

def test_schema_validation_rejects_malformed():
    """TC-SCH-01 / TC-F2-01: Reject malformed quotes violating FareObservation schema."""
    bad_quote = {
        "source": "indigo",
        "airline": "6E",
        "origin": "DELHI",  # invalid length
        "destination": "BOM",
        "departure_date": "2026-10-01",
        "lead_time": -5,    # invalid negative
        "total_fare": -100   # invalid negative
    }
    is_valid, reason = validate_raw_quote(bad_quote)
    assert not is_valid
    assert "Invalid lead_time" in reason or "Non-positive total_fare" in reason or "Invalid IATA" in reason

def test_missing_fare_component_handling():
    """TEST-002 / TC-F2-03: Missing fare components are explicitly handled and flagged."""
    incomplete_quote = {
        "source": "air_india",
        "airline": "AI",
        "origin": "DEL",
        "destination": "BOM",
        "departure_date": "2026-10-01",
        "lead_time": 7,
        "base_fare": None,
        "taxes": None,
        "total_fare": 6500.0
    }
    cleaned = clean_quote_components(incomplete_quote)
    assert cleaned["quality_flag"] == "missing_component"
    assert cleaned["base_fare"] > 0
    assert cleaned["taxes"] > 0

def test_sold_out_flight_handling():
    """TEST-003 / TC-F2-06: Sold-out flights are flagged and preserved, not treated as missing/zero."""
    raw = {
        "source": "makemytrip",
        "airline": "QP",
        "origin": "DEL",
        "destination": "BLR",
        "departure_date": datetime.date(2026, 10, 5),
        "lead_time": 1,
        "fare_class": "Economy",
        "base_fare": 5000.0,
        "taxes": 250.0,
        "airport_fee": 180.0,
        "udf": 450.0,
        "convenience_fee": 299.0,
        "total_fare": 6179.0,
        "availability": "sold_out"
    }
    norm = normalize_fare_record(raw, raw_id=101)
    assert norm["availability_status"] == "sold_out"
    assert norm["total_consumer_price"] == 6179.0  # Retains actual last known price
    assert norm["raw_id"] == 101

def test_duplicate_quote_deduplication():
    """TEST-004 / TC-F2-02: Duplicate observations are detected and deduplicated."""
    quote1 = {
        "source": "indigo", "airline": "6E", "origin": "DEL", "destination": "BOM",
        "departure_date": "2026-10-01", "lead_time": 7, "flight_number": "6E-201", "total_fare": 5000.0
    }
    quote2 = dict(quote1)  # Exact duplicate
    quote3 = dict(quote1)
    quote3["flight_number"] = "6E-202"  # Distinct flight

    unique, dup_count = deduplicate_quotes([quote1, quote2, quote3])
    assert len(unique) == 2
    assert dup_count == 1

def test_outlier_flagging_without_deletion():
    """TEST-005 / TC-F2-04: Outliers are flagged but retained, never deleted."""
    fares = [
        {"route_id": "DEL-BOM", "lead_time": 30, "total_consumer_price": 5000.0, "availability_status": "available"},
        {"route_id": "DEL-BOM", "lead_time": 30, "total_consumer_price": 5200.0, "availability_status": "available"},
        {"route_id": "DEL-BOM", "lead_time": 30, "total_consumer_price": 4900.0, "availability_status": "available"},
        {"route_id": "DEL-BOM", "lead_time": 30, "total_consumer_price": 5100.0, "availability_status": "available"},
        {"route_id": "DEL-BOM", "lead_time": 30, "total_consumer_price": 45000.0, "availability_status": "available"}  # Extreme price spike
    ]
    checked = detect_and_flag_outliers(fares)
    assert len(checked) == 5  # No row deleted
    outliers = [f for f in checked if f.get("quality_flag") == "outlier"]
    assert len(outliers) == 1
    assert outliers[0]["total_consumer_price"] == 45000.0

def test_data_quality_score_calculation():
    """TC-F6-01: Data Quality Score reflects completeness, duplicates, and validity."""
    metrics = compute_data_quality_metrics(
        total_collected=100,
        valid_count=95,
        duplicate_count=3,
        missing_invalid_count=2,
        sold_out_count=1,
        outliers_count=1
    )
    assert 0.0 <= metrics["overall_quality_score"] <= 1.0
    assert metrics["completeness_score"] == 0.95
    assert metrics["duplicate_rate"] == 0.03
    assert metrics["validity_score"] == 0.98
