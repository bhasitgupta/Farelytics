# Technical Requirements Document (TRD)
## Real-Time Airfare Price Index (APIx) for India
**Production Specification: Domestic Airfare Price Index Platform**

---

## 1. System Architecture

### 1.1 Source-adapter architecture (compliance-first collection layer)

This is the answer to the hardest judge question — *"how are you legally collecting this data?"* The scraper is never the hero of the architecture; the source-adapter pattern is.

```
                 Source Registry
                       │
        ┌──────────────┼──────────────┐
        ↓               ↓               ↓
  Public/API      Permitted source   Demo dataset
    source        (scrape allowed)    (fallback)
        │               │               │
        └──────────────┼──────────────┘
                       ↓
               Data Normalisation
                       ↓
                 Quality Engine
                       ↓
                Index Calculator
                       ↓
               Dashboard + REST API
```

For any source where live automated extraction isn't authorised, the demo runs on mock/replayed observations instead of a CAPTCHA-bypass mechanism — deliberately the easiest position to defend to judges.

### 1.2 Full recommended MVP architecture

```
                 DATA SOURCES
                      │
        ┌─────────────┼─────────────┐
        ↓             ↓             ↓
     Airline         OTA       Benchmark
     Adapter        Adapter       Data
        │             │             │
        └─────────────┼─────────────┘
                      ↓
               Raw Data Store
                      ↓
             Validation Engine
                      ↓
            Normalisation Layer
                      ↓
          Quality / Outlier Engine
                      ↓
             Statistical Engine
                      ↓
       ┌──────────────┼──────────────┐
       ↓              ↓              ↓
   Route Index    Lead-time       National
                    Index            APIx
       │              │              │
       └──────────────┼──────────────┘
                      ↓
                  Dashboard
                      ↓
                 REST API
```

### 1.3 Component descriptions

| Component | Responsibility |
|---|---|
| Airline / OTA / Benchmark Adapters | Isolate extraction logic per source; enforce robots.txt/ToS checks and rate limits; fall back to demo/archived data if collection is disallowed or blocked |
| Raw Data Store | Immutable, append-only store of every observation with full raw payload and timestamp |
| Validation Engine | Enforces the `FareObservation` schema; rejects/flags malformed rows |
| Normalisation Layer | Maps raw fields into `NormalizedFare`: standardises route IDs, carrier codes, fare types, and computes `total_consumer_price` |
| Quality / Outlier Engine | De-duplicates, flags missing values and statistical outliers, computes the per-run Data Quality Score |
| Statistical Engine | Computes route-level median price, price relatives, weighted aggregation, and the route/carrier/lead-time/tax-fee/availability decomposition |
| Route Index / Lead-time Index / National APIx | Outputs of the Statistical Engine at different aggregation levels |
| Dashboard | Renders the six UI screens from index + quality-engine outputs |
| REST API | Exposes read-only endpoints for NSO/RBI/researchers |

---

## 2. Technology Stack

| Layer | Recommended Technology |
|---|---|
| Scraping / collection | Python — Playwright (preferred) or Scrapy/Selenium, adapter-per-source |
| Data processing | Pandas (or Polars for larger volumes) |
| Database | PostgreSQL |
| Backend / API | FastAPI |
| Scheduling | Celery or APScheduler (cron acceptable as MVP fallback) |
| Dashboard | React + TailwindCSS + Lucide Icons + Three.js/WebGL |
| Deployment | Docker on a cloud VM/container or Vercel serverless |
| Testing | Pytest |

**Do not introduce premature distributed systems complexity** — prioritize statistical defensibility, clean API contracts, and robust data collection.

**Tooling reconciliation (ASSUMPTION-004):** Deploy the FastAPI backend + PostgreSQL on a managed cloud VM/container or Supabase PostgreSQL, and use Vercel for the React dashboard with serverless API integration.

---

## 3. Data Model / Database Schema

### 3.1 `raw_quotes` (append-only — implements DATA-001 `FareObservation`)

```sql
CREATE TABLE raw_quotes (
    raw_id              BIGSERIAL PRIMARY KEY,
    timestamp           TIMESTAMPTZ NOT NULL,
    source              TEXT NOT NULL,
    airline             TEXT NOT NULL,
    origin              TEXT NOT NULL,
    destination         TEXT NOT NULL,
    departure_date      DATE NOT NULL,
    return_date         DATE,
    lead_time           INT NOT NULL,          -- days: 1/7/15/30/45
    fare_class          TEXT,
    base_fare           NUMERIC(10,2),
    taxes               NUMERIC(10,2),
    airport_fee         NUMERIC(10,2),
    udf                 NUMERIC(10,2),
    convenience_fee     NUMERIC(10,2),
    total_fare          NUMERIC(10,2),
    currency            TEXT DEFAULT 'INR',
    availability        TEXT,                  -- available / sold_out / unknown
    scrape_method       TEXT,
    source_url          TEXT,
    created_at          TIMESTAMPTZ DEFAULT now()
);
```

