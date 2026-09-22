import React, { useState, useEffect } from 'react';
import { fetchLeadTimeCurve } from '../services/api';
import { ArrowDown, Info } from 'lucide-react';
import AnimatedNumber from '../components/AnimatedNumber';

export default function LeadTimeView({ refreshTrigger }) {
  const [curve, setCurve] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchLeadTimeCurve()
      .then(setCurve)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-5 h-5 mx-auto border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 mt-2 font-medium">Loading lead-time curve...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
        Failed to load: {error}
      </div>
    );
  }

  const maxFare = Math.max(...curve.map((c) => c.average_fare), 10000);
  const baselineT30 = curve.find((c) => c.days === 30)?.average_fare || 5500;
  const surgeT1 = curve.find((c) => c.days === 1)?.average_fare || 9000;
  const savingsT30VsT1 = Math.round(surgeT1 - baselineT30);
  const savingsPct = Math.round((savingsT30VsT1 / surgeT1) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
          Advance Purchase Lead-Time Elasticity Curve
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          How flight prices surge as departure date approaches (from 45 days ahead down to 1 day before)
        </p>
      </div>

      {/* Headline Consumer Impact Box */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Consumer Elasticity Insight
          </span>
          <span className="text-sm font-semibold text-slate-900 mt-0.5 block">
            Booking 30 days ahead saves <AnimatedNumber value={savingsT30VsT1} decimals={0} prefix="₹" duration={700} /> (<AnimatedNumber value={savingsPct} decimals={0} suffix="%" duration={700} />) vs next-day departure
          </span>
          <span className="text-slate-500 mt-0.5 block">
            Urgent T+1 booking averages ₹{Math.round(surgeT1).toLocaleString()} while planned T+30 booking averages ₹{Math.round(baselineT30).toLocaleString()}.
          </span>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-bold text-xs flex items-center gap-1">
            <ArrowDown className="w-3.5 h-3.5" />
            -<AnimatedNumber value={savingsPct} decimals={0} suffix="% Advance Saving" duration={700} />
          </span>
        </div>
      </div>

      {/* Main Elasticity Card */}
      <div className="mini-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
          <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Fare Progression Across 5 Standard Horizons
          </span>
          <span className="text-xs font-mono text-slate-400">
            CPI Standard Reference: T+30 = 1.00x Baseline
          </span>
        </div>

        <div className="space-y-5">
          {curve.map((item) => {
            const pctOfMax = (item.average_fare / maxFare) * 100;
            const ratioVsT30 = item.average_fare / baselineT30;
            const discountVsT1 = Math.round(((surgeT1 - item.average_fare) / surgeT1) * 100);

            const horizonDetails = {
              1: { name: '1 Day Before (Departure Tomorrow)', tag: 'Urgent / Business Surge', color: 'bg-rose-50 text-rose-800 border-rose-200' },
              7: { name: '7 Days Advance (1 Week Ahead)', tag: 'Near-Term Travel', color: 'bg-amber-50 text-amber-800 border-amber-200' },
              14: { name: '14 Days Advance (2 Weeks Ahead)', tag: 'Moderate Window', color: 'bg-slate-100 text-slate-700 border-slate-200' },
              30: { name: '30 Days Advance (1 Month Ahead)', tag: 'Official CPI Specification', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
              45: { name: '45 Days Advance (Early Bird)', tag: 'Advance Planning Window', color: 'bg-sky-50 text-sky-800 border-sky-200' },
            }[item.days] || { name: `${item.days} Days Advance`, tag: 'Custom Horizon', color: 'bg-slate-100 text-slate-700 border-slate-200' };

            return (
              <div key={item.lead_time} className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200/60">
                      {item.lead_time}
                    </span>
                    <span className="text-slate-800 font-semibold">
                      {horizonDetails.name}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${horizonDetails.color}`}>
                      {horizonDetails.tag}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 font-mono text-xs">
                    {discountVsT1 > 0 && (
                      <span className="text-emerald-700 font-medium">
                        <AnimatedNumber value={discountVsT1} decimals={0} prefix="-" suffix="% vs T+1" duration={650} />
                      </span>
                    )}
                    <span className="text-slate-400">
                      Multiplier: <strong className="text-slate-700 font-medium"><AnimatedNumber value={ratioVsT30} decimals={2} suffix="x" duration={650} /></strong>
                    </span>
                    <span className="font-bold text-base text-slate-900 tabular-nums">
                      <AnimatedNumber value={item.average_fare} decimals={0} prefix="₹" duration={650} />
                    </span>
                  </div>
                </div>

                {/* Single-tone clean bar with smooth transition */}
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    style={{ width: `${pctOfMax}%` }}
                    className={`h-full rounded-full transition-all duration-700 ${
                      item.days === 30 ? 'bg-emerald-600' : (item.days === 1 ? 'bg-slate-900' : 'bg-slate-700')
                    }`}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Methodological Context */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-500 leading-relaxed flex items-start gap-3">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-800 font-medium block">
              Why BLS, Eurostat, and MoSPI fix advance booking horizons:
            </strong>
            <p className="mt-0.5">
              Tickets bought 1 day before departure and 30 days before departure are fundamentally different economic products. If an inflation surveyor mixes them up at random, the index measures consumer panic rather than price inflation. APIx tracks distinct fixed horizons to ensure authentic like-for-like inflation comparison.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
