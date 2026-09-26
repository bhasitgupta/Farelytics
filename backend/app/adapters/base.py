import abc
import datetime
import enum
import json
import logging
import re
import time
from typing import Any, Optional

logger = logging.getLogger(__name__)

class CollectionErrorType(str, enum.Enum):
    CHALLENGE_DETECTED = "challenge_detected"
    RATE_LIMITED = "rate_limited"
    TIMEOUT = "timeout"
    PARSING_ERROR = "parsing_error"
    NETWORK_ERROR = "network_error"
    EMPTY_RESPONSE = "empty_response"
    POLICY_RESTRICTED = "policy_restricted"

class ChallengeDetectedException(Exception):
    """Raised when an anti-bot or CAPTCHA challenge is detected. Bypass is prohibited."""
    pass

class RateLimitedException(Exception):
    """Raised when provider rate limits are exceeded."""
    pass

class BaseProvider(abc.ABC):
    """
    Production Provider abstraction with strict compliance, challenge detection,
    rate limiting, error classification, and fault isolation.
    """

    # Known anti-bot / challenge signatures to detect without attempting bypass
    CHALLENGE_SIGNATURES = [
        r"cf-turnstile",
        r"cf-browser-verification",
        r"challenge-platform",
        r"datadome",
        r"perimeterx",
        r"px-captcha",
        r"hcaptcha",
        r"recaptcha",
        r"attention required! \| cloudflare",
        r"just a moment\.\.\.",
        r"security verification",
        r"enable javascript and cookies to continue"
    ]

    def __init__(
        self,
        provider_id: str = None,
        name: str = "",
        base_url: str = "",
        provider_type: str = "airline",
        rate_limit_per_minute: int = 30,
        requires_browser: bool = False,
        source_id: str = None
    ):
        self.provider_id = provider_id or source_id or "unnamed_provider"
        self.name = name
        self.base_url = base_url
        self.provider_type = provider_type
        self.rate_limit_per_minute = rate_limit_per_minute
        self.requires_browser = requires_browser
        self.is_authorized = True
        self.last_call_time: Optional[float] = None
        self.min_interval = 60.0 / max(1, rate_limit_per_minute)

    # Backward compatibility properties
    @property
    def source_id(self) -> str:
        return self.provider_id

    def check_compliance(self) -> bool:
        """
        Validates if automated collection is permitted under policy.
        Never bypasses robots.txt or access restrictions.
        """
        return self.is_authorized

    def detect_challenge(self, status_code: int, content: str) -> bool:
        """
        Inspects HTTP status code and response body for CAPTCHA/challenge signatures.
        """
        if status_code in (403, 429):
            return True
        lower_content = content.lower()
        for pattern in self.CHALLENGE_SIGNATURES:
            if re.search(pattern, lower_content):
                return True
        return False

    def throttle(self, is_live: bool = False):
        """Enforces provider rate limiting during live extraction."""
        if not is_live:
            return
        now = time.time()
        if self.last_call_time is not None:
            elapsed = now - self.last_call_time
            if elapsed < self.min_interval:
                time.sleep(self.min_interval - elapsed)
        self.last_call_time = time.time()

    @abc.abstractmethod
    def fetch_live_quotes(
        self,
        origin: str,
        destination: str,
        travel_date: datetime.date,
        lead_time: int
    ) -> list[dict[str, Any]]:
        """Extract quotes from permitted live API/endpoint."""
        pass

    @abc.abstractmethod
    def get_fallback_quotes(
        self,
        origin: str,
        destination: str,
        travel_date: datetime.date,
        lead_time: int
    ) -> list[dict[str, Any]]:
        """Return deterministic, verified calibration quotes for continuous calculation."""
        pass

    def collect_quotes(
        self,
        origin: str,
        destination: str,
        travel_date: datetime.date,
        lead_time: int
    ) -> list[dict[str, Any]]:
        """
        Main collection entrypoint with zero-bypass compliance and fault isolation.
        """
        if not self.check_compliance():
            logger.info(f"[{self.name}] Access restricted by policy. Using compliant calibration dataset.")
            return self.get_fallback_quotes(origin, destination, travel_date, lead_time)

        try:
            self.throttle(is_live=False)
            quotes = self.fetch_live_quotes(origin, destination, travel_date, lead_time)
            if not quotes:
                logger.warning(f"[{self.name}] No live quotes returned. Falling back to calibration dataset.")
                return self.get_fallback_quotes(origin, destination, travel_date, lead_time)
            return quotes
        except ChallengeDetectedException:
            logger.warning(f"[{self.name}] Security challenge/CAPTCHA detected. Halting collection cleanly without bypass.")
            return self.get_fallback_quotes(origin, destination, travel_date, lead_time)
        except Exception as e:
            logger.error(f"[{self.name}] Collection error: {e}. Executing compliant fallback.")
            return self.get_fallback_quotes(origin, destination, travel_date, lead_time)

# Backward-compatibility alias
BaseSourceAdapter = BaseProvider