### 3.2 `validated_quotes` (implements DATA-002 `NormalizedFare`)

```sql
CREATE TABLE validated_quotes (
    validated_id            BIGSERIAL PRIMARY KEY,
    raw_id                  BIGINT REFERENCES raw_quotes(raw_id),
    route_id                TEXT NOT NULL,
    carrier                 TEXT NOT NULL,
    travel_date             DATE NOT NULL,
    booking_date            DATE NOT NULL,
    lead_time               INT NOT NULL,
    fare_type               TEXT,
    base_fare               NUMERIC(10,2),
    mandatory_taxes         NUMERIC(10,2),
    mandatory_fees          NUMERIC(10,2),
    total_consumer_price    NUMERIC(10,2) NOT NULL,
    availability_status     TEXT NOT NULL,
    quality_flag            TEXT,               -- outlier / missing_value / duplicate / clean
    created_at               TIMESTAMPTZ DEFAULT now()
);
```

### 3.3 `airfare_quotes` (production-facing / reporting schema — DATA-003)

```sql
CREATE TABLE airfare_quotes (
    quote_id            BIGSERIAL PRIMARY KEY,
    origin              TEXT NOT NULL,
    destination         TEXT NOT NULL,
    airline             TEXT NOT NULL,
    source              TEXT NOT NULL,
    search_timestamp    TIMESTAMPTZ NOT NULL,
    travel_date         DATE NOT NULL,
    advance_days        INT NOT NULL,
    flight_number       TEXT,
    fare_class          TEXT,
    base_fare           NUMERIC(10,2),
    taxes               NUMERIC(10,2),
    fees                NUMERIC(10,2),
    total_fare          NUMERIC(10,2),
    currency             TEXT DEFAULT 'INR',
    availability         TEXT,
    scrape_status         TEXT,
    data_quality_score    NUMERIC(4,3)
);
```

### 3.4 `index_observations` (append-only, implements DATA-004 lineage)

```sql
CREATE TABLE index_observations (
    index_id         BIGSERIAL PRIMARY KEY,
    period_date      DATE NOT NULL,
    granularity      TEXT NOT NULL,       -- daily / weekly / monthly
    route_id         TEXT,
    route_weight     NUMERIC(6,5),
    base_period      TEXT NOT NULL,
    price_relative   NUMERIC(8,3),
    apix_value       NUMERIC(8,3) NOT NULL,
    route_effect     NUMERIC(8,3),
    carrier_effect   NUMERIC(8,3),
    lead_time_effect NUMERIC(8,3),
    tax_fee_effect   NUMERIC(8,3),
    availability_effect NUMERIC(8,3),
    contributing_validated_ids BIGINT[],   -- lineage: which validated_quotes fed this figure
    created_at       TIMESTAMPTZ DEFAULT now()
);
```

**Lineage rule (DATA-004):** `raw_quotes → validated_quotes → index_observations`. Never overwrite `raw_quotes`; every published index figure must resolve back to the specific raw rows via `validated_quotes.raw_id` and `index_observations.contributing_validated_ids`.

---

## 4. API Specification

Base path: `/api` (MVP) → migrating to `/api/v1` in Phase 4.

### `GET /api/index/current`
Returns the latest published APIx value.
```json
{
  "index": 108.42,
  "period": "2026-09-22",
  "base_period": "2026-08",
  "coverage": 0.94
}
```

### `GET /api/index/history`
Query params: `granularity` (daily|weekly|monthly), `from`, `to`.
Returns: array of `{ period, index, base_period, coverage }`.

### `GET /api/index/routes`
Returns per-route index breakdown: `{ route_id, index, weight, price_relative }[]`.

### `GET /api/fares`
Query params: `route_id`, `lead_time`, `from`, `to`. Returns underlying normalised fare records from `validated_quotes`.

### `GET /api/quality`
Query params: `run_id` or `date`. Returns `{ quotes_collected, valid_quotes, duplicates, missing_invalid, sold_out, outliers_removed, quality_score }`.

**Contract requirements:**
- All responses include index value, period, base period and coverage ratio where applicable (FR-002, FEATURE-005).
- Malformed input → `400` with a documented error schema.
- All endpoints are read-only (no POST/PUT/DELETE in MVP).

**Phase-4 versioned surface:** `/api/v1/index`, `/api/v1/routes`, `/api/v1/airlines`, `/api/v1/lead-time`, `/api/v1/metadata`, `/api/v1/quality` — with authentication, rate limits, versioning, documentation and audit logs (scheduled for subsequent release).

