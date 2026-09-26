# Product Requirements Document (PRD)
## Real-Time Airfare Price Index (APIx) for India
**Production Specification: Domestic Airfare Price Index Platform**

---

## 1. Product Vision

APIx turns high-frequency airfare observations into a **reproducible economic price index** — government-statistics-grade infrastructure, not a travel-price tracker. Prove the methodology first on a small, defensible route/source basket; scale the collection architecture second.

**Core workflow:**
```
Airline / OTA Sources
        ↓
Automated Collection (source adapters)
        ↓
Raw Quote Store (immutable)
        ↓
Cleaning + Validation
        ↓
Fare Normalisation
        ↓
Route / Lead-Time Aggregation
        ↓
Airfare Price Index (APIx)
        ↓
Dashboard + REST API
        ↓
NSO / RBI / Researchers
```

---

## 2. Personas

| Persona | Need |
|---|---|
| NSO / MoSPI | Higher-frequency airfare price observations for CPI augmentation |
| RBI / policymakers | Understand short-term transport-price inflation |
| Statisticians / economists | Consistent, reproducible index methodology |
| Researchers | Route, airline and lead-time pricing analysis |
| Public / analysts | Transparent, explainable airfare trends |

---

## 3. Product Goals & KPIs

**The MVP must prove:**
- **GOAL-001** — You can collect representative airfare observations
- **GOAL-002** — You can normalise different fare structures into one comparable schema
- **GOAL-003** — You can construct a reproducible index from those observations
- **GOAL-004** — You can show how the index changes over time and across routes
- **GOAL-005** — Your results can be independently consumed through an API

**KPIs:**
- Coverage ratio (valid quotes collected vs. planned)
- Data Quality Score per run
- Correlation / MAE / RMSE vs. DGCA 30-day benchmark
- API uptime & correctness during demo
- Index reproducibility (identical re-run output)

---

## 4. MVP Scope

### Must-Have
- **Data collection:** 3–5 representative routes, 2–3 airline/source combinations initially, lead-time windows T+1/T+7/T+15/T+30/T+45, scheduled (not on-demand) collection, full metadata per observation
- **Data pipeline:** Raw → Schema Validation → Deduplication → Missing-Value Handling → Outlier Detection → Fare Component Normalisation → Validated Quote
- **Index:** Daily, weekly, monthly index; route-level index; lead-time analysis
- **Dashboard:** 6 core screens (see §6)
- **API:** read-only endpoints for index, history, routes, fares, quality
- **Backtest:** 30-day comparison against DGCA monthly average-fare data

### Explicitly excluded from MVP
Mobile app · user login/accounts · travel booking · AI chatbot · personalised flight recommendations · price prediction / complex ML forecasting · Kubernetes/microservices · 20+ scrapers · fancy animations.

None of these solve the core evaluation problem — a credible, reproducible measurement methodology.

---

## 5. Feature List

### FEATURE-001 — Data Collection Engine
Scheduled, source-adapter-based extraction of airfare quotes from permitted airline/OTA sources. Each source is an isolated adapter, so one site's change never breaks another's collection.

### FEATURE-002 — Data Cleaning & Normalisation Pipeline
Turns raw, heterogeneous quotes into a validated, comparable schema: schema validation, de-duplication, explicit missing-value handling, outlier flagging (not deletion), base-fare/tax/fee separation, sold-out flagging, and a raw → validated → normalised → indexed lineage for full traceability.

### FEATURE-003 — Index Construction Engine
Converts normalised fares into the published APIx using median route price, price relatives against a labelled base period, DGCA-traffic-derived route weights, and daily/weekly/monthly publication — plus a decomposition into route/carrier/lead-time/tax-fee/availability effects (this decomposition is a key differentiator: it makes the dashboard useful to an economist, not just visually impressive).

### FEATURE-004 — Dashboard / Visualisation Layer
See §6 for the full screen spec.

