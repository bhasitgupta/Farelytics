import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Search, ShieldCheck } from 'lucide-react';
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
        <div className="w-5 h-5 mx-auto border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 mt-2 font-medium">Loading index data...</p>
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

  // Chart coordinates
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
    ? points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '')
    : '';

  const areaD = points.length
    ? `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${(padding.top + innerH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padding.top + innerH).toFixed(1)} Z`
    : '';

  const baselineY = padding.top + innerH - ((100.0 - minVal) / range) * innerH;

  const avgTicket = current?.average_ticket_fare || 7929;
  const baseTicket = current?.base_ticket_fare || 6733;
  const rupeeDiff = Math.round(avgTicket - baseTicket);
  const inflationPct = current ? (current.index - 100.0).toFixed(2) : '17.76';

  return (
    <div className="space-y-6">
      {/* Headline Metric Card */}
      <div className="mini-card p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="font-semibold text-slate-800">Headline Airfare Inflation (Aug 2026 = 100.0)</span>
              <span>·</span>
              <span className="text-emerald-700 font-semibold">Active CPI Feed</span>
            </div>

            {/* Dual Metric Display: Index + Rupee Equivalent */}
            <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3">
              {/* Primary Index */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  National Price Index
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-5xl font-bold tracking-tight text-slate-900 tabular-nums">
                    <AnimatedNumber value={current?.index || 117.76} fromValue={100.0} decimals={2} duration={850} />
                  </span>
                  <span className="text-sm font-semibold text-emerald-700 flex items-center bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    <ArrowUpRight className="w-4 h-4 mr-0.5" />
                    <AnimatedNumber value={parseFloat(inflationPct)} fromValue={0.0} decimals={2} prefix="+" suffix="%" duration={850} />
                  </span>
                </div>
              </div>

              {/* Rupee Equivalent */}
              <div className="border-l border-slate-200 pl-6 hidden sm:block">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Mean Total Ticket Price
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
                    <AnimatedNumber value={avgTicket} fromValue={baseTicket} decimals={0} prefix="₹" duration={850} />
                  </span>
                  <span className="text-xs font-mono font-medium text-slate-500">
                    <AnimatedNumber value={Math.abs(rupeeDiff)} fromValue={0} decimals={0} prefix={rupeeDiff >= 0 ? "+₹" : "-₹"} suffix={` vs Aug base (₹${baseTicket.toLocaleString()})`} duration={850} />
                  </span>
                </div>
              </div>
            </div>

            {/* Plain English Narrative */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600 max-w-2xl leading-relaxed">
              <strong className="text-slate-900 font-medium">In plain terms: </strong>
              Domestic airline tickets across India are currently <strong>{inflationPct}% more expensive</strong> than the August 2026 base period. Calculated across India's top 7 domestic routes weighted by official DGCA passenger volume.
            </div>
          </div>

          {/* Granularity & Audit Action */}
          <div className="flex flex-col sm:items-end gap-3 shrink-0">
            {/* Granularity Toggle */}
            <div className="inline-flex p-1 rounded-lg bg-slate-100 border border-slate-200/80">
              {['daily', 'weekly', 'monthly'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGranularity(g)}
                  className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-all ${
                    granularity === g
                      ? 'bg-white text-slate-900 shadow-sm font-semibold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onInspectLineage(1)}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium py-1 px-2.5 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span>Trace Observation Lineage</span>
            </button>
          </div>
        </div>

        {/* Minimal Metrics Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Latest Daily Publication</span>
            <span className="font-semibold text-slate-900 mt-0.5 block font-mono">{current?.period}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Base Reference Period</span>
            <span className="font-semibold text-slate-900 mt-0.5 block font-mono">{current?.base_period} = 100.0</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Domestic Route Coverage</span>
            <span className="font-semibold text-slate-900 mt-0.5 block font-mono">{((current?.coverage || 1) * 100).toFixed(0)}% Representative</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Passenger Weight Source</span>
            <span className="font-semibold text-slate-900 mt-0.5 block">DGCA City-Pairs Matrix</span>
          </div>
        </div>
      </div>

      {/* Minimalist Chart Container */}
      <div className="mini-card p-6 sm:p-8 relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Index Trend Curve
          </h3>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-slate-900 inline-block"></span> APIx
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 border-t border-dashed border-amber-500 inline-block"></span> Base (100.0)
            </span>
          </div>
        </div>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900 text-white py-1.5 px-2.5 rounded shadow-lg text-[11px] font-mono space-y-0.5 transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${(hoveredPoint.x / chartWidth) * 100}%`,
              top: `${(hoveredPoint.y / chartHeight) * 100}%`,
              marginTop: '-8px'
            }}
          >
            <div className="text-slate-400 text-[10px]">{hoveredPoint.period}</div>
            <div className="font-semibold text-white">APIx {hoveredPoint.index.toFixed(2)}</div>
            <div className="text-emerald-400 text-[10px]">+{(hoveredPoint.index - 100.0).toFixed(2)} pts</div>
          </div>
        )}

        {/* SVG Chart */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto min-w-[580px] select-none"
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <defs>
              <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0f172a" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {/* Subtle Grid Lines */}
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
                    stroke={isBase ? "#f59e0b" : "#f1f5f9"}
                    strokeDasharray={isBase ? "4 4" : "none"}
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 3.5}
                    textAnchor="end"
                    className={`text-[10px] font-mono ${isBase ? "fill-amber-600 font-medium" : "fill-slate-400"}`}
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

            {/* Line Path */}
            <path
              d={pathD}
              fill="none"
              stroke="#0f172a"
              strokeWidth="2.2"
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
                className="fill-slate-900 cursor-pointer transition-all"
                onMouseEnter={() => setHoveredPoint(p)}
              />
            ))}

            {/* Clean X-Axis Labels */}
            {points.length > 0 && (
              <>
                <text
                  x={points[0].x}
                  y={chartHeight - 10}
                  textAnchor="start"
                  className="text-[10px] font-mono fill-slate-400"
                >
                  {points[0].period}
                </text>

                {points.length > 2 && (
                  <text
                    x={points[Math.floor(points.length / 2)].x}
                    y={chartHeight - 10}
                    textAnchor="middle"
                    className="text-[10px] font-mono fill-slate-400"
                  >
                    {points[Math.floor(points.length / 2)].period}
                  </text>
                )}

                <text
                  x={points[points.length - 1].x}
                  y={chartHeight - 10}
                  textAnchor="end"
                  className="text-[10px] font-mono fill-slate-400"
                >
                  {points[points.length - 1].period}
                </text>
              </>
            )}
          </svg>
        </div>
      </div>

      {/* 5-Factor Decomposition - Minimalist Grid */}
      <div className="mini-card p-6 sm:p-8">
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Price Shift Decomposition
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Breakdown of headline inflation (+{(current?.index - 100.0).toFixed(2)} pts) by structural factor
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {[
            { label: 'Route Effect', val: current?.decomposition?.route_effect, desc: 'Sector volume variance' },
            { label: 'Lead-Time Effect', val: current?.decomposition?.lead_time_effect, desc: 'Advance booking curve' },
            { label: 'Carrier Effect', val: current?.decomposition?.carrier_effect, desc: 'FSC vs LCC spread' },
            { label: 'Tax & Fee Effect', val: current?.decomposition?.tax_fee_effect, desc: 'Airport charges & GST' },
            { label: 'Availability Effect', val: current?.decomposition?.availability_effect, desc: 'Inventory depletion' },
          ].map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-lg bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-colors">
              <span className="text-[11px] font-medium text-slate-500 block truncate">{item.label}</span>
              <div className="mt-1 text-base font-semibold font-mono text-slate-900 tabular-nums">
                <AnimatedNumber
                  value={item.val || 0}
                  decimals={2}
                  prefix={item.val !== undefined && item.val >= 0 ? "+" : ""}
                  duration={600}
                />
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5 truncate">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
