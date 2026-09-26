# Business Requirements Document (BRD)
## Real-Time Airfare Price Index (APIx) for India
**Production Platform: Automated Multi-Source Domestic Airfare Price Index for India for Augmentation of the CPI**

---

## 1. Executive Summary

India's Consumer Price Index (CPI), released by NSO/MoSPI and used by RBI for monetary policy, still collects domestic air-travel fares mostly through manual price collection at a limited set of outlets — even though over 90% of tickets are now bought online at highly dynamic, route- and time-sensitive prices. APIx is proposed as an **augmentation mechanism**: an automated system that collects airfare observations from airline and OTA sources, normalizes them into a comparable schema, and computes a reproducible, weighted **Airfare Price Index** at daily/weekly/monthly frequency, exposed via a dashboard and API for NSO, RBI and researchers.

**This is not a flight-price comparison website — it is a government-statistics-grade price-measurement system.** That distinction drives every scope, architecture and communication decision in this document.

**Verdict:**

| Dimension | Assessment |
|---|---|
| Problem strength | High — genuine measurement gap, clear government-statistics use case |
| Technical challenge | Very high — collection, normalisation and statistical methodology each carry real complexity |
| MVP feasibility (full spec) | Not feasible in 36 hours |
| MVP feasibility (focused prototype) | Moderate and achievable: 5–10 routes × 3–5 sources × 5 lead-time windows |
| Biggest opportunity | Make the **statistical methodology** the hero, not the scraper |
| Biggest risk | Data-access legality/robustness — never build the project's identity around defeating CAPTCHAs/anti-bot systems |
| Priority order | Credibility of measurement > breadth of scraping > visual polish |

**Impact:** higher-frequency airfare signals for NSO/MoSPI; timelier transport-inflation reading for RBI; a reproducible dataset for researchers studying festival/weekend/booking-window/route/carrier price effects; and, as a secondary product, consumer-facing insight into lead-time price elasticity.

---

## 2. Business Background and Justification

- CPI's 'Transport and Communication' sub-group (incl. air fares) is collected primarily via manual outlet visits, which cannot capture dynamic online pricing.
- Over 90% of domestic tickets are sold online via airline sites and OTAs (MakeMyTrip, Yatra, EaseMyTrip, Cleartrip, Ixigo, Goibibo).
- The same sector can vary 200–400% within a single day depending on advance-booking window, day-of-week, demand, festival seasons and fuel surcharges — manual, infrequent sampling cannot represent this.
- Market scale: MoSPI's 2025 civil-aviation review reports **88.30 million domestic passengers** in April–June 2025, confirming the measurement gap matters at national scale.

**Core reframing:** the deeper problem is not "data isn't collected often enough" — it's **"how do you define a comparable airfare observation"** when price varies by route, date, lead time, carrier, fare class, taxes and availability? A naive average across observations at different booking windows (e.g., ₹9,200 at T+1 vs ₹3,500 at T+45 for the same route) is not a valid "airfare." APIx adopts a **fixed pricing specification** — analogous to the approach used by mature statistical agencies (e.g., the U.S. BLS airfare CPI methodology, which fixes advance-reservation and travel-day characteristics) — tagging every observation by route, carrier, fare class and lead time before aggregation.

---

## 3. Stakeholders

| Stakeholder | What they need |
|---|---|
| NSO / MoSPI | Reliable, high-frequency price observations usable for CPI methodology |
| RBI | Better, timelier inflation signals for monetary-policy analysis |
| DGCA | Aviation demand/traffic context feeding route selection |
| Airlines | Their fare structures represented correctly and fairly |
| Consumers | Prices reflecting real, current booking conditions |
| Researchers | Historical, reproducible airfare data for study |
| Technical & statistical evaluators | Evidence the system is statistically and technically credible |

---

## 4. Business Objective

Build an augmentation mechanism that supplies NSO/MoSPI and RBI with **higher-frequency, reproducible domestic-airfare price observations**, positioned as a **complement to — never a replacement for** — existing CPI data collection. Never claim APIx replaces or overrides official CPI methodology.

---

## 5. Scope

### In scope (MVP)
- Automated collection of airfare quotes from a representative route/airline basket (5–10 routes, 3–5 sources, 5 lead-time windows: T+1/T+7/T+15/T+30/T+45)
- Cleaning, de-duplication and normalisation of raw quotes into a comparable schema
- A reproducible, weighted Airfare Price Index (APIx) at daily/weekly/monthly frequency, decomposed by route/carrier/lead-time/tax-fee/availability effects
- A dashboard and a read-only REST API for NSO/RBI/researchers
- A 30-day backtest against DGCA monthly average-fare data (mandatory, non-negotiable deliverable)

