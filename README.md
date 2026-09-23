# APIx — Real-Time Airfare Price Index for India
**SIH 2026 | Problem Statement 26056: Development of a Real-time Airfare Price Index for India through Automated Web Scraping of Airline and OTA Portals for Augmentation of the CPI**

APIx is a government-statistics-grade domestic airfare price index platform designed to augment India's Consumer Price Index (CPI) — released by NSO/MoSPI and monitored by RBI for monetary policy.

> [!NOTE]
> **Methodology Stance:** APIx is an augmentation mechanism intended to complement existing CPI data collection with high-frequency online quotes across representative routes and advance-purchase windows. It is not a consumer flight tracker and does not claim to replace official CPI methodology.

---

## 1. System Architecture

```
                  DATA SOURCES LAYER
         IndiGo Adapter │ Air India Adapter │ MMT OTA Adapter
                           │ (robots.txt check + demo fallback)
                           ▼
                  RAW QUOTE STORE
             Immutable append-only table (FareObservation)
                           │
                           ▼
           CLEANING & NORMALISATION ENGINE
     - Schema validation (DATA-001) & deduplication (FR-002)
     - Component split: base fare, GST taxes, UDF, convenience fee (FR-005)
     - Outlier detection (IQR flagging without deletion) (FR-004)
     - Sold-out status preservation (FR-006)
                           │ (validated_quotes)
                           ▼
                 DATA QUALITY LAYER
     - Completeness, validity, freshness, duplicate rate (FEATURE-006)
                           │
                           ▼
              STATISTICAL INDEX ENGINE
     - Median route price P(r,t) (ALGO-001)
     - Price relative R(r,t) vs base period P(r,0) (ALGO-002)
     - Prototype DGCA passenger traffic route weights w_r (ALGO-005)
     - National APIx weighted aggregation (ALGO-003)
     - 5-factor index decomposition (SRS §5)
                           │
            ┌──────────────┴──────────────┐
            ▼                             ▼
     FASTAPI REST API              REACT DASHBOARD
   /api/index/current             UI-001 National APIx
   /api/index/history             UI-002 Route Heatmap
   /api/index/routes              UI-003 Lead-Time Curve
   /api/fares                     UI-004 Airline Compare
   /api/quality                   UI-005 Fare Breakdown
   /api/backtest                  UI-006 Quality Panel
   /api/lineage/{id}              30-Day DGCA Backtest View
```

---

## 2. Representative Route Basket & Prototype Weights

APIx monitors the 7 canonical domestic sectors by DGCA passenger volume:

| Route | Sector | Annual Traffic (k) | Prototype Weight (w_r) |
|---|---|---|---|
| DEL–BOM | Delhi — Mumbai | 4,850 | 0.24495 |
| DEL–BLR | Delhi — Bengaluru | 3,950 | 0.19950 |
| BOM–BLR | Mumbai — Bengaluru | 2,750 | 0.13889 |
| DEL–CCU | Delhi — Kolkata | 2,350 | 0.11869 |
| BLR–HYD | Bengaluru — Hyderabad | 2,100 | 0.10606 |
| MAA–DEL | Chennai — Delhi | 1,950 | 0.09848 |
| DEL–HYD | Delhi — Hyderabad | 1,850 | 0.09343 |
| **Total** | | **19,800** | **1.00000** |

---

## 3. Quickstart Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Backend Setup & Run
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run test suite
pytest tests/ -v

# Start FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be available at: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup & Run
```bash
cd frontend
npm install
npm run dev
```
Dashboard will be available at: `http://localhost:3000`

---

## 4. REST API Specification

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/index/current` | GET | Latest published headline APIx with 5-factor decomposition |
| `/api/index/history` | GET | Historical index series with daily, weekly, and monthly filters |
| `/api/index/routes` | GET | Per-route breakdown with weights and price relatives |
| `/api/fares` | GET | Normalized fare records with route and lead-time filters |
| `/api/quality` | GET | Per-run Data Quality Score and governance statistics |
| `/api/backtest` | GET | 30-day DGCA benchmark comparison with MAE, RMSE, Pearson r |
| `/api/lineage/{index_id}` | GET | Cryptographic trace linking published index to raw quotes |
| `/api/pipeline/run` | POST | Trigger on-demand automated collection and index computation |

---

## 5. UI Features & Design System
- **Theme Switcher**: Fully accessible Light, Dark, and System preference switcher persisted to localStorage.
- **UI-001 National APIx**: Real-time trend curve with daily/weekly/monthly toggles, baseline reference, and 5-factor decomposition cards.
- **UI-002 Sector Heatmap**: Sector matrix colored by price movement magnitude and direction.
- **UI-003 Lead-Time Elasticity**: Advance booking horizon curve (T+1 to T+45) highlighting last-minute surge premiums.
- **UI-004 Carrier Comparison**: Side-by-side comparison of budget (LCC) and full-service (FSC) airlines.
- **UI-005 Fare Composition**: Component breakdown of base fare, statutory GST (5%), and airport UDF/fees.
- **UI-006 Data Quality Layer**: Comprehensive audit score measuring completeness, validity, and deduplication.
- **30-Day DGCA Backtest View**: Independent external validation against DGCA monthly benchmark data with MAE, RMSE, Pearson correlation, and statutory disclaimers.
