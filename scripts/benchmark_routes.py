"""Utility to benchmark calculation latencies across monitored routes."""
import time
from typing import Dict

ROUTES = ["DEL-BOM", "DEL-BLR", "BOM-BLR", "DEL-CCU", "BLR-HYD", "MAA-DEL", "DEL-HYD"]

def benchmark_calculation() -> Dict[str, float]:
    results = {}
    for route in ROUTES:
        start = time.perf_counter()
        # Simulated median price aggregation
        simulated_prices = [5000.0 + i * 15.0 for i in range(1000)]
        median = sorted(simulated_prices)[len(simulated_prices) // 2]
        elapsed = (time.perf_counter() - start) * 1000.0
        results[route] = round(elapsed, 3)
    return results

if __name__ == "__main__":
    latencies = benchmark_calculation()
    print("Route calculation latencies (ms):", latencies)
