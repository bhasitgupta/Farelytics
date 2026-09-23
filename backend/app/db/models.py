import datetime
from sqlalchemy import Column, Integer, BigInteger, String, Float, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class RawQuote(Base):
    __tablename__ = "raw_quotes"

    raw_id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    source = Column(String(50), nullable=False)
    airline = Column(String(20), nullable=False)
    origin = Column(String(10), nullable=False)
    destination = Column(String(10), nullable=False)
    departure_date = Column(Date, nullable=False)
    return_date = Column(Date, nullable=True)
    lead_time = Column(Integer, nullable=False)  # 1, 7, 15, 30, 45
    fare_class = Column(String(50), default="Economy")
    base_fare = Column(Float, nullable=True)
    taxes = Column(Float, nullable=True)
    airport_fee = Column(Float, nullable=True)
    udf = Column(Float, nullable=True)
    convenience_fee = Column(Float, nullable=True)
    total_fare = Column(Float, nullable=True)
    currency = Column(String(10), default="INR")
    availability = Column(String(20), default="available")  # available / sold_out / unknown
    scrape_method = Column(String(50), default="adapter")
    source_url = Column(Text, nullable=True)
    raw_payload = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    validated_quotes = relationship("ValidatedQuote", back_populates="raw_quote")


class ValidatedQuote(Base):
    __tablename__ = "validated_quotes"

    validated_id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True)
    raw_id = Column(BigInteger().with_variant(Integer, "sqlite"), ForeignKey("raw_quotes.raw_id"), nullable=False)
    route_id = Column(String(20), nullable=False)  # DEL-BOM
    carrier = Column(String(20), nullable=False)   # 6E, AI, etc.
    travel_date = Column(Date, nullable=False)
    booking_date = Column(Date, nullable=False)
    lead_time = Column(Integer, nullable=False)
    fare_type = Column(String(50), default="standard_economy")
    base_fare = Column(Float, nullable=False)
    mandatory_taxes = Column(Float, nullable=False)
    mandatory_fees = Column(Float, nullable=False)
    total_consumer_price = Column(Float, nullable=False)
    availability_status = Column(String(20), default="available")
    quality_flag = Column(String(30), default="clean")  # clean / outlier / missing_component / duplicate
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    raw_quote = relationship("RawQuote", back_populates="validated_quotes")


class AirfareQuote(Base):
    __tablename__ = "airfare_quotes"

    quote_id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True)
    origin = Column(String(10), nullable=False)
    destination = Column(String(10), nullable=False)
    airline = Column(String(20), nullable=False)
    source = Column(String(50), nullable=False)
    search_timestamp = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    travel_date = Column(Date, nullable=False)
    advance_days = Column(Integer, nullable=False)
    flight_number = Column(String(20), nullable=True)
    fare_class = Column(String(50), default="Economy")
    base_fare = Column(Float, nullable=True)
    taxes = Column(Float, nullable=True)
    fees = Column(Float, nullable=True)
    total_fare = Column(Float, nullable=True)
    currency = Column(String(10), default="INR")
    availability = Column(String(20), default="available")
    scrape_status = Column(String(20), default="success")
    data_quality_score = Column(Float, default=1.0)


class IndexObservation(Base):
    __tablename__ = "index_observations"

    index_id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True)
    period_date = Column(Date, nullable=False)
    granularity = Column(String(20), nullable=False)  # daily / weekly / monthly
    route_id = Column(String(20), nullable=True)     # NULL or route code (e.g. DEL-BOM)
    route_weight = Column(Float, nullable=True)
    base_period = Column(String(20), nullable=False)
    price_relative = Column(Float, nullable=True)
    apix_value = Column(Float, nullable=False)
    route_effect = Column(Float, default=0.0)
    carrier_effect = Column(Float, default=0.0)
    lead_time_effect = Column(Float, default=0.0)
    tax_fee_effect = Column(Float, default=0.0)
    availability_effect = Column(Float, default=0.0)
    contributing_validated_ids = Column(Text, nullable=True)  # JSON serialized list of IDs
    coverage_ratio = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class DataQualityRun(Base):
    __tablename__ = "data_quality_runs"

    run_id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True)
    run_timestamp = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    quotes_collected = Column(Integer, default=0)
    valid_quotes = Column(Integer, default=0)
    duplicates = Column(Integer, default=0)
    missing_invalid = Column(Integer, default=0)
    sold_out = Column(Integer, default=0)
    outliers_removed = Column(Integer, default=0)
    completeness_score = Column(Float, default=1.0)
    freshness_score = Column(Float, default=1.0)
    validity_score = Column(Float, default=1.0)
    duplicate_rate = Column(Float, default=0.0)
    overall_quality_score = Column(Float, default=1.0)
