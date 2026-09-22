import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, ArrowUpDown, Info, Plane } from 'lucide-react';
import { fetchRoutesIndex } from '../services/api';
import AnimatedNumber from '../components/AnimatedNumber';

const ROUTE_CITY_NAMES = {
  'DEL-BOM': 'Delhi ↔ Mumbai',
  'DEL-BLR': 'Delhi ↔ Bengaluru',
  'BOM-BLR': 'Mumbai ↔ Bengaluru',
  'DEL-CCU': 'Delhi ↔ Kolkata',
  'BLR-HYD': 'Bengaluru ↔ Hyderabad',
  'MAA-DEL': 'Chennai ↔ Delhi',
  'DEL-HYD': 'Delhi ↔ Hyderabad'
};

export default function RouteHeatmapView({ refreshTrigger }) {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('weight');

  useEffect(() => {
    setLoading(true);
    fetchRoutesIndex()
      .then(setRoutes)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-5 h-5 mx-auto border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 mt-2 font-medium">Loading sector relatives...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
        Failed to load routes: {error}
      </div>
    );
  }

  const sortedRoutes = [...routes].sort((a, b) => {
    if (sortBy === 'weight') return b.weight - a.weight;
    if (sortBy === 'index_desc') return b.index - a.index;
    return a.index - b.index;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
            Sector Price Relatives & Flight Fares
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real rupee ticket prices and inflation relatives vs August 2026 baseline (100.0)
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 cursor-pointer focus:outline-none focus:border-slate-400"
          >
            <option value="weight">Traffic Weight (Highest)</option>
            <option value="index_desc">Inflation Shift (Highest)</option>
            <option value="index_asc">Inflation Shift (Lowest)</option>
          </select>
        </div>
      </div>

      {/* Explainer Note */}
      <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2.5 text-xs text-slate-600">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-800 font-medium">Why Sector Weights Matter: </strong>
          A price surge between Delhi and Mumbai affects far more Indian travelers (24.5% of total domestic traffic) than smaller city pairs. The Laspeyres formula weights high-density trunk routes proportionally to reflect true consumer impact.
        </div>
      </div>

      {/* Clean Route Cards Grid (Flight-Ticket Inspired) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedRoutes.map((r) => {
          const delta = r.index - 100.0;
          const isUp = delta >= 0;
          const cityName = ROUTE_CITY_NAMES[r.route_id] || r.route_id;
          const avgFare = r.average_fare || Math.round(r.index * 54.0);
          const [origin, dest] = r.route_id.split('-');

          return (
            <div
              key={r.route_id}
              className="card-tactile p-5 flex flex-col justify-between"
            >
              <div>
                {/* Flight Path Header (Inspired by Reference 4) */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 font-mono font-bold text-sm text-slate-900">
                    <span>{origin}</span>
                    <span className="flex items-center text-slate-300">
                      <span className="w-3 border-t border-dashed border-slate-300"></span>
                      <Plane className="w-3.5 h-3.5 text-slate-400 mx-1 transform rotate-90" />
                      <span className="w-3 border-t border-dashed border-slate-300"></span>
                    </span>
                    <span>{dest}</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
                    {(r.weight * 100).toFixed(1)}% Traffic
                  </span>
                </div>

                <span className="text-xs text-slate-500 font-medium block mt-2.5">
                  {cityName}
                </span>

                {/* Real Rupee Ticket Fare */}
                <div className="mt-3 p-3 rounded-lg bg-slate-50/80 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Mean Consumer Fare
                  </span>
                  <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums mt-0.5">
                    <AnimatedNumber value={avgFare} decimals={0} prefix="₹" duration={700} />
                  </div>
                </div>

                {/* Relative Index */}
                <div className="mt-3.5 flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-medium text-slate-400 tracking-wider block">
                      Price Relative
                    </span>
                    <span className="text-lg font-bold font-mono tracking-tight text-slate-900 tabular-nums">
                      <AnimatedNumber value={r.index} decimals={2} duration={700} />
                    </span>
                  </div>

                  <div className="flex items-center font-mono font-medium text-xs">
                    {isUp ? (
                      <span className="flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                        <AnimatedNumber value={Math.abs(delta)} decimals={2} prefix="+" suffix="%" duration={700} />
                      </span>
                    ) : (
                      <span className="flex items-center text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                        <AnimatedNumber value={Math.abs(delta)} decimals={2} prefix="-" suffix="%" duration={700} />
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Minimal bar indicator */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-1.5">
                  <span>Base: 100.0</span>
                  <span>Spread: {delta >= 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)} pts</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, Math.max(10, ((r.index - 95) / 20) * 100))}%` }}
                    className="h-full rounded-full bg-slate-900 transition-all duration-300"
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
