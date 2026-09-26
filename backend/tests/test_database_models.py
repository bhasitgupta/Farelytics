"""Unit tests for SQLAlchemy models and table metadata."""
from app.db.models import Base, RawQuote, CleanedQuote, RouteIndex

def test_models_table_names():
    tables = Base.metadata.tables
    assert "raw_quotes" in tables
    assert "cleaned_quotes" in tables
    assert "route_indices" in tables

def test_raw_quote_columns():
    cols = [c.name for c in RawQuote.__table__.columns]
    assert "id" in cols
    assert "airline" in cols
    assert "origin" in cols
    assert "destination" in cols
    assert "total_fare" in cols
