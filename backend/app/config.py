import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "APIx - Real-Time Airfare Price Index for India"
    API_PREFIX: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:////tmp/apix.db" if os.getenv("VERCEL") else "sqlite:///./apix.db")
    BASE_PERIOD: str = "2026-08"
    
    # 7 Canonical Route Basket (DGCA traffic aligned)
    ROUTE_BASKET: list[str] = [
        "DEL-BOM",
        "DEL-BLR",
        "BOM-BLR",
        "DEL-CCU",
        "BLR-HYD",
        "MAA-DEL",
        "DEL-HYD"
    ]
    
    # Advance purchase lead times in days
    LEAD_TIMES: list[int] = [1, 7, 15, 30, 45]
    
    # Route passenger traffic (in thousands, annual/quarterly DGCA basis)
    # Used for prototype weighting formula w_r = Traffic_r / sum(Traffic)
    DGCA_ROUTE_TRAFFIC: dict[str, float] = {
        "DEL-BOM": 4850.0,
        "DEL-BLR": 3950.0,
        "BOM-BLR": 2750.0,
        "DEL-CCU": 2350.0,
        "BLR-HYD": 2100.0,
        "MAA-DEL": 1950.0,
        "DEL-HYD": 1850.0
    }
    
    WEIGHT_SOURCE: str = "prototype"
    WEIGHT_DISCLAIMER: str = (
        "Prototype weights derived from DGCA city-pair domestic passenger statistics. "
        "Intended for CPI augmentation methodology demonstration, not official CPI release."
    )
    
    COLLECTION_INTERVAL_HOURS: int = 24
    
    class Config:
        case_sensitive = True

settings = Settings()
