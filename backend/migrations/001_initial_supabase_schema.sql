-- ============================================================================
-- AEROPRICE / APIX PLATFORM — SUPABASE POSTGRESQL INITIAL MIGRATION
-- Migration: 001_initial_supabase_schema.sql
-- Description: Production schema with UUIDs, RLS, indexes, and initial seeds.
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. ROUTES CONFIGURATION TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS routes (
    route_id VARCHAR(10) PRIMARY KEY, -- e.g., 'DEL-BOM'
    origin_airport VARCHAR(3) NOT NULL,
    destination_airport VARCHAR(3) NOT NULL,
    distance_km INTEGER,
    traffic_weight DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. PROVIDERS CONFIGURATION TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS providers (
    provider_id VARCHAR(50) PRIMARY KEY, -- e.g., 'indigo', 'air_india', 'akasa', 'spicejet', 'makemytrip'
    name VARCHAR(100) NOT NULL,
    provider_type VARCHAR(30) NOT NULL,  -- 'airline', 'ota', 'aggregator'
    base_url TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    rate_limit_per_min INTEGER NOT NULL DEFAULT 30,
    requires_browser BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. COLLECTION JOBS TABLE (Orchestration & Audit)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS collection_jobs (
    job_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_date DATE NOT NULL,
    lead_time_days INTEGER NOT NULL,
    route_id VARCHAR(10) REFERENCES routes(route_id),
    provider_id VARCHAR(50) REFERENCES providers(provider_id),
    status VARCHAR(30) NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed', 'challenge_encountered'
    quotes_count INTEGER NOT NULL DEFAULT 0,
    error_type VARCHAR(50), -- 'timeout', 'challenge_detected', 'rate_limited', 'parsing_error', 'network_error'
    error_message TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. RAW QUOTES TABLE (Immutable Source Observations)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS raw_quotes (
    raw_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES collection_jobs(job_id),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source VARCHAR(50) NOT NULL,
    airline VARCHAR(10) NOT NULL,
    origin VARCHAR(3) NOT NULL,
    destination VARCHAR(3) NOT NULL,
    departure_date DATE NOT NULL,
    return_date DATE,
    lead_time INTEGER NOT NULL,
    fare_class VARCHAR(50) DEFAULT 'Economy',
    base_fare DOUBLE PRECISION,
    taxes DOUBLE PRECISION,
    airport_fee DOUBLE PRECISION,
    udf DOUBLE PRECISION,
    convenience_fee DOUBLE PRECISION,
    total_fare DOUBLE PRECISION,
    currency VARCHAR(10) DEFAULT 'INR',
    availability VARCHAR(20) DEFAULT 'available',
    scrape_method VARCHAR(50) DEFAULT 'adapter',
    source_url TEXT,
    raw_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. VALIDATED QUOTES TABLE (Cleaned & Normalized Fares)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS validated_quotes (
    validated_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    raw_id UUID NOT NULL REFERENCES raw_quotes(raw_id) ON DELETE CASCADE,
    route_id VARCHAR(10) NOT NULL,
    carrier VARCHAR(10) NOT NULL,
    travel_date DATE NOT NULL,
    booking_date DATE NOT NULL,
    lead_time INTEGER NOT NULL,
    fare_type VARCHAR(50) DEFAULT 'standard_economy',
    base_fare DOUBLE PRECISION NOT NULL,
    mandatory_taxes DOUBLE PRECISION NOT NULL,
    mandatory_fees DOUBLE PRECISION NOT NULL,
    total_consumer_price DOUBLE PRECISION NOT NULL,
    availability_status VARCHAR(20) DEFAULT 'available',
    quality_flag VARCHAR(30) DEFAULT 'clean',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 6. INDEX OBSERVATIONS TABLE (National & Sector Price Indexes)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS index_observations (
    index_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    period_date DATE NOT NULL,
    granularity VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly'
    route_id VARCHAR(20) NOT NULL,     -- 'NATIONAL' or Route Code
    route_weight DOUBLE PRECISION,
    base_period VARCHAR(20) NOT NULL,
    price_relative DOUBLE PRECISION,
    apix_value DOUBLE PRECISION NOT NULL,
    route_effect DOUBLE PRECISION DEFAULT 0.0,
    carrier_effect DOUBLE PRECISION DEFAULT 0.0,
    lead_time_effect DOUBLE PRECISION DEFAULT 0.0,
    tax_fee_effect DOUBLE PRECISION DEFAULT 0.0,
    availability_effect DOUBLE PRECISION DEFAULT 0.0,
    contributing_validated_ids JSONB,
    coverage_ratio DOUBLE PRECISION DEFAULT 1.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_period_route_granularity UNIQUE (period_date, route_id, granularity)
);

-- ----------------------------------------------------------------------------
-- 7. DATA QUALITY RUNS TABLE (Governance Metrics)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS data_quality_runs (
    run_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    quotes_collected INTEGER DEFAULT 0,
    valid_quotes INTEGER DEFAULT 0,
    duplicates INTEGER DEFAULT 0,
    missing_invalid INTEGER DEFAULT 0,
    sold_out INTEGER DEFAULT 0,
    outliers_removed INTEGER DEFAULT 0,
    completeness_score DOUBLE PRECISION DEFAULT 1.0,
    freshness_score DOUBLE PRECISION DEFAULT 1.0,
    validity_score DOUBLE PRECISION DEFAULT 1.0,
    duplicate_rate DOUBLE PRECISION DEFAULT 0.0,
    overall_quality_score DOUBLE PRECISION DEFAULT 1.0
);

-- ----------------------------------------------------------------------------
-- PERFORMANCE INDEXES
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_raw_quotes_lookup ON raw_quotes(origin, destination, departure_date, lead_time);
CREATE INDEX IF NOT EXISTS idx_val_quotes_route_date ON validated_quotes(route_id, travel_date, carrier);
CREATE INDEX IF NOT EXISTS idx_index_obs_date ON index_observations(period_date, route_id);
CREATE INDEX IF NOT EXISTS idx_collection_jobs_status ON collection_jobs(status, target_date);

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE validated_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE index_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_quality_runs ENABLE ROW LEVEL SECURITY;

-- Public / Authenticated Read Policies
CREATE POLICY "Public Read Access for Routes" ON routes FOR SELECT USING (true);
CREATE POLICY "Public Read Access for Providers" ON providers FOR SELECT USING (true);
CREATE POLICY "Public Read Access for Index Observations" ON index_observations FOR SELECT USING (true);
CREATE POLICY "Public Read Access for Validated Quotes" ON validated_quotes FOR SELECT USING (true);
CREATE POLICY "Public Read Access for Data Quality Runs" ON data_quality_runs FOR SELECT USING (true);
CREATE POLICY "Authenticated Read Access for Collection Jobs" ON collection_jobs FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Authenticated Read Access for Raw Quotes" ON raw_quotes FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Service Role Write Policies (Only backend / workers can write raw quotes and jobs)
CREATE POLICY "Service Role Write Access for Routes" ON routes FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service Role Write Access for Providers" ON providers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service Role Write Access for Collection Jobs" ON collection_jobs FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service Role Write Access for Raw Quotes" ON raw_quotes FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service Role Write Access for Validated Quotes" ON validated_quotes FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service Role Write Access for Index Observations" ON index_observations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service Role Write Access for Data Quality Runs" ON data_quality_runs FOR ALL USING (auth.role() = 'service_role');

-- ----------------------------------------------------------------------------
-- INITIAL SEED DATA
-- ----------------------------------------------------------------------------
INSERT INTO routes (route_id, origin_airport, destination_airport, distance_km, traffic_weight, is_active)
VALUES
    ('DEL-BOM', 'DEL', 'BOM', 1148, 0.2546, true),
    ('DEL-BLR', 'DEL', 'BLR', 1740, 0.2073, true),
    ('BOM-BLR', 'BOM', 'BLR', 842,  0.1444, true),
    ('DEL-CCU', 'DEL', 'CCU', 1305, 0.1234, true),
    ('BLR-HYD', 'BLR', 'HYD', 500,  0.1102, true),
    ('MAA-DEL', 'MAA', 'DEL', 1760, 0.1024, true),
    ('DEL-HYD', 'DEL', 'HYD', 1253, 0.0971, true)
ON CONFLICT (route_id) DO NOTHING;

INSERT INTO providers (provider_id, name, provider_type, base_url, is_active, rate_limit_per_min, requires_browser)
VALUES
    ('indigo',     'IndiGo Direct',   'airline',    'https://www.goindigo.in',   true, 30, false),
    ('air_india',  'Air India Direct', 'airline',    'https://www.airindia.com',  true, 30, false),
    ('akasa',      'Akasa Air Direct', 'airline',    'https://www.akasaair.com',  true, 30, false),
    ('spicejet',   'SpiceJet Direct',  'airline',    'https://www.spicejet.com',  true, 30, false),
    ('makemytrip', 'MakeMyTrip Portal', 'aggregator', 'https://www.makemytrip.com', true, 20, false)
ON CONFLICT (provider_id) DO NOTHING;
