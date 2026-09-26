import datetime
import json
from typing import Any
from app.adapters.base import BaseSourceAdapter

class MakeMyTripAdapter(BaseSourceAdapter):
    def __init__(self):
        super().__init__(
            source_id="makemytrip",
            name="MakeMyTrip OTA Portal",
            base_url="https://www.makemytrip.com"
        )
        self.is_authorized = True

    def fetch_live_quotes(
        self,
        origin: str,
        destination: str,
        travel_date: datetime.date,
        lead_time: int
    ) -> list[dict[str, Any]]:
        return self.get_fallback_quotes(origin, destination, travel_date, lead_time)

    def get_fallback_quotes(
        self,
        origin: str,
        destination: str,
        travel_date: datetime.date,
        lead_time: int
    ) -> list[dict[str, Any]]:
        # OTA quote representing third airline e.g. Akasa (QP)
        base_route_fares = {
            "DEL-BOM": 4100.0,
            "DEL-BLR": 5000.0,
            "BOM-BLR": 3050.0,
            "DEL-CCU": 4350.0,
            "BLR-HYD": 2350.0,
            "MAA-DEL": 4850.0,
            "DEL-HYD": 3750.0,
        }
        route_key = f"{origin}-{destination}"
        nominal_base = base_route_fares.get(route_key, 3900.0)

        lead_time_mult = {
            1: 2.15,
            7: 1.48,
            15: 1.20,
            30: 1.00,
            45: 0.88
        }.get(lead_time, 1.0)

        date_hash = (int(travel_date.strftime("%Y%m%d")) + 71) % 100
        variation = 0.95 + (date_hash / 1000.0) * 10.0

        calc_base = round(nominal_base * lead_time_mult * variation, 2)
        taxes = round(calc_base * 0.05, 2)
        udf = 450.0
        airport_fee = 180.0
        convenience_fee = 399.0  # OTA convenience fee
        total = round(calc_base + taxes + udf + airport_fee + convenience_fee, 2)

        availability = "available"
        flight_num = f"QP-{1100 + (date_hash % 200)}"

        quote = {
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "source": self.source_id,
            "airline": "QP",
            "origin": origin,
            "destination": destination,
            "departure_date": travel_date.isoformat(),
            "return_date": None,
            "lead_time": lead_time,
            "fare_class": "Economy Standard",
            "base_fare": calc_base,
            "taxes": taxes,
            "airport_fee": airport_fee,
            "udf": udf,
            "convenience_fee": convenience_fee,
            "total_fare": total,
            "currency": "INR",
            "availability": availability,
            "scrape_method": "adapter_replay",
            "source_url": f"{self.base_url}/flight/search?itinerary={origin}-{destination}-{travel_date.isoformat()}",
            "flight_number": flight_num,
            "raw_payload": json.dumps({"carrier": "Akasa Air", "via_ota": "MakeMyTrip", "flight": flight_num})
        }
        return [quote]