### FEATURE-005 — REST API
Read-only programmatic access for NSO/RBI/researchers (current index, historical index, per-route, per-fare, data-quality). Full spec in the TRD.

### FEATURE-006 — Data Quality Layer
A per-run Data Quality Score based on completeness, freshness, validity, duplicate rate and source consistency — this is what turns the project from "a scraper demo" into "a measurement platform."

### FEATURE-007 — Backtesting Module (mandatory)
Reconstructs APIx over ≥30 historical days and compares against DGCA monthly average-fare data using MAE, RMSE, correlation and directional accuracy. Presented as evidence of external validation, **not** proof of CPI-grade accuracy.

---

## 6. Dashboard / UX Requirements

| Screen | Shows |
|---|---|
| **UI-001** National Airfare Index | Time-series line chart of APIx (daily/weekly/monthly) |
| **UI-002** Route heatmap | Grid of route-pairs coloured by direction/magnitude of price movement |
| **UI-003** Lead-time elasticity curve | Fare vs. booking horizon (T+1 through T+45) |
| **UI-004** Airline / source comparison | Side-by-side carrier or OTA price comparison |
| **UI-005** Base fare vs. taxes/fees | Breakdown of what portion of total price is fees/taxes |
| **UI-006** Data-quality panel | Per-run completeness, duplicate rate, validity, freshness |

Design principle: don't present the index as "average airfare" — present it as *"a weighted price index constructed from standardized airfare observations across representative Indian domestic sectors and booking horizons."*

---

## 7. Route Selection & Weighting

**Canonical MVP route basket** (union of the official problem-statement list and the internal analysis list, both of which overlap on 5 of 6 routes): **DEL–BOM, DEL–BLR, BOM–BLR, DEL–CCU, BLR–HYD, MAA–DEL, DEL–HYD** — trim to 5–10 by DGCA traffic rank for the actual build.

Weighting: `w_r = PassengerTraffic_r / Σ(PassengerTraffic across selected routes)`, sourced from DGCA city-pair passenger statistics. If official CPI weights aren't available, weights are explicitly labelled **"prototype weights"** with a stated recalibration plan.

---

## 8. Strategic Product Roadmap

| Phase | Timeline | Focus |
|---|---|---|
| P0 | Milestone 1 | Working prototype & core index engine |
| P1 | Week 1–2 | Data reliability — source adapters, monitoring, retry logic, data-quality alerts, historical storage, better normalisation |
| P2 | Week 3–4 | Scale — 5→20→50 routes→national basket; 2→5 airlines→OTAs→multi-source reconciliation |
| P3 | Month 2 | Statistical validation — basket methodology, route weighting, base-period selection, sampling methodology, fare-class treatment, cancellations, sold-out handling, seasonal adjustment, revision policy, missing-data treatment |
| P4 | Month 3 | Production API — authentication, rate limits, versioning, documentation, audit logs |
| P5 | Month 4+ | Institutional integration |

---

## 9. Competitive Framing

| Approach | Frequency | Dynamic fares | Route-level | CPI-oriented | Auditable |
|---|---|---|---|---|---|
| Manual collection | Low | Limited | Limited | Yes | Medium |
| Airline websites (direct) | High | Yes | Yes | No | Medium |
| OTAs | High | Yes | Yes | No | Medium |
| Consumer airfare trackers (e.g. TOI/DPA-style index) | High | Yes | Yes | Usually No | Variable |
| **APIx (proposed)** | High | Yes | Yes | **Yes** | **High** |

The differentiator is **not** "we scrape websites" — several existing approaches already do that. The differentiator is **standardised, statistically defensible, auditable measurement**: DGCA-traffic-weighted route basket, multiple advance-purchase windows, consumer-price normalisation, base-fare-vs-mandatory-charges separation, automated data-quality scoring, reproducible index calculation, historical backtesting, API-first design, full audit trail, and CPI-integration readiness.
