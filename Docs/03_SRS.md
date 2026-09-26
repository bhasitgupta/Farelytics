# Software Requirements Specification (SRS)
## Real-Time Airfare Price Index (APIx) for India
**Production Specification: Domestic Airfare Price Index Platform**

---

## 1. Purpose & Scope

This SRS specifies the functional, non-functional, data and interface requirements for the APIx MVP: a source-adapter-based collection system, a cleaning/normalisation pipeline, an index-construction engine, a dashboard and a read-only REST API, backed by a mandatory 30-day backtest against DGCA data. Scope boundaries follow the BRD (§5, In/Out of scope).

---

## 2. Functional Requirements

### FEATURE-001 — Data Collection Engine
*Serves: GOAL-001; STAKEHOLDER-001, STAKEHOLDER-003*

| ID | Requirement |
|---|---|
| FR-001 | System shall extract quotes for a configurable basket of routes, each airline/source, and each advance-purchase window (T+1, T+7, T+15, T+30, T+45) |
| FR-002 | Each source shall be implemented as an isolated adapter so a change to one airline's website does not break collection for others |
| FR-003 | Before collecting from any live source, the adapter shall check that automated access is permitted (robots.txt / stated terms) and apply rate-limiting; if not permitted, the adapter shall fall back to an approved/demo/archived dataset rather than attempting to defeat access controls |
| FR-004 | Every observation shall be timestamped and stored with its full raw payload before any cleaning occurs |
| FR-005 | Collection shall run on a schedule (e.g. daily) via a scheduler/cron job, not on-demand per user request |

### FEATURE-002 — Data Cleaning & Normalisation Pipeline
*Serves: GOAL-002; STAKEHOLDER-001, STAKEHOLDER-006*

| ID | Requirement |
|---|---|
| FR-001 | System shall validate every raw quote against a fixed schema before further processing |
| FR-002 | System shall de-duplicate quotes representing the same observation collected more than once |
| FR-003 | System shall handle missing values explicitly (never silently drop a field without a quality flag) |
| FR-004 | System shall detect and flag statistical outliers rather than deleting them outright |
| FR-005 | System shall separate base fare from taxes, airport fee, UDF and convenience fee, and compute a single "total consumer price" per quote |
| FR-006 | System shall mark sold-out/unavailable flights as an availability status, never as a missing or zero-price observation |
| FR-007 | System shall preserve raw quotes unmodified; cleaning/normalisation shall write to separate tables (raw → validated → normalised → indexed) so every published number is traceable back to source |

### FEATURE-003 — Index Construction Engine
*Serves: GOAL-003, GOAL-004; STAKEHOLDER-001, STAKEHOLDER-002*

| ID | Requirement |
|---|---|
| FR-001 | System shall calculate a route-level price as the median of valid fares for that route at time t |
| FR-002 | System shall calculate a route price relative against a labelled base period |
| FR-003 | System shall apply DGCA-traffic-derived route weights (summing to 1) to produce the national index |
| FR-004 | System shall publish the index at daily, weekly and monthly frequencies |
| FR-005 | System shall additionally decompose the index into route effect, carrier effect, lead-time effect, tax/fee effect and availability effect |
| FR-006 | System shall clearly label all weights as "prototype weights" if official CPI weights are not used, and document how they would be replaced/calibrated with official data later |

### FEATURE-004 — Dashboard / Visualisation Layer
*Serves: GOAL-004; STAKEHOLDER-002, STAKEHOLDER-005, STAKEHOLDER-006*

| ID | Requirement |
|---|---|
| FR-001 | System shall present a National Airfare Index trend chart |
| FR-002 | System shall present a route-pair heatmap of price movement |
| FR-003 | System shall present a lead-time elasticity curve (fare vs. T+1/7/15/30/45) |
| FR-004 | System shall present an airline/source comparison view |
| FR-005 | System shall present a base-fare-vs-taxes/fees breakdown |
| FR-006 | System shall present a data-quality panel per collection run |

