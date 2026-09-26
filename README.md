<p align="center">
  <img src="frontend/public/farelytics-logo.png" alt="Farelytics Logo" width="560"/>
</p>

<p align="center">
  <strong>Government-Grade Real-Time Domestic Airfare Price Index & Analytics Engine for India</strong>
</p>

<p align="center">
  <a href="https://farelytics.vercel.app"><img src="https://img.shields.io/badge/Live%20Demo-farelytics.vercel.app-ff5500?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" /></a>
  <a href="#quickstart-guide"><img src="https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" /></a>
  <a href="#quickstart-guide"><img src="https://img.shields.io/badge/FastAPI-0.110%2B-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" /></a>
  <a href="#quickstart-guide"><img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" /></a>
  <a href="#quickstart-guide"><img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2D9?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS" /></a>
  <a href="#quickstart-guide"><img src="https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" /></a>
</p>

---

## 🌟 Executive Overview

**Farelytics** is an automated multi-source airfare intelligence and price index engine engineered to augment India's **Consumer Price Index (CPI)** — published by NSO/MoSPI and monitored by the Reserve Bank of India (RBI) for monetary policy formulation.

Traditional airfare price collection for CPI relies on monthly point-in-time sampling, which misses dynamic intra-month yield spikes, seasonal festival premiums, and advance-purchase curve discounts. Farelytics bridges this measurement gap through **high-frequency automated price quote ingestion**, **strict normalisation pipelines**, and **defensible statistical index aggregation**.

> [!NOTE]
> **Methodology Stance:** Farelytics serves as an official augmentation mechanism. It complements existing official statistical workflows with high-frequency empirical price distributions across top domestic travel corridors and advance-purchase horizons ($T+1$ to $T+45$ days).

---

## 🗺️ System Architecture

```
                             DATA SOURCES LAYER
     IndiGo (6E)  │  Air India (AI)  │  Akasa Air (QP)  │  SpiceJet (SG)  │  MakeMyTrip OTA
                                      │
               (anti-bot challenge detection & ethical throttling)
                                      ▼
                             RAW QUOTE STORE
             • Immutable append-only schema (FareObservation)
             • Supabase PostgreSQL (UUID PKs, RLS, Indexes) + SQLite local fallback
                                      │
                                      ▼
                      CLEANING & NORMALISATION ENGINE
             • Schema validation (DATA-001) & deduplication (FR-002)
             • Component breakdown: Base Fare, GST, UDF/PSF, Convenience Fees (FR-005)
             • Interquartile Range (IQR) outlier detection without deletion (FR-004)
             • Sold-out status preservation & audit log
                                      │
                                      ▼
                            DATA QUALITY CONTROL
             • Completeness, validity, freshness, duplicate rate metrics (FEATURE-006)
                                      │
                                      ▼
                          STATISTICAL INDEX ENGINE
             • Route median prices $P(r,t)$ across advance windows (ALGO-001)
             • Price relatives $R(r,t)$ benchmarked against base period $P(r,0)$ (ALGO-002)
             • Empirical DGCA annual passenger volume weights $w_r$ (ALGO-005)
             • Laspeyres-type weighted national index aggregation (ALGO-003)
             • 5-factor index decomposition (Trend, Carrier, Distance, Advance, Seasonality)
                                      │
                 ┌────────────────────┴────────────────────┐
                 ▼                                         ▼
        FASTAPI BACKEND SERVICE                   REACT ANALYTICS DASHBOARD
      • /api/index/current                      • UI-001 National Farelytics Index
      • /api/index/history                      • UI-002 Route Price Heatmap
      • /api/index/routes                       • UI-003 Lead-Time Dynamic Curve
      • /api/fares                              • UI-004 Carrier Fare Comparison
      • /api/quality                            • UI-005 Component Cost Split
      • /api/backtest                           • UI-006 Data Quality & Linage Modal
      • /api/providers                          • WebGL Interactive Hero Shader
      • /api/jobs                               • Google Identity OAuth Auth Console
```

---

## ✈️ Representative Route Basket & DGCA Weights

Farelytics tracks 7 canonical Indian trunk sectors representing **over 19.8 million annual domestic passengers**, sampled systematically across 5 advance-booking horizons ($T+1, T+7, T+15, T+30, T+45$):

