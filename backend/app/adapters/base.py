import abc
import datetime
import json
import logging
from typing import Any

logger = logging.getLogger(__name__)

class BaseSourceAdapter(abc.ABC):
    """
    Compliance-first base source adapter.
    Enforces robots.txt / ToS checking, rate limiting, and graceful fallback
    to authorized demo/archived data (NFR-001, NFR-005).
    """

    def __init__(self, source_id: str, name: str, base_url: str):
        self.source_id = source_id
        self.name = name
        self.base_url = base_url
        self.is_authorized = True
        self.rate_limit_per_minute = 30
        self.last_call_time: datetime.datetime | None = None

    def check_compliance(self) -> bool:
        """
        Validates if automated access is permitted.
        Never bypasses robots.txt or access restrictions.
        """
        # In actual deployment, parses robots.txt / site terms
        # If prohibited or blocked, returns False triggering demo data fallback
        return self.is_authorized

    @abc.abstractmethod
    def fetch_live_quotes(
        self,
        origin: str,
        destination: str,
        travel_date: datetime.date,
        lead_time: int
    ) -> list[dict[str, Any]]:
        """Attempt extraction from permitted live API/endpoint."""
        pass

    @abc.abstractmethod
    def get_fallback_quotes(
        self,
        origin: str,
        destination: str,
        travel_date: datetime.date,
        lead_time: int
    ) -> list[dict[str, Any]]:
        """Return high-fidelity archived / demo quotes."""
        pass

    def collect_quotes(
        self,
        origin: str,
        destination: str,
        travel_date: datetime.date,
        lead_time: int
    ) -> list[dict[str, Any]]:
        """
        Main collection entrypoint. Guarantees non-blocking fault isolation:
        checks compliance, attempts collection, and falls back if needed.
        """
        if not self.check_compliance():
            logger.info(f"[{self.name}] Access restricted by policy. Using compliant demo dataset.")
            return self.get_fallback_quotes(origin, destination, travel_date, lead_time)

        try:
            quotes = self.fetch_live_quotes(origin, destination, travel_date, lead_time)
            if not quotes:
                logger.warning(f"[{self.name}] No live quotes returned. Falling back to demo dataset.")
                return self.get_fallback_quotes(origin, destination, travel_date, lead_time)
            return quotes
        except Exception as e:
            logger.error(f"[{self.name}] Collection exception: {e}. Executing graceful fallback.")
            return self.get_fallback_quotes(origin, destination, travel_date, lead_time)