### FEATURE-005 — REST API
*Serves: GOAL-005; STAKEHOLDER-001, STAKEHOLDER-002, STAKEHOLDER-006*

| ID | Requirement |
|---|---|
| FR-001 | System shall expose current-index, historical-index, per-route, per-fare and data-quality endpoints |
| FR-002 | API responses shall include the index value, the period, the base period and a coverage ratio |

### FEATURE-006 — Data Quality Layer
*Serves: GOAL-001, GOAL-002; STAKEHOLDER-001, STAKEHOLDER-007*

| ID | Requirement |
|---|---|
| FR-001 | System shall compute and expose a Data Quality Score per collection run, based on completeness, freshness, validity, duplicate rate and source consistency |

### FEATURE-007 — Backtesting Module (mandatory per problem statement)
*Serves: GOAL-003; STAKEHOLDER-001, STAKEHOLDER-002, STAKEHOLDER-007*

| ID | Requirement |
|---|---|
| FR-001 | System shall reconstruct APIx over at least 30 historical days and compare it against DGCA monthly average-fare data using MAE, RMSE, correlation and directional accuracy |
| FR-002 | System shall present the backtest as evidence of external validation, not as proof of CPI-grade accuracy |

---

## 3. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-001 | **Legal/compliance:** all automated collection must respect each source's robots.txt and stated terms of service; architecture must be able to swap a blocked/restricted source for an approved API, permitted source, or demo dataset without changing normalisation or index layers |
| NFR-002 | **Auditability:** every published index value must be traceable end-to-end: Index → route contribution → carrier observation → normalised quote → raw source observation |
| NFR-003 | **Reproducibility:** re-running the index calculation on the same stored data must always produce the same result (no hidden randomness or unlogged manual overrides) |
| NFR-004 | **Honesty about frequency:** system must state its true collection frequency precisely and must never claim "real-time" pricing if data is collected on a schedule |
| NFR-005 | **Reliability/fault isolation:** failure of one source adapter must not take down the collection pipeline for other sources, nor invalidate the index for unaffected routes |
| NFR-006 | **Data immutability:** raw observations are never overwritten; corrections happen downstream in cleaned/normalised layers, preserving history |
| NFR-007 | **Statistical defensibility:** index methodology must be explainable in plain language to a non-technical evaluator (route weight, base period, price relative, aggregation) without invoking ML as the explanation |
| NFR-008 | **Scalability path:** architecture must support growing from ~6 routes/2–3 sources to a national basket without a redesign (see PRD roadmap P1–P5) |

---

## 4. Data Requirements

### DATA-001 — Raw observation: `FareObservation`

| Field | Purpose |
|---|---|
| timestamp | When the observation was captured |
| source | Which airline site / OTA it came from |
| airline | Operating carrier |
| origin / destination | City-pair |
| departure_date / return_date | Travel date(s) |
| lead_time | Days between search and departure (T+1/7/15/30/45) |
| fare_class | Fare bucket/product |
| base_fare / taxes / airport_fee / udf / convenience_fee | Individual price components |
| total_fare | Sum consumer-facing price |
| currency | INR |
| availability | Available / sold out / unknown |
| scrape_method | How the observation was obtained |
| source_url | Traceability back to the page/API call |

### DATA-002 — Normalised record: `NormalizedFare`

| Field | Purpose |
|---|---|
| route_id | Canonical route identifier |
| carrier | Operating carrier (standardised code) |
| travel_date / booking_date / lead_time | Standardised date fields |
| fare_type | Standardised fare-class bucket |
| base_fare / mandatory_taxes / mandatory_fees | Standardised component prices |
| total_consumer_price | The figure actually paid — used downstream in the index |
| availability_status | Standardised availability flag |
| quality_flag | Outlier / missing-value / duplicate flag from the quality engine |

### DATA-003 — Production table: `airfare_quotes`

