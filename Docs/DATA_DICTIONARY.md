# Farelytics Data Dictionary

## 1. `fare_observations` Table

| Column Name | Data Type | Constraints | Description |
|:---|:---|:---|:---|
| `id` | UUID | Primary Key | Globally unique identifier |
| `route` | VARCHAR(16) | NOT NULL | Sector corridor (e.g. `DEL-BOM`) |
| `origin` | VARCHAR(3) | NOT NULL | 3-letter IATA origin airport |
| `destination` | VARCHAR(3) | NOT NULL | 3-letter IATA destination airport |
| `airline` | VARCHAR(4) | NOT NULL | 2-character IATA carrier code (`6E`, `AI`, `QP`, `SG`) |
| `flight_number` | VARCHAR(16) | NOT NULL | Specific operating flight code |
| `travel_date` | DATE | NOT NULL | Scheduled flight departure date |
| `collected_at` | TIMESTAMPTZ | NOT NULL | UTC timestamp of price scraping |
| `lead_time` | INTEGER | NOT NULL | Days between scrape and flight date |
| `base_fare` | NUMERIC(10,2)| NOT NULL | Unbundled airline ticket price |
| `taxes_fees` | NUMERIC(10,2)| NOT NULL | Statutory taxes (GST, UDF, PSF) |
| `convenience_fee`| NUMERIC(10,2)| DEFAULT 0.00 | Booking transaction fee |
| `total_fare` | NUMERIC(10,2)| NOT NULL | Total final customer price |
| `is_sold_out` | BOOLEAN | DEFAULT FALSE | Flag indicating flight capacity exhausted |
| `is_outlier` | BOOLEAN | DEFAULT FALSE | Flagged by IQR statistical fence |
| `source` | VARCHAR(32) | NOT NULL | Ingestion provider origin |
| `raw_hash` | VARCHAR(64) | NOT NULL | SHA256 checksum of raw payload |

---

## 2. `index_records` Table

| Column Name | Data Type | Description |
|:---|:---|:---|
| `period` | DATE | Observation index date |
| `national_index` | NUMERIC(8,2) | Aggregate Laspeyres composite value |
| `base_period` | DATE | Benchmark reference period |
| `coverage_ratio` | NUMERIC(5,4) | Proportion of active quotes valid |
| `calculated_at` | TIMESTAMPTZ | Computation execution timestamp |
