import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Farelytics / APIx - Real-Time Airfare Price Index"
    API_PREFIX: str = "/api"
    # Database Settings — Supabase PostgreSQL with transparent SQLite fallback (and /tmp on Vercel)
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")
    SUPABASE_DATABASE_URL: str = os.getenv("SUPABASE_DATABASE_URL", "")
    DATABASE_URL: str = (
        os.getenv("SUPABASE_DATABASE_URL")
        or os.getenv("DATABASE_URL", "sqlite:////tmp/apix.db" if os.getenv("VERCEL") else "sqlite:///./apix.db")
    )
    
    # Authentication & Security
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    JWT_ALGORITHM: str = "HS256"
    REQUIRE_AUTH_FOR_MUTATIONS: bool = os.getenv("REQUIRE_AUTH_FOR_MUTATIONS", "false").lower() == "true"
    BASE_PERIOD: str = "2026-08"
    
    # Configurable Canonical Route Basket (DGCA traffic aligned)
    ROUTE_BASKET: list[str] = [
        "DEL-BOM",
        "DEL-BLR",
        "BOM-BLR",
        "DEL-CCU",
        "BLR-HYD",
        "MAA-DEL",
        "DEL-HYD"
    ]
    
    # Advance purchase lead times in days (T+1, T+7, T+15, T+30, T+45)
    LEAD_TIMES: list[int] = [1, 7, 15, 30, 45]
    
    # Configurable Active Providers
    ACTIVE_PROVIDERS: list[str] = [
        "indigo",
        "air_india",
        "akasa",
        "spicejet",
        "makemytrip"
    ]
    
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
    
    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env",
        extra="ignore"
    )

settings = Settings()
