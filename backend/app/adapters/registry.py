import logging
from typing import Dict, List
from app.adapters.base import BaseProvider
from app.adapters.indigo import IndiGoAdapter
from app.adapters.air_india import AirIndiaAdapter
from app.adapters.akasa import AkasaAirProvider
from app.adapters.spicejet import SpiceJetProvider
from app.adapters.mmt import MakeMyTripAdapter

logger = logging.getLogger(__name__)

class ProviderRegistry:
    def __init__(self):
        self._providers: Dict[str, BaseProvider] = {}
        # Register standard airline and OTA providers
        self.register(IndiGoAdapter())
        self.register(AirIndiaAdapter())
        self.register(AkasaAirProvider())
        self.register(SpiceJetProvider())
        self.register(MakeMyTripAdapter())

    def register(self, provider: BaseProvider):
        self._providers[provider.provider_id] = provider
        logger.info(f"Registered provider: {provider.provider_id} ({provider.name})")

    def get(self, provider_id: str) -> BaseProvider | None:
        return self._providers.get(provider_id)

    def list_providers(self) -> List[dict]:
        return [
            {
                "provider_id": p.provider_id,
                "name": p.name,
                "provider_type": p.provider_type,
                "base_url": p.base_url,
                "is_authorized": p.is_authorized,
                "rate_limit_per_minute": p.rate_limit_per_minute,
                "requires_browser": p.requires_browser
            }
            for p in self._providers.values()
        ]

    # Backward compatibility methods
    def list_sources(self) -> List[dict]:
        return [
            {
                "source_id": p.provider_id,
                "name": p.name,
                "base_url": p.base_url,
                "is_authorized": p.is_authorized
            }
            for p in self._providers.values()
        ]

    def set_authorized(self, provider_id: str, authorized: bool):
        provider = self.get(provider_id)
        if provider:
            provider.is_authorized = authorized
            logger.info(f"Set authorization for {provider_id}: {authorized}")

provider_registry = ProviderRegistry()
# Backward-compatibility aliases
source_registry = provider_registry
SourceRegistry = ProviderRegistry
