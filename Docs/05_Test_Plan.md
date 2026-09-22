# Test Plan / Test Case Document
## Real-Time Airfare Price Index (APIx) for India
**SIH 2026**

---

## 1. Test Strategy Overview

Priority order for test effort (per the Evaluator's Verdict): **credibility of the measurement > breadth of scraping > visual polish.** Testing should therefore weight index-correctness, data-lineage and backtest-validation tests above UI/rendering tests, and should explicitly demonstrate resilience to the failure modes the problem statement calls out (source blocking, CAPTCHA, missing data, sold-out flights).

**Tools:** Pytest (TOOL-008) for all automated backend/pipeline tests. Data-quality thresholds from the Data Quality Layer (completeness, freshness, validity, duplicate rate, source consistency) define pass/fail bands for quality-related tests.

**Entry criteria:** Data collection engine, cleaning pipeline, index engine and API are code-complete for at least one route/source combination.

**Exit criteria:** All FR/NFR test cases below pass on the demo dataset; the 30-day backtest runs end-to-end and produces MAE/RMSE/correlation figures; all seven failure/edge-case scenarios (§2) pass without crashing the pipeline.

---

## 2. Failure / Edge-Case Scenarios

| ID | Scenario | Precondition | Steps | Expected Result |
|---|---|---|---|---|
| TEST-001 | Source failure | One airline/OTA adapter configured, source endpoint made unreachable | Trigger scheduled collection run | Failing adapter logs an error and is skipped; other adapters complete normally; pipeline does not crash; index computed for unaffected routes (NFR-005) |
| TEST-002 | Missing fare component | Raw quote with `taxes` field absent | Run quote through cleaning pipeline | Missing field is flagged (not silently dropped); quote gets a `quality_flag` indicating incompleteness; total_fare computation handles the gap explicitly (FR-003, FEATURE-002) |
| TEST-003 | Sold-out flight | Raw quote where flight shows no availability | Run quote through normalisation | `availability_status` = 'sold_out'; quote is **not** treated as missing or zero-price; excluded from median price calc but retained in `validated_quotes` (FR-006) |
| TEST-004 | Duplicate quote | Same observation (same route/carrier/date/lead-time/source/timestamp window) collected twice | Run de-duplication step | Second occurrence is flagged/removed; only one contributes to `validated_quotes`; duplicate count reflected in Data Quality Score (FR-002, FEATURE-002) |
| TEST-005 | Extreme/outlier price | Inject a fare far outside the expected range for its route/lead-time | Run outlier detection | Quote is flagged as an outlier, not silently deleted; excluded from median calculation but retained in `raw_quotes` and `validated_quotes` with `quality_flag='outlier'` (FR-004) |
| TEST-006 | API failure | Malformed query param sent to an endpoint; DB temporarily unavailable | Call `GET /api/index/current` with bad input; call again with DB down | Malformed input → `400` with documented error schema; DB outage → graceful `5xx` with clear error, no crash/data corruption |
| TEST-007 | Database failure | DB connection dropped mid-collection-run | Simulate connection loss during a scheduled run | Run fails safely without partial/corrupt writes to `raw_quotes`; failure is logged; next scheduled run recovers normally |

---

## 3. Functional Test Cases (by FR)

### FEATURE-001 — Data Collection Engine

| Test ID | Requirement | Precondition | Steps | Expected Result |
|---|---|---|---|---|
| TC-F1-01 | FR-001 | Route/airline/lead-time basket configured | Run collection for one route across all 5 lead-time windows | One quote per (route, source, lead-time) combination is stored |
| TC-F1-02 | FR-002 | Two source adapters configured | Break one adapter's parsing logic (simulate site change) | Only the broken adapter fails; the other completes normally |
| TC-F1-03 | FR-003 | A source's robots.txt disallows the collection path | Run adapter against that source | Adapter does not attempt live collection; falls back to demo/archived dataset; event is logged |
| TC-F1-04 | FR-004 | — | Run a collection cycle | Every stored observation has a non-null `timestamp` and full raw payload prior to any cleaning |
| TC-F1-05 | FR-005 | Scheduler configured for daily run | Wait for / trigger the scheduled job | Collection executes on schedule without requiring a user request |

### FEATURE-002 — Data Cleaning & Normalisation Pipeline

| Test ID | Requirement | Precondition | Steps | Expected Result |
|---|---|---|---|---|
| TC-F2-01 | FR-001 | A raw quote violating the `FareObservation` schema (e.g. wrong type) | Run schema validation | Quote is rejected/flagged, never silently accepted |
| TC-F2-02 | FR-002 | Duplicate raw quotes present | Run de-duplication | Only one canonical record reaches `validated_quotes` |
| TC-F2-03 | FR-003 | Raw quote missing a non-critical field | Run cleaning | Field is explicitly flagged as missing, not defaulted silently |
| TC-F2-04 | FR-004 | Raw quote with an extreme price | Run outlier detection | Flagged, retained, excluded from aggregation |
| TC-F2-05 | FR-005 | Raw quote with base_fare, taxes, airport_fee, udf, convenience_fee populated | Run normalisation | `total_consumer_price` = sum of components; components remain individually stored |
| TC-F2-06 | FR-006 | Raw quote marked sold out | Run normalisation | `availability_status='sold_out'`; not null/zero price |
| TC-F2-07 | FR-007 | Full pipeline run | Query `raw_quotes`, `validated_quotes`, `index_observations` for one figure | Original raw row is unmodified; lineage from index value back to raw row is resolvable |

### FEATURE-003 — Index Construction Engine

| Test ID | Requirement | Precondition | Steps | Expected Result |
|---|---|---|---|---|
| TC-F3-01 | FR-001 | A fixed set of fares for one route/time | Compute route price | Result equals the median of valid (non-outlier, non-sold-out) fares |
| TC-F3-02 | FR-002 | Base period and current period prices known | Compute price relative | `R(r,t) = P(r,t)/P(r,0) × 100`, matches manual calculation |
| TC-F3-03 | FR-003 | Route weights configured, summing to 1 | Compute national APIx | `Σ w_r = 1` enforced; APIx = weighted sum of price relatives |
| TC-F3-04 | FR-004 | Sufficient historical data | Request daily, weekly, monthly index | All three granularities are published and internally consistent |
| TC-F3-05 | FR-005 | Full pipeline run | Query index decomposition | route/carrier/lead-time/tax-fee/availability effects are all present and sum consistently with the headline figure |
| TC-F3-06 | FR-006 | No official CPI weights supplied | Compute weights | Weights are labelled `weight_source='prototype'` in storage and surfaced in API/dashboard |

### FEATURE-004 — Dashboard

| Test ID | Requirement | Precondition | Steps | Expected Result |
|---|---|---|---|---|
| TC-F4-01–06 | UI-001–006 | Known fixture dataset loaded | Load each of the six dashboard screens | Each screen (Index trend, Route heatmap, Lead-time curve, Airline comparison, Fare/tax breakdown, Data-quality panel) renders correctly from the fixture without errors |

### FEATURE-005 — REST API

| Test ID | Requirement | Precondition | Steps | Expected Result |
|---|---|---|---|---|
| TC-F5-01 | FR-001 | Index and fare data present | Call each of the 5 endpoints | Each returns `200` with the documented schema |
| TC-F5-02 | FR-002 | — | Call `/api/index/current` | Response includes `index`, `period`, `base_period`, `coverage` |

### FEATURE-006 — Data Quality Layer

| Test ID | Requirement | Precondition | Steps | Expected Result |
|---|---|---|---|---|
| TC-F6-01 | FR-001 | A run with known injected duplicates and missing values | Compute Data Quality Score | Score reflects the expected degradation (completeness/duplicate-rate components drop proportionally) |

### FEATURE-007 — Backtesting Module

| Test ID | Requirement | Precondition | Steps | Expected Result |
|---|---|---|---|---|
| TC-F7-01 | FR-001 | ≥30 days of historical APIx + DGCA monthly benchmark data available | Run backtest | MAE, RMSE, correlation and directional accuracy are all computed and returned |
| TC-F7-02 | FR-002 | Backtest results computed | Review dashboard/report copy presenting the backtest | Language frames results as external validation evidence, never as proof of CPI-grade accuracy |

---

## 4. Non-Functional Test Cases (by NFR)

| Test ID | Requirement | Test Approach | Expected Result |
|---|---|---|---|
| TC-N-001 | NFR-001 Legal/compliance | Configure a source as disallowed; attempt collection | Adapter falls back to permitted/demo data; no bypass attempted; normalisation/index layers unaffected |
| TC-N-002 | NFR-002 Auditability | Pick a published index figure | Trace it: index → route contribution → carrier observation → normalised quote → raw observation | Full chain resolves with no gaps |
| TC-N-003 | NFR-003 Reproducibility | Re-run the index calculation twice on identical stored input | Both runs produce identical `apix_value` |
| TC-N-004 | NFR-004 Honesty about frequency | Inspect UI/API/docs for frequency claims | No "real-time" language anywhere; stated cadence matches actual scheduler interval |
| TC-N-005 | NFR-005 Fault isolation | Disable one adapter | Other adapters and the index for unaffected routes continue functioning |
| TC-N-006 | NFR-006 Data immutability | Attempt to update a `raw_quotes` row via the normal pipeline path | No pipeline code path performs an UPDATE/DELETE on `raw_quotes`; corrections only ever appear in downstream tables |
| TC-N-007 | NFR-007 Statistical defensibility | Have a non-technical reviewer read the index methodology explanation | Reviewer can restate route weight / base period / price relative / aggregation in plain language without reference to ML |
| TC-N-008 | NFR-008 Scalability path | Add a new route/source to configuration | Pipeline picks it up without code changes to normalisation or index-calculation logic |

---

## 5. Index-Correctness & Backtest Validation Tests

| Test ID | Description | Expected Result |
|---|---|---|
| TC-IDX-01 | Manually recompute APIx for a small fixed dataset by hand (or spreadsheet) and compare to pipeline output | Values match exactly (validates ALGO-001–ALGO-004) |
| TC-IDX-02 | Feed identical input twice through the full pipeline | Identical output both times (reproducibility) |
| TC-IDX-03 | Run the 30-day backtest against DGCA benchmark data | Pipeline runs end-to-end and produces MAE/RMSE/correlation/directional-accuracy figures without manual intervention |

---

## 6. Schema & Lineage Validation Tests

| Test ID | Description | Expected Result |
|---|---|---|
| TC-SCH-01 | Submit a raw quote violating the `FareObservation` schema | Rejected or flagged, never silently accepted (validates DATA-001) |
| TC-LIN-01 | Select any published index figure | It is traceable back to its contributing raw rows (validates NFR-002) |

---

## 7. API Contract Tests

| Test ID | Endpoint | Expected Result |
|---|---|---|
| TC-API-01 | `GET /api/index/current` | Returns documented schema; correct `200` on valid request |
| TC-API-02 | `GET /api/index/history` | Returns array of period/index records; correct filtering by `from`/`to`/`granularity` |
| TC-API-03 | `GET /api/index/routes` | Returns per-route breakdown with weight and price relative |
| TC-API-04 | `GET /api/fares` | Returns underlying normalised fare records matching filters |
| TC-API-05 | `GET /api/quality` | Returns documented quality-metrics schema |
| TC-API-06 | Any endpoint, invalid input | Returns documented error schema with correct HTTP status code |

---

## 8. Compliance / Fallback Tests

| Test ID | Description | Expected Result |
|---|---|---|
| TC-COMP-01 | Flag a source as disallowed in the Source Registry | Collection for that source automatically falls back to permitted/demo data (validates NFR-001, RISK-001) |
| TC-COMP-02 | Simulate a mid-demo source block (RISK-007) | Index continues to publish using remaining available sources/routes; no full-system failure |

---

## 9. Performance / Load (lightweight, MVP-scope)

| Test ID | Description | Expected Result |
|---|---|---|
| TC-PERF-01 | Run a full scheduled collection cycle on the demo dataset size | Completes within an acceptable time window for a live demo |
| TC-PERF-02 | Load the dashboard against the demo dataset | All six screens render within an acceptable time window for a live demo |

---

## 10. Dashboard Rendering Tests

| Test ID | Description | Expected Result |
|---|---|---|
| TC-UI-01 | Load National Airfare Index screen from fixture data | Renders trend line correctly |
| TC-UI-02 | Load Route heatmap from fixture data | Renders correctly coloured grid |
| TC-UI-03 | Load Lead-time elasticity curve from fixture data | Renders correctly across T+1–T+45 |
| TC-UI-04 | Load Airline/source comparison from fixture data | Renders side-by-side comparison correctly |
| TC-UI-05 | Load Base-fare-vs-taxes/fees screen from fixture data | Renders breakdown correctly |
| TC-UI-06 | Load Data-quality panel from fixture data | Renders completeness/duplicate/validity/freshness metrics correctly |