| Route Code | Sector | Annual Passengers (k) | Prototype Weight ($w_r$) | Primary Carriers |
|:---:|:---|:---:|:---:|:---|
| **DEL–BOM** | Delhi ⇄ Mumbai | 4,850 | **0.24495** | 6E, AI, QP, SG |
| **DEL–BLR** | Delhi ⇄ Bengaluru | 3,950 | **0.19950** | 6E, AI, QP |
| **BOM–BLR** | Mumbai ⇄ Bengaluru | 2,750 | **0.13889** | 6E, AI, QP |
| **DEL–CCU** | Delhi ⇄ Kolkata | 2,350 | **0.11869** | 6E, AI, SG |
| **BLR–HYD** | Bengaluru ⇄ Hyderabad | 2,100 | **0.10606** | 6E, AI, QP |
| **MAA–DEL** | Chennai ⇄ Delhi | 1,950 | **0.09848** | 6E, AI, SG |
| **DEL–HYD** | Delhi ⇄ Hyderabad | 1,850 | **0.09343** | 6E, AI, QP |
| **TOTAL** | *National Representative Basket* | **19,800** | **1.00000** | **100% Coverage** |

---

## ✨ Key Capabilities & Highlights

- **Multi-Carrier Scraper Suite:** Built-in modular adapters for **IndiGo**, **Air India**, **Akasa Air**, **SpiceJet**, and **MakeMyTrip OTA** with mock fallback resilience and rate limiting.
- **Micro-Component Disaggregation:** Isolates base airline charges from statutory fuel surcharges, Goods & Services Tax (GST), User Development Fees (UDF), and convenience charges.
- **Statistical Integrity:** Preserves market reality with IQR outlier tagging (rather than arbitrary record deletion) and explicit tracking of sold-out flight percentages.
- **Interactive Modern UI:** Responsive React dashboard with custom WebGL wave physics, animated text reveals, route heatmaps, and lineage audit modals.
- **Operations Console:** Real-time ingestion trigger drawer, data quality monitoring, and system metrics logging.
- **Cloud-Ready Deployment:** Native Vercel frontend hosting coupled with high-availability Supabase PostgreSQL database persistence.

---

## 🚀 Quickstart Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- (Optional) Supabase credentials for PostgreSQL cloud storage

### 1. Backend Service Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate   # Windows: .\venv\Scripts\Activate.ps1

# Install production dependencies
pip install -r requirements.txt

# (Optional) Setup environment variables
cp .env.example .env

# Run full test suite
pytest tests/ -v

# Launch FastAPI development server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

*Interactive Swagger documentation available at:* `http://127.0.0.1:8000/docs`

### 2. Frontend Dashboard Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite live reload development server
npm run dev

# Build production bundle for Vercel
npm run build
```

*Open browser at:* `http://localhost:5173`

---

## 📊 Core REST API Specifications

| Method | Endpoint | Description |
|:---:|:---|:---|
| `GET` | `/api/index/current` | Returns latest national Farelytics composite index and metadata |
| `GET` | `/api/index/history` | Granular time-series index data (`daily`, `weekly`, `monthly`) |
| `GET` | `/api/index/routes` | Per-route price relatives and DGCA passenger volume weights |
| `GET` | `/api/fares` | Filtered raw fare observations by route, carrier, and date |
| `GET` | `/api/quality` | Ingestion pipeline health, freshness, and completeness metrics |
| `GET` | `/api/backtest` | 30-day historical index performance backtest |
| `GET` | `/api/providers` | Active carrier adapter health and scrapers status |
| `GET` | `/api/lineage/{id}` | Complete audit trail for any given price observation |
| `POST`| `/api/pipeline/run` | Trigger on-demand pipeline ingestion run |

---

## 🔒 Security & Privacy

- Read-only public analytical queries with zero personal data collection.
- Encrypted HTTPS transmission across all carrier API adapters.
- JWT and Google Identity Services OAuth 2.0 integration for administrative console access.
- Row Level Security (RLS) enabled on Supabase database layers.

---

## 📄 License & Attribution

Farelytics is developed and maintained by **Bhasit Gupta** ([@bhasitgupta](https://github.com/bhasitgupta)).  
Official Repository: [bhasitgupta/SIH26056](https://github.com/bhasitgupta/SIH26056)  
Live Production: [farelytics.vercel.app](https://farelytics.vercel.app)
