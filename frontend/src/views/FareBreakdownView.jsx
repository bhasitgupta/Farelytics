import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { fetchFareBreakdown } from '../services/api';
import AnimatedNumber from '../components/AnimatedNumber';

export default function FareBreakdownView({ refreshTrigger }) {
  const [breakdown, setBreakdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchFareBreakdown()
      .then(setBreakdown)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-5 h-5 mx-auto border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 mt-2 font-medium">Loading fare breakdown...</p>
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

  const totalFare = breakdown.average_base + breakdown.average_taxes + breakdown.average_fees;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
          Fare Component Composition
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Decomposition of consumer payable price: Base Fare vs Statutory GST Taxes vs Airport Charges & Ancillary Fees
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Stacked Bar Breakdown Card */}
        <div className="card-tactile p-6 sm:p-8 lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Cost Allocation
            </span>
            <span className="text-xs font-mono text-slate-500">
              Mean Ticket: <strong className="text-slate-900 font-semibold"><AnimatedNumber value={totalFare} decimals={0} prefix="₹" duration={700} /></strong>
            </span>
          </div>

          {/* Segmented Progress Bar */}
          <div className="space-y-4">
            <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100">
              <div
                style={{ width: `${breakdown.base_fare_percentage}%` }}
                className="bg-slate-900 transition-all duration-700"
                title={`Base Fare: ${breakdown.base_fare_percentage}%`}
              ></div>
              <div
                style={{ width: `${breakdown.fees_percentage}%` }}
                className="bg-slate-400 transition-all duration-700"
                title={`Airport UDF/ADF & Fees: ${breakdown.fees_percentage}%`}
              ></div>
              <div
                style={{ width: `${breakdown.taxes_percentage}%` }}
                className="bg-amber-500 transition-all duration-700"
                title={`Statutory Taxes (GST): ${breakdown.taxes_percentage}%`}
              ></div>
            </div>

            {/* Component Detail Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-lg bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                  Airline Base Fare
                </div>
                <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
                  <AnimatedNumber value={breakdown.average_base} decimals={0} prefix="₹" duration={700} />
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  <AnimatedNumber value={breakdown.base_fare_percentage} decimals={1} suffix="% of ticket" duration={700} />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  Airport UDF & Fees
                </div>
                <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
                  <AnimatedNumber value={breakdown.average_fees} decimals={0} prefix="₹" duration={700} />
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  <AnimatedNumber value={breakdown.fees_percentage} decimals={1} suffix="% of ticket" duration={700} />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Statutory GST (5%)
                </div>
                <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
                  <AnimatedNumber value={breakdown.average_taxes} decimals={0} prefix="₹" duration={700} />
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  <AnimatedNumber value={breakdown.taxes_percentage} decimals={1} suffix="% of ticket" duration={700} />
                </div>
              </div>
            </div>
          </div>

          {/* Explanatory Callout */}
          <div className="pt-2 text-xs text-slate-500 leading-relaxed">
            <strong className="text-slate-800 font-medium block mb-1">
              Why total payable price matters for CPI:
            </strong>
            Advertised base fares exclude mandatory airport fees, security levies, and development charges which comprise ~{breakdown.fees_percentage}% of consumer expenditure. APIx normalises and tracks the full payable consumer price to ensure accurate inflation measurement.
          </div>
        </div>

        {/* Statistical Scope Card */}
        <div className="card-tactile p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Statistical Scope
            </span>
            <h3 className="text-sm font-semibold text-slate-900 mt-1">
              Methodological Standards
            </h3>
            <p className="mt-3 text-xs text-slate-500 leading-relaxed">
              Standard consumer price indices worldwide (such as the U.S. BLS airfare CPI) evaluate all non-refundable mandatory fees incurred by travelers at time of purchase. APIx strictly mirrors this standard, preventing distortion from unbundled ancillary pricing.
            </p>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>MoSPI Transport Sub-Group Aligned</span>
          </div>
        </div>
      </div>
    </div>
  );
}
