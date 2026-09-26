"""Generate synthetic quote batches for load and stress testing."""
import random
import datetime
from typing import List, Dict, Any

ROUTES = ["DEL-BOM", "DEL-BLR", "BOM-BLR", "DEL-CCU", "BLR-HYD", "MAA-DEL", "DEL-HYD"]
AIRLINES = ["6E", "AI", "QP", "SG"]
LEAD_TIMES = [1, 7, 15, 30, 45]

def generate_quotes(count: int = 100) -> List[Dict[str, Any]]:
    quotes = []
    base_date = datetime.date.today()
    for i in range(count):
        route = random.choice(ROUTES)
        origin, dest = route.split("-")
        lead = random.choice(LEAD_TIMES)
        fare = round(random.uniform(3200, 11500), 2)
        quotes.append({
            "route": route,
            "origin": origin,
            "destination": dest,
            "airline": random.choice(AIRLINES),
            "lead_time": lead,
            "travel_date": (base_date + datetime.timedelta(days=lead)).strftime("%Y-%m-%d"),
            "total_fare": fare,
            "base_fare": round(fare * 0.82, 2),
            "taxes_fees": round(fare * 0.18, 2)
        })
    return quotes

if __name__ == "__main__":
    dataset = generate_quotes(5)
    print(f"Generated sample quote count: {len(dataset)}")