### Out of scope (MVP)
- A full national-scale scraper covering every airline and every route
- A consumer-facing flight booking or comparison product
- Defeating CAPTCHAs, aggressive IP rotation, or any anti-bot circumvention as a feature/differentiator
- Mobile app, user login/accounts, ML price-prediction, chatbot, Kubernetes/microservices
- Any claim of true real-time pricing, or that the index replaces official CPI

---

## 6. Assumptions and Constraints

- **[ASSUMPTION-001]** The solution must include documentation and automated testing, and must demonstrate at least 30 days of back-tested results against publicly available DGCA monthly average-fare data. This is an explicit, non-negotiable deliverable.
- **[ASSUMPTION-002]** If official CPI weights are unavailable for the prototype, all route weights must be explicitly labelled "prototype weights," with a stated plan for how they would ultimately be replaced/calibrated using official traffic/expenditure data.
- **[ASSUMPTION-003]** Correlation with the DGCA benchmark is evidence of external validation, not proof that the index is officially CPI-suitable — this distinction must be stated clearly wherever the backtest is presented.
- **[ASSUMPTION-004]** Production deployment architecture: Production PostgreSQL is hosted on Supabase; containerized/FastAPI backend deployed with resilient connection pooling.
- The complete national-scale production system is **not** a realistic 36-hour build; only a focused prototype proving the methodology is in scope.

---

## 7. Risks

| Risk | Mitigation |
|---|---|
| Scraping violates a source's terms of service (Air India and IndiGo both restrict automated data-mining/robots in their terms) | Source-adapter architecture with permitted-source / demo-data fallback; never make CAPTCHA/IP-rotation bypass the core platform innovation |
| Building an impressive scraper while the index itself is an afterthought | Make the statistical methodology the hero; scraper is only the ingestion mechanism |
| Claiming "real-time" pricing when data is actually static/scheduled | State collection frequency precisely everywhere in the UI and docs |
| Beautiful dashboard, weak statistics | Be ready to explain exactly how APIx is calculated, step by step, on demand |
| Overusing AI/LLMs where they don't add value (e.g. calculating the index with an LLM) | Use AI only for anomaly explanation, schema mapping, data-quality classification or NL analytics — never for the core index math |
| Too many routes, low reliability | 10 high-quality, well-validated routes beat 200 unreliable ones |
| A source blocks the scraper mid-demo | Collection layer decoupled from the index layer; one unavailable source does not invalidate the whole system |
| Judges challenge legal basis for data collection | Lead with the source-adapter / compliance-first architecture before being asked |

---

## 8. Success Criteria

**The MVP must prove five things:**
1. You can collect representative airfare observations.
2. You can normalise different fare structures into one comparable schema.
3. You can construct a reproducible index from those observations.
4. You can show how the index changes over time and across routes.
5. Your results can be independently consumed through an API.

**KPIs:**
- Route/observation coverage ratio (valid quotes collected vs. planned quotes per run)
- Data Quality Score per collection run (completeness, freshness, validity, duplicate rate, source consistency)
- Correlation / MAE / RMSE of APIx against the DGCA monthly benchmark over the 30-day backtest window
- API uptime and response correctness during the demo window
- Index reproducibility: re-running the pipeline on the same raw data yields an identical index value

---

## 9. Appendix — Anticipated Hard Questions & Prepared Answers

| # | Question | Answer |
|---|---|---|
| QA-001 | Why these routes? | Passenger-volume-based route selection using DGCA traffic data |
| QA-002 | Why median instead of mean? | Airfare observations can contain extreme values and availability-related distortions; median is more robust |
| QA-003 | Why total fare, not base fare? | The objective is the consumer's actual payable price, not the advertised base fare |
| QA-004 | How do you handle sold-out flights? | Marked as an availability observation, never treated as missing/zero-price |
| QA-005 | How do you distinguish a genuine price increase from a fare-class change? | Fare-class and product attributes are kept in the observation schema, never discarded during normalisation |
| QA-006 | What if an airline blocks you? | Source adapter falls back: authorized API → permitted collection → archived/demo data — never attempts to defeat security controls |
| QA-007 | Why should NSO trust your index? | Transparent methodology + reproducible observations + quality controls + documented route weights + full audit trail + independent backtesting — not "because our AI model is accurate" |
| QA-008 | What happens when an airline changes its website? | Source-specific adapters isolate extraction logic from shared normalisation/index layers |
| QA-009 | Why not just use average airfare? | A simple average ignores route composition, booking horizon, source differences, availability and dynamic pricing |
| QA-010 | Is this replacing CPI? | No — explicitly: "an augmentation mechanism intended to provide higher-frequency airfare observations that can potentially complement existing CPI data collection" |
