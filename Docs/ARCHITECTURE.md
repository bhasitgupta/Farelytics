# Farelytics Architecture Specification

> **Full Slide-Ready Technical Architecture Document:**  
> For the comprehensive, presentation-ready technical architecture document including Mermaid diagrams, 5-tier layer deep dives, mathematical index formulations, database lineage schemas, and slide-by-slide PPT blueprints, see [`TECHNICAL_ARCHITECTURE.md`](../TECHNICAL_ARCHITECTURE.md).

## 1. System Overview

Farelytics is a high-frequency, fault-tolerant domestic airfare price index platform designed to augment the national Consumer Price Index (CPI) in India. The platform implements an end-to-end pipeline consisting of multi-carrier ingestion, robust schema normalisation, IQR outlier detection, Laspeyres index aggregation, and real-time visualization.

## 2. Core Architectural Principles

- **Immutability of Raw Ingestion:** All raw fare quotes are captured in append-only storage with complete source payload lineage.
- **Statistical Defensibility:** Outliers are tagged using Interquartile Range (IQR) fences but never silently discarded. Route weights are benchmarked against official DGCA annual passenger volumes.
- **Microservice Decoupling:** Backend ingestion and index calculations run asynchronously via FastAPI, decoupled from the React analytical dashboard.
- **Dual-Storage Resilience:** PostgreSQL (Supabase) serves as primary cloud persistence with local SQLite fallback for isolated zero-latency evaluation.

## 3. Data Pipeline Lifecycle

```
[ Carrier Adapters ] (IndiGo, Air India, Akasa, SpiceJet, MakeMyTrip)
         │
         ▼
[ Anti-Bot / Rate Limit Shield ] (Backoff, User-Agent rotation, mock fallback)
         │
         ▼
[ Raw Store ] (FareObservation table, UUID PKs, timestamped)
         │
         ▼
[ Normalisation Engine ] (Taxes, UDF, convenience fee isolation)
         │
         ▼
[ Quality Audit Gate ] (Freshness, validity, coverage ratio checks)
         │
         ▼
[ Index Computation Engine ] (Jevons elementary aggregates, Laspeyres composite)
         │
         ▼
[ API Presentation Layer ] (FastAPI REST endpoints)
         │
         ▼
[ React Analytics Dashboard ] (WebGL shaders, interactive charts, lineage viewer)
```

## 4. Security & Compliance Boundary

- Zero PII (Personally Identifiable Information) collected or stored.
- Secure token handling with Google Identity Services OAuth 2.0.
- Strict compliance with carrier terms and ethical throttling.
