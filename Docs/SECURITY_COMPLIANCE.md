# Farelytics Security, Governance & Ethical Web Compliance

## 1. Ethical Data Ingestion Standards

Farelytics respects carrier web properties and API endpoints:
- **Respect for `robots.txt`:** Crawlers honor disallow directives on carrier root domains.
- **Adaptive Concurrency & Delays:** Exponential backoff and polite sleep intervals (minimum 1.5s between requests) prevent load impact on airline booking engines.
- **Mock / Sandbox Fallback:** If challenges or anti-bot protections trigger (403/429), the system immediately backs off and falls back to cached/synthetic observations rather than attempting credential brute-forcing.

## 2. Data Governance & Privacy

- **Zero Passenger PII:** The platform gathers publicly available list prices and flight schedules only. No user booking details or customer credentials are ever ingested.
- **Append-Only Immutability:** Raw price observations cannot be updated or deleted in place, guaranteeing non-repudiation and auditability for statistical oversight.

## 3. Application Security

- **OWASP Top 10 Mitigation:** Input validation across all REST endpoints using Pydantic schemas.
- **Environment Isolation:** Secrets, database connection strings, and OAuth client keys are injected via environment variables.
- **Database Row Level Security (RLS):** Supabase PostgreSQL policies enforce read-only public access while write permissions require authenticated service role keys.