---

## 5. Index Calculation — Implementation Notes (Pseudocode)

```python
# Step 1: Route-level price (median, robust to extremes/availability distortions)
def route_price(route_id, t):
    fares = get_valid_fares(route_id, t)   # from validated_quotes, availability_status='available'
    return median(fares)

# Step 2: Price relative vs labelled base period
def price_relative(route_id, t, base_period):
    p_t = route_price(route_id, t)
    p_0 = route_price(route_id, base_period)
    return (p_t / p_0) * 100

# Step 3: DGCA-traffic-derived route weights (sum to 1)
def route_weight(route_id, traffic_by_route):
    return traffic_by_route[route_id] / sum(traffic_by_route.values())

# Step 4: Weighted national aggregation
def apix(t, routes, base_period):
    total = 0
    for r in routes:
        w_r = route_weight(r, traffic_by_route)
        R_r = price_relative(r, t, base_period)
        total += w_r * R_r
    return total   # Σ w_r = 1, so no further division needed

# Step 5: Decomposition (route / carrier / lead-time / tax-fee / availability effects)
def decompose(t, base_period):
    return {
        "route_effect": route_level_contribution(t, base_period),
        "carrier_effect": carrier_level_contribution(t, base_period),
        "lead_time_effect": lead_time_contribution(t, base_period),
        "tax_fee_effect": tax_fee_contribution(t, base_period),
        "availability_effect": availability_contribution(t, base_period),
    }
```

**Reproducibility (NFR-003):** the index calculation must be a pure function of `validated_quotes` + stored route weights + stored base period — no live randomness, no unlogged manual overrides. Re-running on the same snapshot must yield an identical `apix_value`.

**Weight labelling (ASSUMPTION-002):** if `traffic_by_route` is not sourced from an official CPI weighting scheme, persist a `weight_source = 'prototype'` flag alongside each stored weight, and surface it in the dashboard/API.

---

## 6. Deployment & Scheduling

- **Containerisation:** Docker images for (a) FastAPI backend, (b) scheduler/worker (Celery/APScheduler), (c) PostgreSQL (or managed Postgres).
- **Scheduling:** daily collection run via cron/APScheduler/Celery beat; each run writes to `raw_quotes`, then triggers the cleaning → normalisation → index pipeline as a sequence of jobs.
- **Environments:** single cloud VM/container sufficient for MVP (per §17 stack note — no Kubernetes/microservices).
- **Frontend:** React dashboard deployable to Vercel (static) if a Vercel-only deployment is desired, calling the backend API over HTTPS; otherwise deploy alongside the backend on the same VM.

---

## 7. Execution Plan — 36-Hour Technical Work Breakdown

| Hours | Phase | Deliverables |
|---|---|---|
| 0–3 | Research & validation | Final route basket, data schema, source inventory, index methodology, MVP feature list. **Critical question to resolve first:** what exactly constitutes one valid airfare observation? |
| 3–8 | Data engine | Source adapters, collection scheduler, raw quote schema, database, logging |
| 8–13 | Data processing | Deduplication, missing-value handling, fare normalisation, outlier detection, validation |
| 13–18 | Index engine | Base period, route weights, price relatives, daily APIx, weekly/monthly aggregation |
| 18–23 | Dashboard | National APIx, route heatmap, lead-time curve, airline/source comparison, data-quality panel |
| 23–27 | API | `GET /api/index/current`, `/history`, `/routes`, `GET /api/fares`, `GET /api/quality` |
| 27–31 | Backtesting | 30-day comparison of APIx vs. DGCA reference — correlation/deviation/trend analysis |
| 31–34 | Testing + demo prep | Source failure, missing fare, sold-out flight, duplicate quote, extreme price, API failure, DB failure |
| 34–36 | Presentation | Problem → Gap → Solution → Architecture → Data → Index → Dashboard → Backtest → Impact → Future scale |

---

## 8. Technical Risk Notes

- **Legal/compliance (NFR-001, RISK-001, RISK-008):** Air India and IndiGo terms restrict automated data-mining/robots; the source-adapter's robots.txt/ToS check + demo-data fallback (§1.1) is the primary mitigation and should be the first thing shown to judges when questioned on legality.
- **Fault isolation (NFR-005, RISK-007):** one adapter's failure must not crash the scheduler or invalidate index values for unaffected routes — implement per-adapter try/except with logging, and compute index per available route rather than failing the whole run.
- **Don't build CAPTCHA bypass / IP rotation as the "innovation"** — it is both a legal and credibility risk; the differentiator is the statistical methodology, not the scraper's evasiveness.
