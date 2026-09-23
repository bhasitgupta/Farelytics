from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class CurrentIndexResponse(BaseModel):
    index: float
    period: str
    base_period: str
    coverage: float
    weight_source: str
    weight_disclaimer: str
    average_ticket_fare: Optional[float] = None
    base_ticket_fare: Optional[float] = None
    decomposition: Dict[str, float]

class HistoricalIndexPoint(BaseModel):
    period: str
    index: float
    base_period: str
    coverage: float
    route_effect: Optional[float] = 0.0
    carrier_effect: Optional[float] = 0.0
    lead_time_effect: Optional[float] = 0.0
    tax_fee_effect: Optional[float] = 0.0
    availability_effect: Optional[float] = 0.0

class RouteIndexPoint(BaseModel):
    route_id: str
    index: float
    weight: float
    price_relative: float
    base_period: str
    average_fare: Optional[float] = None

class NormalizedFareResponse(BaseModel):
    validated_id: int
    raw_id: int
    route_id: str
    carrier: str
    travel_date: str
    booking_date: str
    lead_time: int
    fare_type: str
    base_fare: float
    mandatory_taxes: float
    mandatory_fees: float
    total_consumer_price: float
    availability_status: str
    quality_flag: str

class DataQualityResponse(BaseModel):
    run_timestamp: str
    quotes_collected: int
    valid_quotes: int
    duplicates: int
    missing_invalid: int
    sold_out: int
    outliers_removed: int
    completeness_score: float
    freshness_score: float
    validity_score: float
    duplicate_rate: float
    overall_quality_score: float

class BacktestResponse(BaseModel):
    mae: float
    rmse: float
    correlation: float
    directional_accuracy: float
    sample_size: int
    series: List[Dict[str, Any]]
    disclaimer: str

class LineageResponse(BaseModel):
    index_id: int
    period_date: str
    apix_value: float
    base_period: str
    contributing_sample_size: int
    sample_quotes: List[NormalizedFareResponse]
