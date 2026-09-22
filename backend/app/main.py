import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db.session import init_db, SessionLocal
from app.db.seed_data import seed_30_day_history
from app.api.routes import router as api_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB & schema
    logger.info("Initializing APIx database tables...")
    init_db()

    # Pre-seed 30 days of data for immediate evaluation and backtest
    db = SessionLocal()
    try:
        seed_30_day_history(db)
    finally:
        db.close()

    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "APIx is a government-statistics-grade domestic airfare price index platform for India, "
        "designed to augment the Consumer Price Index (CPI) with high-frequency, reproducible price observations."
    ),
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for React dashboard frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "service": settings.PROJECT_NAME,
        "status": "operational",
        "version": "1.0.0",
        "api_docs": "/docs",
        "base_period": settings.BASE_PERIOD,
        "methodology": "Augmentation mechanism for official CPI (NSO/MoSPI/RBI). Not a replacement."
    }
