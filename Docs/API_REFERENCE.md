# Farelytics REST API Reference

All endpoints conform to standard JSON REST contracts and return descriptive HTTP status codes.

## Base URL
- Production: `https://farelytics.vercel.app/api`
- Local Development: `http://127.0.0.1:8000/api`

---

## 1. Index Endpoints

### `GET /api/index/current`
Returns current national Farelytics composite index, base period, and coverage.

**Response `200 OK`:**
```json
{
  "index": 104.28,
  "period": "2026-09-26",
  "base_period": "2026-08-01",
  "coverage": 0.985,
  "weight_source": "DGCA 2023-24 Passenger Traffic",
  "decomposition": {
    "trend": 102.1,
    "carrier_mix": 1.15,
    "distance": 0.42,
    "advance_purchase": 0.61
  }
}
```

### `GET /api/index/history`
Returns historical index values.
- Query Parameter: `granularity` (`daily`, `weekly`, `monthly`)

### `GET /api/index/routes`
Returns per-route index values and assigned DGCA passenger traffic weights.

---

## 2. Market Data Endpoints

### `GET /api/fares`
Query raw and normalized flight fare observations.
- Parameters: `route`, `airline`, `lead_time`, `limit`, `offset`

### `GET /api/quality`
System health, duplicate rates, coverage ratios, and freshness timestamps.

### `GET /api/backtest`
Simulated 30-day index comparisons against benchmark official inflation metrics.

### `GET /api/providers`
Status of carrier adapters (IndiGo, Air India, Akasa, SpiceJet, MakeMyTrip).

### `GET /api/lineage/{id}`
Full provenance trail for an observation: collection timestamp, raw payload hash, normalization rules applied.
