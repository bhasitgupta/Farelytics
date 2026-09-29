import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Search, TrendingUp, Info } from 'lucide-react';
import { fetchCurrentIndex, fetchIndexHistory } from '../services/api';
import AnimatedNumber from '../components/AnimatedNumber';

export default function NationalIndexView({ onInspectLineage, refreshTrigger, currentData }) {
  const [current, setCurrent] = useState(currentData);
  const [history, setHistory] = useState([]);
  const [granularity, setGranularity] = useState('daily');
  const [loading, setLoading] = useState(!currentData);
  const [error, setError] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  useEffect(() => {
    if (currentData) {
      setCurrent(currentData);
    }
  }, [currentData]);

  useEffect(() => {
    if (!current) setLoading(true);
    Promise.all([fetchCurrentIndex(), fetchIndexHistory(granularity)])
      .then(([currData, histData]) => {
        setCurrent(currData);
        setHistory(histData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [granularity, refreshTrigger]);

  if (loading && !current) {
    return (
      <div className="py-24 text-center">
        <div className="w-5 h-5 mx-auto border-2 border-[#2D2D2D] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-[#737373] mt-2 font-medium">Loading index data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
        Failed to load index data: {error}
      </div>
    );
  }

  // Chart coordinates calculation
  const values = history.map((h) => h.index);
  const minVal = values.length ? Math.floor(Math.min(...values, 99)) : 95;
  const maxVal = values.length ? Math.ceil(Math.max(...values, 112)) : 115;
  const range = maxVal - minVal || 1;

  const chartHeight = 220;
  const chartWidth = 720;
  const padding = { top: 20, bottom: 35, left: 45, right: 40 };
  const innerW = chartWidth - padding.left - padding.right;
  const innerH = chartHeight - padding.top - padding.bottom;

  const points = history.map((h, i) => {
    const x = padding.left + (i / Math.max(1, history.length - 1)) * innerW;
    const y = padding.top + innerH - ((h.index - minVal) / range) * innerH;
    return { x, y, ...h };
  });

  const pathD = points.length
    ? `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} ` +
      points.slice(1).map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
    : '';

  const areaD = points.length
    ? `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${(padding.top + innerH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padding.top + innerH).toFixed(1)} Z`
    : '';

  const avgTicket = current?.average_ticket_fare || 7851;
  const baseTicket = current?.base_ticket_fare || 7324;
  const rupeeDiff = Math.round(avgTicket - baseTicket);
  const inflationPct = current ? (current.index - 100.0).toFixed(2) : '7.20';

  // Structural drivers
  const DRIVERS = [
    {
      title: 'Route Demand',
      value: current?.decomposition?.route_effect ?? 3.02,
      share: 42,
      summary: 'High passenger traffic on top metro corridors (DEL-BOM, DEL-BLR).',
    },
    {
      title: 'Last-Minute Bookings',
      value: current?.decomposition?.lead_time_effect ?? 2.02,
      share: 28,
      summary: 'Steep surge pricing for tickets booked within 7 days of departure.',
    },
    {
      title: 'Airline Pricing',
      value: current?.decomposition?.carrier_effect ?? 1.08,
      share: 15,
      summary: 'Fare spread adjustments across full-service and low-cost carriers.',
    },
    {
      title: 'Taxes & Airport Fees',
      value: current?.decomposition?.tax_fee_effect ?? 0.58,
      share: 8,
      summary: 'Mandatory User Development Fees (UDF) & 5% GST passed to travelers.',
    },
    {
      title: 'Seat Availability',
      value: current?.decomposition?.availability_effect ?? 0.50,
      share: 7,
      summary: 'High flight occupancy causing remaining seats to move into higher price tiers.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. UNIFIED PRIMARY INDEX HERO CARD (METRICS + CHART) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-[#E5E5E5] p-6 sm:p-8 shadow-xs space-y-6">
        {/* Top Header Row: Metrics + Controls */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 pb-6 border-b border-[#EAEAEA]">
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-[#E5E5E5] text-[#111111] text-[11px] font-mono font-medium shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3171C6]"></span>
                DOMESTIC AIRFARE INFLATION (AUG 2026 = 100.0)
              </span>
              <span className="text-xs text-[#888888]">·</span>
              <span className="text-xs font-medium text-[#555555]">DGCA Volume-Weighted</span>
            </div>

            {/* Dual Metric Display */}
            <div className="flex flex-wrap items-baseline gap-x-8 gap-y-4">
              {/* Primary Index Number */}
              <div>
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#888888] block">
                  National Airfare Index
                </span>
                <div className="flex items-baseline gap-3 mt-1.5">
                  <span className="text-4xl sm:text-5xl font-medium tracking-tight text-[#111111] tabular-nums">
                    <AnimatedNumber value={current?.index || 107.20} fromValue={100.0} decimals={2} duration={850} />
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-[#111111] flex items-center bg-neutral-100 px-2.5 py-1 rounded-full border border-neutral-200">
                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5 text-[#3171C6]" />
                    <span>
                      <AnimatedNumber value={parseFloat(inflationPct)} fromValue={0.0} decimals={2} prefix="+" suffix="%" duration={850} />
                    </span>
                  </span>
                </div>
              </div>

              {/* Mean Ticket Price */}
              <div className="sm:border-l sm:border-[#EAEAEA] sm:pl-8">
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#888888] block">
                  Average Ticket Price
                </span>
                <div className="flex items-baseline gap-2.5 mt-1.5">
                  <span className="text-2xl sm:text-3xl font-medium font-sans tracking-tight text-[#111111] tabular-nums">
                    <AnimatedNumber value={avgTicket} fromValue={baseTicket} decimals={0} prefix="₹" duration={850} />
                  </span>
                  <span className="text-xs font-mono text-[#666666]">
                    <AnimatedNumber 
                      value={Math.abs(rupeeDiff)} 
                      fromValue={0} 
                      decimals={0} 
                      prefix={rupeeDiff >= 0 ? "+₹" : "-₹"} 
                      suffix={` vs Aug Base (₹${baseTicket.toLocaleString()})`} 
                      duration={850} 
                    />
                  </span>
                </div>
              </div>
            </div>

            {/* Plain English Translation */}
            <div className="p-3.5 rounded-xl bg-neutral-50/80 border border-neutral-200/80 text-xs text-[#555555] max-w-2xl leading-relaxed">
              <span className="text-[#111111] font-medium">In plain words: </span>
              Domestic airline tickets across India cost <strong className="text-[#111111] font-medium">{inflationPct}% more</strong> than in August 2026. Travelers are paying an average of <strong className="text-[#111111] font-mono font-medium">₹{rupeeDiff >= 0 ? `+${rupeeDiff}` : rupeeDiff}</strong> extra per ticket across India's top 7 trunk routes.
            </div>
          </div>

          {/* Granularity Toggle & Trace Lineage */}
          <div className="flex flex-col sm:items-end gap-3 shrink-0">
            {/* Granularity Switcher */}
            <div className="inline-flex p-1 rounded-full bg-neutral-100 border border-neutral-200">
              {['daily', 'weekly', 'monthly'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGranularity(g)}
                  className={`px-3.5 py-1 text-xs font-medium rounded-full capitalize transition-all cursor-pointer ${
                    granularity === g
                      ? 'bg-white text-[#111111] shadow-xs border border-black/[0.04]'
                      : 'text-[#666666] hover:text-[#111111]'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onInspectLineage(1)}
              className="inline-flex items-center gap-1.5 text-xs text-[#111111] hover:text-black font-medium py-1.5 px-3.5 rounded-full bg-white hover:bg-neutral-50 border border-[#E5E5E5] shadow-xs transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-[#3171C6]" />
              <span>Trace Data Lineage</span>
            </button>
          </div>
        </div>

        {/* Time-Series Chart Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#111111] font-sans">
              Index Trajectory Over Time
            </span>

            {hoveredPoint && (
              <div className="text-xs font-mono text-[#111111] bg-neutral-100 px-2.5 py-1 rounded-full border border-neutral-200 animate-in fade-in">
                {hoveredPoint.period}: <span className="font-semibold text-[#3171C6]">{hoveredPoint.index.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto min-w-[580px]">
              <defs>
                <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3171C6" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#3171C6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Subtle Grid Lines & 100 Baseline */}
              {[minVal, 100.0, maxVal].map((v) => {
                const y = padding.top + innerH - ((v - minVal) / range) * innerH;
                const isBase = v === 100.0;
                return (
                  <g key={v}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={chartWidth - padding.right}
                      y2={y}
                      stroke={isBase ? "#3171C6" : "#EAEAEA"}
                      strokeDasharray={isBase ? "4 4" : "none"}
                      strokeWidth={isBase ? "1.2" : "1"}
                    />
                    <text
                      x={padding.left - 10}
                      y={y + 3.5}
                      textAnchor="end"
                      className={`text-[10px] font-mono ${isBase ? "fill-[#3171C6] font-semibold" : "fill-[#888888]"}`}
                    >
                      {v.toFixed(0)}
                    </text>
                  </g>
                );
              })}

              {/* Area Fill */}
              {areaD && (
                <path
                  d={areaD}
                  fill="url(#chartAreaGrad)"
                  className="transition-opacity duration-700"
                />
              )}

              {/* Main Line Path */}
              <path
                d={pathD}
                fill="none"
                stroke="#111111"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="chart-line-animated"
              />

              {/* Interactive Points */}
              {points.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={hoveredPoint?.period === p.period ? 5 : 2.5}
                  className={`cursor-pointer transition-all ${
                    hoveredPoint?.period === p.period ? "fill-[#3171C6]" : "fill-[#111111]"
                  }`}
                  onMouseEnter={() => setHoveredPoint(p)}
                />
              ))}

              {/* Clean Date Axis */}
              {points.length > 0 && (
                <>
                  <text
                    x={points[0].x}
                    y={chartHeight - 10}
                    textAnchor="start"
                    className="text-[10px] font-mono fill-[#888888]"
                  >
                    {points[0].period}
                  </text>

                  {points.length > 2 && (
                    <text
                      x={points[Math.floor(points.length / 2)].x}
                      y={chartHeight - 10}
                      textAnchor="middle"
                      className="text-[10px] font-mono fill-[#888888]"
                    >
                      {points[Math.floor(points.length / 2)].period}
                    </text>
                  )}

                  <text
                    x={points[points.length - 1].x}
                    y={chartHeight - 10}
                    textAnchor="end"
                    className="text-[10px] font-mono fill-[#888888]"
                  >
                    {points[points.length - 1].period}
                  </text>
                </>
              )}
            </svg>
          </div>
        </div>

        {/* Bottom Metadata Summary Strip */}
        <div className="pt-5 border-t border-[#EAEAEA] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[#888888] block text-[11px]">Latest Publication</span>
            <span className="font-medium text-[#111111] mt-0.5 block font-mono">{current?.period || 'Today'}</span>
          </div>
          <div>
            <span className="text-[#888888] block text-[11px]">Base Reference</span>
            <span className="font-medium text-[#111111] mt-0.5 block font-mono">August 2026 = 100.0</span>
          </div>
          <div>
            <span className="text-[#888888] block text-[11px]">Corridor Coverage</span>
            <span className="font-medium text-[#111111] mt-0.5 block font-mono">Top 7 Trunk Routes (85% Traffic)</span>
          </div>
          <div>
            <span className="text-[#888888] block text-[11px]">Passenger Weights</span>
            <span className="font-medium text-[#111111] mt-0.5 block font-mono uppercase">{current?.weight_source || 'DGCA Returns'}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PLAIN-ENGLISH PRICE DRIVERS ("WHAT IS DRIVING THE INCREASE?") */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-[#E5E5E5] p-6 sm:p-8 shadow-xs space-y-5">
        <div>
          <h3 className="text-sm font-medium text-[#111111] tracking-tight">
            What Is Driving The Price Increase?
          </h3>
          <p className="text-xs text-[#666666] mt-0.5">
            Contribution of each market factor to the +{inflationPct} point headline inflation increase
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-1">
          {DRIVERS.map((item, idx) => (
            <div 
              key={idx} 
              className="p-4 rounded-2xl bg-neutral-50/70 border border-neutral-200/90 flex flex-col justify-between hover:border-neutral-300 transition-all space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-xs font-medium text-[#111111]">{item.title}</span>
                  <span className="text-xs font-mono font-medium text-[#3171C6]">
                    +{item.value.toFixed(2)} pts
                  </span>
                </div>

                <div className="w-full bg-neutral-200/80 h-1.5 rounded-full overflow-hidden mb-2.5">
                  <div 
                    className="bg-[#111111] h-full rounded-full" 
                    style={{ width: `${Math.min(100, item.share * 2)}%` }} 
                  />
                </div>

                <p className="text-[11px] text-[#666666] leading-relaxed">
                  {item.summary}
                </p>
              </div>

              <div className="pt-2 border-t border-neutral-200/60 flex items-center justify-between text-[10px] text-[#888888] font-mono">
                <span>Impact Share</span>
                <span className="font-medium text-[#111111]">~{item.share}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}