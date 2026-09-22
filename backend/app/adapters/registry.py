import logging
from typing import Dict
from app.adapters.base import BaseSourceAdapter
from app.adapters.indigo import IndiGoAdapter
from app.adapters.air_india import AirIndiaAdapter
from app.adapters.mmt import MakeMyTripAdapter

logger = logging.getLogger(__name__)

class SourceRegistry:
    def __init__(self):
        self._adapters: Dict[str, BaseSourceAdapter] = {}
        # Register standard adapters
        self.register(IndiGoAdapter())
        self.register(AirIndiaAdapter())
        self.register(MakeMyTripAdapter())

    def register(self, adapter: BaseSourceAdapter):
        self._adapters[adapter.source_id] = adapter
        logger.info(f"Registered adapter: {adapter.source_id} ({adapter.name})")

    def get(self, source_id: str) -> BaseSourceAdapter | None:
        return self._adapters.get(source_id)

    def list_sources(self) -> list[dict]:
        return [
            {
                "source_id": s.source_id,
                "name": s.name,
                "base_url": s.base_url,
                "is_authorized": s.is_authorized
            }
            for s in self._adapters.values()
        ]

    def set_authorized(self, source_id: str, authorized: bool):
        adapter = self.get(source_id)
        if adapter:
            adapter.is_authorized = authorized
            logger.info(f"Set authorization for {source_id}: {authorized}")

source_registry = SourceRegistry()
