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
        <div className="w-5 h-5 mx-auto border-2 border-[#2D2D2D] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-[#737373] mt-2 font-medium">Loading lead-time curve...</p>
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
        <h2 className="text-sm font-semibold text-[#2D2D2D] tracking-tight">
          Advance Purchase Lead-Time Elasticity Curve
        </h2>
        <p className="text-xs text-[#4D4D4D] mt-0.5">
          How flight prices surge as departure date approaches (from 45 days ahead down to 1 day before)
        </p>
      </div>

      {/* Headline Consumer Impact Box */}
      <div className="p-4 rounded-xl bg-white border border-[#DFDDD8] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs shadow-tactile">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373] block">
            Consumer Elasticity Insight
          </span>
          <span className="text-sm font-semibold text-[#2D2D2D] mt-0.5 block">
            Booking 30 days ahead saves <span className="text-[#3171C6] font-bold"><AnimatedNumber value={savingsT30VsT1} decimals={0} prefix="₹" duration={700} /></span> (<AnimatedNumber value={savingsPct} decimals={0} suffix="%" duration={700} />) vs next-day departure
          </span>
          <span className="text-[#4D4D4D] mt-0.5 block">
            Urgent T+1 booking averages ₹{Math.round(surgeT1).toLocaleString()} while planned T+30 booking averages ₹{Math.round(baselineT30).toLocaleString()}.
          </span>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-[#F4F3F1] text-[#2D2D2D] border border-[#DFDDD8] font-mono font-bold text-xs flex items-center gap-1 shadow-tactile">
            <ArrowDown className="w-3.5 h-3.5 text-[#3171C6]" />
            -<AnimatedNumber value={savingsPct} decimals={0} suffix="% Advance Saving" duration={700} />
          </span>
        </div>
      </div>

      {/* Main Elasticity Card */}
      <div className="mini-card p-6 sm:p-8 space-y-6 bg-white border-[#DFDDD8] shadow-tactile">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#DFDDD8] pb-4">
          <span className="text-xs font-semibold text-[#2D2D2D] uppercase tracking-wider">
            Fare Progression Across 5 Standard Horizons
          </span>
          <span className="text-xs font-mono text-[#737373]">
            CPI Standard Reference: <strong className="text-[#3171C6]">T+30 = 1.00x Baseline</strong>
          </span>
        </div>

        <div className="space-y-5">
          {curve.map((item) => {
            const pctOfMax = (item.average_fare / maxFare) * 100;
            const ratioVsT30 = item.average_fare / baselineT30;
            const discountVsT1 = Math.round(((surgeT1 - item.average_fare) / surgeT1) * 100);

            const horizonDetails = {
              1: { name: '1 Day Before (Departure Tomorrow)', tag: 'Urgent Surge', isSpecial: false },
              7: { name: '7 Days Advance (1 Week Ahead)', tag: 'Near-Term Travel', isSpecial: false },
              15: { name: '15 Days Advance (Mid Horizon)', tag: 'Moderate Window', isSpecial: false },
              30: { name: '30 Days Advance (1 Month Ahead)', tag: 'Official CPI Specification', isSpecial: true },
              45: { name: '45 Days Advance (Early Bird)', tag: 'Early Window', isSpecial: false },
            }[item.days] || { name: `${item.days} Days Advance`, tag: 'Custom Horizon', isSpecial: false };

            return (
              <div key={item.lead_time} className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-[#F4F3F1] text-[#2D2D2D] border border-[#DFDDD8]">
                      {item.lead_time}
                    </span>
                    <span className="text-[#2D2D2D] font-semibold">
                      {horizonDetails.name}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${
                      horizonDetails.isSpecial
                        ? 'bg-[#2D2D2D] text-white border-[#2D2D2D]'
                        : 'bg-[#F4F3F1] text-[#4D4D4D] border-[#DFDDD8]'
                    }`}>
                      {horizonDetails.tag}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 font-mono text-xs">
                    {discountVsT1 > 0 && (
                      <span className="text-[#3171C6] font-medium">
                        <AnimatedNumber value={discountVsT1} decimals={0} prefix="-" suffix="% vs T+1" duration={650} />
                      </span>
                    )}
                    <span className="text-[#737373]">
                      Multiplier: <strong className="text-[#2D2D2D] font-medium"><AnimatedNumber value={ratioVsT30} decimals={2} suffix="x" duration={650} /></strong>
                    </span>
                    <span className="font-bold text-base text-[#2D2D2D] tabular-nums">
                      <AnimatedNumber value={item.average_fare} decimals={0} prefix="₹" duration={650} />
                    </span>
                  </div>
                </div>

                {/* Single-tone clean bar with smooth transition */}
                <div className="w-full h-2 rounded-full bg-[#EBEBEB] overflow-hidden">
                  <div
                    style={{ width: `${pctOfMax}%` }}
                    className={`h-full rounded-full transition-all duration-700 ${
                      item.days === 30 ? 'bg-[#3171C6]' : (item.days === 1 ? 'bg-[#2D2D2D]' : 'bg-[#4D4D4D]')
                    }`}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Methodological Context */}
        <div className="mt-8 pt-6 border-t border-[#DFDDD8] text-xs text-[#4D4D4D] leading-relaxed flex items-start gap-3">
          <Info className="w-4 h-4 text-[#3171C6] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#2D2D2D] font-medium block">
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
