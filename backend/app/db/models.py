import datetime
import uuid
from sqlalchemy import Column, Integer, BigInteger, String, Float, Date, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

def get_uuid_str() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime.datetime:
    return datetime.datetime.now(datetime.timezone.utc)

class Route(Base):
    __tablename__ = "routes"

    route_id = Column(String(10), primary_key=True)  # e.g., 'DEL-BOM'
    origin_airport = Column(String(3), nullable=False)
    destination_airport = Column(String(3), nullable=False)
    distance_km = Column(Integer, nullable=True)
    traffic_weight = Column(Float, default=0.0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    jobs = relationship("CollectionJob", back_populates="route")


class Provider(Base):
    __tablename__ = "providers"

    provider_id = Column(String(50), primary_key=True)  # e.g., 'indigo', 'air_india', 'akasa', 'spicejet'
    name = Column(String(100), nullable=False)
    provider_type = Column(String(30), default="airline", nullable=False)  # airline / ota / aggregator
    base_url = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    rate_limit_per_min = Column(Integer, default=30, nullable=False)
    requires_browser = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    jobs = relationship("CollectionJob", back_populates="provider")


class CollectionJob(Base):
    __tablename__ = "collection_jobs"

    job_id = Column(String(36), primary_key=True, default=get_uuid_str)
    target_date = Column(Date, nullable=False)
    lead_time_days = Column(Integer, nullable=False)
    route_id = Column(String(10), ForeignKey("routes.route_id"), nullable=True)
    provider_id = Column(String(50), ForeignKey("providers.provider_id"), nullable=True)
    status = Column(String(30), default="pending", nullable=False)  # pending, running, completed, failed, challenge_encountered
    quotes_count = Column(Integer, default=0, nullable=False)
    error_type = Column(String(50), nullable=True)  # timeout, challenge_detected, rate_limited, parsing_error
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    route = relationship("Route", back_populates="jobs")
    provider = relationship("Provider", back_populates="jobs")


class RawQuote(Base):
    __tablename__ = "raw_quotes"

    raw_id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True)
    job_id = Column(String(36), nullable=True)
    timestamp = Column(DateTime, default=utc_now, nullable=False)
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
# Refactor progress checkpoint: step 3/6
    validated_quotes = relationship("ValidatedQuote", back_populates="raw_quote")


class ValidatedQuote(Base):
    __tablename__ = "validated_quotes"

    validated_id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True)
    raw_id = Column(BigInteger().with_variant(Integer, "sqlite"), ForeignKey("raw_quotes.raw_id"), nullable=False)
    route_id = Column(String(20), nullable=False)  # DEL-BOM
    carrier = Column(String(20), nullable=False)   # 6E, AI, QP, SG, etc.
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
    route_id = Column(String(20), nullable=True)     # NULL or route code (e.g. DEL-BOM, NATIONAL)
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