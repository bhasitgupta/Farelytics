import asyncio
import datetime
import logging
from typing import Optional
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.pipeline.orchestrator import PipelineOrchestrator

logger = logging.getLogger(__name__)

class CollectionScheduler:
    """
    Server-side background collection scheduler.
    Runs periodic data collection cycles without requiring browser interaction.
    """
    def __init__(self, interval_hours: int = 24):
        self.interval_seconds = interval_hours * 3600
        self.is_running = False
        self._task: Optional[asyncio.Task] = None
        self.last_run_time: Optional[datetime.datetime] = None
        self.last_run_status: str = "idle"
        self.last_error: Optional[str] = None

    async def _run_loop(self):
        logger.info(f"Collection scheduler started (Interval: {self.interval_seconds}s)")
        while self.is_running:
            try:
                self.last_run_status = "running"
                db: Session = SessionLocal()
                try:
                    orchestrator = PipelineOrchestrator(db)
                    today = datetime.date.today()
                    logger.info(f"Executing scheduled collection cycle for {today}...")
                    result = orchestrator.run_collection_cycle(today)
                    self.last_run_time = datetime.datetime.now(datetime.timezone.utc)
                    self.last_run_status = f"success (APIx: {result['apix_value']})"
                    self.last_error = None
                    logger.info(f"Scheduled collection finished: {self.last_run_status}")
                finally:
                    db.close()
            except Exception as e:
                self.last_run_status = "failed"
                self.last_error = str(e)
                logger.error(f"Scheduled collection run failed: {e}")

            # Sleep until next scheduled cycle
            try:
                await asyncio.sleep(self.interval_seconds)
            except asyncio.CancelledError:
                break

    def start(self):
        if not self.is_running:
            self.is_running = True
            loop = asyncio.get_event_loop()
            self._task = loop.create_task(self._run_loop())

    def stop(self):
        if self.is_running and self._task:
            self.is_running = False
            self._task.cancel()
            logger.info("Collection scheduler stopped.")

    def get_status(self) -> dict:
        return {
            "is_running": self.is_running,
            "interval_seconds": self.interval_seconds,
            "last_run_time": self.last_run_time.isoformat() if self.last_run_time else None,
            "last_run_status": self.last_run_status,
            "last_error": self.last_error
        }

scheduler = CollectionScheduler()
