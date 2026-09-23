const API_BASE = '/api';

export async function fetchCurrentIndex() {
  const res = await fetch(`${API_BASE}/index/current`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch current index`);
  return res.json();
}

export async function fetchIndexHistory(granularity = 'daily', fromDate, toDate) {
  const params = new URLSearchParams({ granularity });
  if (fromDate) params.append('from_date', fromDate);
  if (toDate) params.append('to_date', toDate);
  const res = await fetch(`${API_BASE}/index/history?${params.toString()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch index history`);
  return res.json();
}

export async function fetchRoutesIndex(date) {
  const params = new URLSearchParams();
  if (date) params.append('date', date);
  const res = await fetch(`${API_BASE}/index/routes?${params.toString()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch routes index`);
  return res.json();
}

export async function fetchFares(routeId, leadTime, limit = 50) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (routeId) params.append('route_id', routeId);
  if (leadTime) params.append('lead_time', String(leadTime));
  const res = await fetch(`${API_BASE}/fares?${params.toString()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch fares`);
  return res.json();
}

export async function fetchQualityMetrics() {
  const res = await fetch(`${API_BASE}/quality`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch data quality`);
  return res.json();
}

export async function fetchBacktest() {
  const res = await fetch(`${API_BASE}/backtest`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch backtest`);
  return res.json();
}

export async function fetchLineage(indexId) {
  const res = await fetch(`${API_BASE}/lineage/${indexId}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch lineage`);
  return res.json();
}

export async function fetchLeadTimeCurve() {
  const res = await fetch(`${API_BASE}/lead-time-curve`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch lead time curve`);
  return res.json();
}

export async function fetchAirlineComparison() {
  const res = await fetch(`${API_BASE}/airline-comparison`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch airline comparison`);
  return res.json();
}

export async function fetchFareBreakdown() {
  const res = await fetch(`${API_BASE}/fare-breakdown`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch fare breakdown`);
  return res.json();
}

export async function triggerPipeline(date) {
  const params = new URLSearchParams();
  if (date) params.append('date', date);
  const res = await fetch(`${API_BASE}/pipeline/run?${params.toString()}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to run pipeline`);
  return res.json();
}

export async function fetchSystemStatus() {
  const res = await fetch(`${API_BASE}/system/status`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch system status`);
  return res.json();
}

