import datetime
import json
import random
from typing import Any
from app.adapters.base import BaseSourceAdapter

class IndiGoAdapter(BaseSourceAdapter):
    def __init__(self):
        super().__init__(
            source_id="indigo",
            name="IndiGo Direct Portal",
            base_url="https://www.goindigo.in"
        )
        # IndiGo terms restrict robots.txt automated mining
        # Adapter defaults to compliant authorized mock/replay mode
        self.is_authorized = True

    def fetch_live_quotes(
        self,
        origin: str,
        destination: str,
        travel_date: datetime.date,
        lead_time: int
    ) -> list[dict[str, Any]]:
        # In actual production with official airline API credentials:
        # call airlines partner API. For demo/prototype compliance:
        return self.get_fallback_quotes(origin, destination, travel_date, lead_time)

    def get_fallback_quotes(
        self,
        origin: str,
        destination: str,
        travel_date: datetime.date,
        lead_time: int
    ) -> list[dict[str, Any]]:
        base_route_fares = {
            "DEL-BOM": 4200.0,
            "DEL-BLR": 5100.0,
            "BOM-BLR": 3100.0,
            "DEL-CCU": 4400.0,
            "BLR-HYD": 2400.0,
            "MAA-DEL": 4900.0,
            "DEL-HYD": 3800.0,
        }
        route_key = f"{origin}-{destination}"
        nominal_base = base_route_fares.get(route_key, 4000.0)

        # Advance purchase elasticity multiplier
        lead_time_mult = {
            1: 2.10,   # T+1 urgent / surge
            7: 1.45,   # T+7 weekly
            15: 1.18,  # T+15 mid-horizon
            30: 1.00,  # T+30 standard baseline
            45: 0.90   # T+45 early bird
        }.get(lead_time, 1.0)

        # Predictable pseudo-random variation based on date to preserve determinism
        date_hash = int(travel_date.strftime("%Y%m%d")) % 100
        variation = 0.96 + (date_hash / 1000.0) * 8.0  # ~0.96 to ~1.04

        calc_base = round(nominal_base * lead_time_mult * variation, 2)
        taxes = round(calc_base * 0.05, 2)       # 5% GST economy
        udf = 450.0                               # UDF
        airport_fee = 180.0                       # Aviation security fee
        convenience_fee = 299.0                   # Web convenience fee
        total = round(calc_base + taxes + udf + airport_fee + convenience_fee, 2)

        # 3% chance of sold_out on T+1 for realistic availability testing
        availability = "sold_out" if (lead_time == 1 and (date_hash % 25 == 0)) else "available"

        flight_num = f"6E-{200 + (date_hash % 800)}"

        quote = {
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "source": self.source_id,
            "airline": "6E",
            "origin": origin,
            "destination": destination,
            "departure_date": travel_date.isoformat(),
            "return_date": None,
            "lead_time": lead_time,
            "fare_class": "Economy Saver",
            "base_fare": calc_base,
            "taxes": taxes,
            "airport_fee": airport_fee,
            "udf": udf,
            "convenience_fee": convenience_fee,
            "total_fare": total,
            "currency": "INR",
            "availability": availability,
            "scrape_method": "adapter_replay",
            "source_url": f"{self.base_url}/booking/select?from={origin}&to={destination}",
            "flight_number": flight_num,
            "raw_payload": json.dumps({"carrier": "IndiGo", "tier": "Saver", "flight": flight_num, "seat_avail": 12 if availability == "available" else 0})
        }
        return [quote]