| Field | Purpose |
|---|---|
| quote_id | Unique observation identifier |
| origin / destination | Airport/city |
| airline | Carrier |
| source | Airline site or OTA |
| search_timestamp | Time of observation |
| travel_date | Flight date |
| advance_days | T+1 / T+7 / etc. |
| flight_number | Flight identifier |
| fare_class | Fare bucket |
| base_fare / taxes / fees | Price components |
| total_fare | Consumer-facing price |
| currency | INR |
| availability | Available / sold out |
| scrape_status | Success / failure of the collection attempt |
| data_quality_score | Validation result for this row |

**DATA-004 — Lineage rule:** `raw_quotes → validated_quotes → index_observations`, each a separate, append-only table so any published index figure can be traced back to the exact raw rows that produced it.

---

## 5. Algorithmic / Calculation Requirements

**ALGO-001 — Route-level price:**
```
P(r,t) = Median( valid fares for route r at time t )
```
Median, not mean, because airfare observations can contain extreme values and availability-related distortions.

**ALGO-002 — Route price relative:**
```
R(r,t) = [ P(r,t) / P(r,0) ] × 100
```

**ALGO-003 — Weighted national aggregation:**
```
APIx(t) = Σ_r [ w_r × R(r,t) ],  where Σ_r w_r = 1
```
Equivalent normalised form:
```
Index(t) = [ Σ_i ( w_i × P(i,t)/P(i,0) ) ] / [ Σ_i w_i ] × 100
```

**ALGO-004 — Publication cadence:** Daily APIx, Weekly APIx, Monthly aggregated APIx.

**ALGO-005 — Route weight:**
```
w_r = PassengerTraffic_r / Σ(PassengerTraffic across selected routes)
```

**Dimensional decomposition (differentiator):**
```
National Airfare Index
├── Route effect
├── Carrier effect
├── Lead-time effect
├── Tax/fee effect
└── Availability effect
```

---

## 6. Interface Requirements

### 6.1 REST API (see TRD §16 for full contracts)

| ID | Endpoint | Purpose |
|---|---|---|
| API-001 | `GET /api/index/current` | Latest published APIx value |
| API-002 | `GET /api/index/history` | Historical index series |
| API-003 | `GET /api/index/routes` | Per-route index breakdown |
| API-004 | `GET /api/fares` | Underlying normalised fare records |
| API-005 | `GET /api/quality` | Data-quality metrics for a given run |

### 6.2 UI Screens

| ID | Screen |
|---|---|
| UI-001 | National Airfare Index trend chart |
| UI-002 | Route heatmap |
| UI-003 | Lead-time elasticity curve |
| UI-004 | Airline / source comparison |
| UI-005 | Base fare vs. taxes/fees |
| UI-006 | Data-quality panel |

---

## 7. Constraints and Assumptions

- **ASSUMPTION-001:** ≥30-day backtest against DGCA monthly average-fare data is mandatory and non-negotiable.
- **ASSUMPTION-002:** Unofficial route weights must be labelled "prototype weights" with a stated recalibration plan.
- **ASSUMPTION-003:** DGCA-benchmark correlation is external-validation evidence only, not proof of CPI suitability.
- **ASSUMPTION-004:** Team's standing tooling (Anti Gravity + Claude Code + ChatGPT; Vercel default deployment) may require reconciliation with a Python/FastAPI/PostgreSQL backend (VM or serverless adaptation) — see TRD.

---

## 8. Traceability Matrix (sample)

| Requirement | Traces to Goal | Traces to Stakeholder |
|---|---|---|
| FEATURE-001 (Collection) | GOAL-001 | STAKEHOLDER-001, 003 |
| FEATURE-002 (Cleaning) | GOAL-002 | STAKEHOLDER-001, 006 |
| FEATURE-003 (Index) | GOAL-003, GOAL-004 | STAKEHOLDER-001, 002 |
| FEATURE-005 (API) | GOAL-005 | STAKEHOLDER-001, 002, 006 |
| FEATURE-007 (Backtest) | GOAL-003 | STAKEHOLDER-001, 002, 007 |
| NFR-001 (Compliance) | — | STAKEHOLDER-004, 007 |
| NFR-002 (Auditability) | — | STAKEHOLDER-001, 007 |
