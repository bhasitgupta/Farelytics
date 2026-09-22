import React, { useState, useEffect } from 'react';
import { fetchBacktest } from '../services/api';
import AnimatedNumber from '../components/AnimatedNumber';

export default function BacktestView({ refreshTrigger }) {
  const [backtest, setBacktest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchBacktest()
      .then(setBacktest)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-5 h-5 mx-auto border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 mt-2 font-medium">Computing 30-day DGCA backtest validation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
        Failed to load backtest: {error}
      </div>
    );
  }

  const series = backtest.series || [];
  const allVals = series.flatMap((s) => [s.apix, s.dgca_benchmark]);
  const minVal = allVals.length ? Math.floor(Math.min(...allVals, 99)) : 95;
  const maxVal = allVals.length ? Math.ceil(Math.max(...allVals, 112)) : 115;
  const range = maxVal - minVal || 1;

  const chartHeight = 240;
  const chartWidth = 720;
  const padding = { top: 20, bottom: 35, left: 45, right: 35 };
  const innerW = chartWidth - padding.left - padding.right;
  const innerH = chartHeight - padding.top - padding.bottom;

  const apixPoints = series.map((s, i) => ({
    x: padding.left + (i / Math.max(1, series.length - 1)) * innerW,
    y: padding.top + innerH - ((s.apix - minVal) / range) * innerH,
    ...s
  }));

  const dgcaPoints = series.map((s, i) => ({
    x: padding.left + (i / Math.max(1, series.length - 1)) * innerW,
    y: padding.top + innerH - ((s.dgca_benchmark - minVal) / range) * innerH,
    ...s
  }));

  const apixPath = apixPoints.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '');
  const dgcaPath = dgcaPoints.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
          DGCA Benchmark Validation
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Independent quantitative evaluation comparing reconstructed APIx against official DGCA monthly passenger fare data
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-tactile p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Pearson Correlation (r)
          </span>
          <div className="mt-2 text-3xl font-bold font-mono text-slate-900 tabular-nums">
            <AnimatedNumber value={backtest.correlation} decimals={3} duration={700} />
          </div>
          <span className="text-[11px] text-emerald-700 font-medium block mt-2">
            High statistical alignment
          </span>
        </div>

        <div className="card-tactile p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Directional Accuracy
          </span>
          <div className="mt-2 text-3xl font-bold font-mono text-slate-900 tabular-nums">
            <AnimatedNumber value={backtest.directional_accuracy} decimals={1} suffix="%" duration={700} />
          </div>
          <span className="text-[11px] text-slate-400 block mt-2">
            Movement agreement rate
          </span>
        </div>

        <div className="card-tactile p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Mean Absolute Error
          </span>
          <div className="mt-2 text-3xl font-bold font-mono text-slate-900 tabular-nums">
            <AnimatedNumber value={backtest.mae} decimals={2} suffix=" pts" duration={700} />
          </div>
          <span className="text-[11px] text-slate-400 block mt-2">
            Avg spread vs benchmark
          </span>
        </div>

        <div className="card-tactile p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Root Mean Squared (RMSE)
          </span>
          <div className="mt-2 text-3xl font-bold font-mono text-slate-900 tabular-nums">
            <AnimatedNumber value={backtest.rmse} decimals={2} suffix=" pts" duration={700} />
          </div>
          <span className="text-[11px] text-slate-400 block mt-2">
            Variance penalization
          </span>
        </div>
      </div>

      {/* Dual Series Line Chart */}
      <div className="card-tactile p-6 sm:p-8 relative">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Dual Tracking Timeline
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">30-day continuous timeline comparison</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-slate-900 inline-block"></span>
              <span className="text-slate-800 font-medium">APIx Daily</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 border-t border-dashed border-amber-600 inline-block"></span>
              <span className="text-amber-700 font-medium">DGCA Benchmark</span>
            </div>
          </div>
        </div>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900 text-white p-2.5 rounded shadow-xl text-xs font-mono space-y-1 transform -translate-x-1/2 -translate-y-full transition-all duration-75"
            style={{
              left: `${(hoveredPoint.x / chartWidth) * 100}%`,
              top: `${(hoveredPoint.y / chartHeight) * 100}%`,
              marginTop: '-10px'
            }}
          >
            <div className="text-[10px] text-slate-400 font-sans">{hoveredPoint.date}</div>
            <div className="text-xs font-semibold text-white">
              APIx: {hoveredPoint.apix.toFixed(2)}
            </div>
            <div className="text-xs font-semibold text-amber-300">
              DGCA: {hoveredPoint.dgca_benchmark.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-300">
              Spread: {hoveredPoint.spread > 0 ? `+${hoveredPoint.spread.toFixed(2)}` : hoveredPoint.spread.toFixed(2)} pts
            </div>
          </div>
        )}

        {/* SVG Container */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto min-w-[580px] select-none"
            onMouseLeave={() => setHoveredPoint(null)}
          >
            {/* Grid Lines */}
            {[minVal, 100.0, maxVal].map((v) => {
              const y = padding.top + innerH - ((v - minVal) / range) * innerH;
              return (
                <g key={v}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={chartWidth - padding.right}
                    y2={y}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 3.5}
                    textAnchor="end"
                    className="text-[10px] font-mono fill-slate-400"
                  >
                    {v.toFixed(0)}
                  </text>
                </g>
              );
            })}

            {/* DGCA Benchmark Line (amber dashed) */}
            <path
              d={dgcaPath}
              fill="none"
              stroke="#d97706"
              strokeWidth="2"
              strokeDasharray="4 4"
              strokeLinecap="round"
            />

            {/* APIx Line (crisp slate) */}
            <path
              d={apixPath}
              fill="none"
              stroke="#0f172a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interactive hover points on APIx line */}
            {apixPoints.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={hoveredPoint?.date === p.date ? 5 : 2.5}
                className="fill-slate-900 cursor-pointer transition-all"
                onMouseEnter={() => setHoveredPoint(p)}
              />
            ))}

            {/* X-axis date labels */}
            {apixPoints.length > 0 && (
              <>
                <text
                  x={apixPoints[0].x}
                  y={chartHeight - 10}
                  textAnchor="start"
                  className="text-[10px] font-mono fill-slate-400"
                >
                  {apixPoints[0].date}
                </text>

                {apixPoints.length > 2 && (
                  <text
                    x={apixPoints[Math.floor(apixPoints.length / 2)].x}
                    y={chartHeight - 10}
                    textAnchor="middle"
                    className="text-[10px] font-mono fill-slate-400"
                  >
                    {apixPoints[Math.floor(apixPoints.length / 2)].date}
                  </text>
                )}

                <text
                  x={apixPoints[apixPoints.length - 1].x}
                  y={chartHeight - 10}
                  textAnchor="end"
                  className="text-[10px] font-mono fill-slate-400"
                >
                  {apixPoints[apixPoints.length - 1].date}
                </text>
              </>
            )}
          </svg>
        </div>
      </div>

      {/* Statistical Disclaimer */}
      <div className="p-5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
        <strong className="text-slate-800 font-semibold block mb-1">
          Statistical Positioning & Scope Note:
        </strong>
        <p>
          {backtest.disclaimer} Correlation with the DGCA benchmark provides empirical proof of measurement validity across high-frequency booking cycles. APIx is strictly positioned as a complementary augmentation feed for NSO / MoSPI price collection, never an override or replacement of official CPI.
        </p>
      </div>
    </div>
  );
}
