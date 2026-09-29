import React, { useState, useEffect } from 'react';
import { fetchAirlineComparison } from '../services/api';
import AnimatedNumber from '../components/AnimatedNumber';

export default function AirlineCompareView({ refreshTrigger }) {
  const [airlines, setAirlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchAirlineComparison()
      .then(setAirlines)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-5 h-5 mx-auto border-2 border-[#2D2D2D] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-[#737373] mt-2 font-medium">Loading carrier comparisons...</p>
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

  const lowestFare = Math.min(...airlines.map((a) => a.average_fare), 5000);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-[#2D2D2D] tracking-tight">
          Carrier Pricing Comparison
        </h2>
        <p className="text-xs text-[#4D4D4D] mt-0.5">
          Side-by-side pricing structures comparing Low-Cost Carriers (LCC) and Full-Service Carriers (FSC) across the representative basket
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {airlines.map((a) => {
          const spreadVsLowest = a.average_fare - lowestFare;
          const isFSC = a.code === 'AI';
          const basePct = Math.round((a.average_base / a.average_fare) * 100);
          const feesPct = 100 - basePct;

          return (
            <div
              key={a.code}
              className="card-tactile p-6 flex flex-col justify-between bg-white border-[#DFDDD8]"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-mono font-medium text-[#737373] uppercase tracking-wider">
                      {a.code}
                    </span>
                    <h3 className="text-base font-bold text-[#2D2D2D] mt-0.5">
                      {a.name}
                    </h3>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#F4F3F1] text-[#4D4D4D] border border-[#DFDDD8]">
                    {isFSC ? 'Full-Service (FSC)' : 'Low-Cost (LCC)'}
                  </span>
                </div>

                {/* Mean Fare */}
                <div className="mt-5 p-4 rounded-lg bg-[#F4F3F1] border border-[#DFDDD8]">
                  <span className="text-[10px] uppercase font-medium text-[#737373] tracking-wider block">
                    Mean Consumer Fare
                  </span>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-3xl font-bold font-mono tracking-tight text-[#2D2D2D] tabular-nums">
                      <AnimatedNumber value={a.average_fare} decimals={0} prefix="₹" duration={700} />
                    </span>
                    {spreadVsLowest > 0 ? (
                      <span className="text-xs font-mono text-[#3171C6] font-medium">
                        +<AnimatedNumber value={Math.round((spreadVsLowest / lowestFare) * 100)} decimals={0} suffix="% vs min" duration={700} />
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-[#2D2D2D] font-semibold bg-white px-2 py-0.5 rounded border border-[#DFDDD8] shadow-tactile">
                        Lowest Baseline
                      </span>
                    )}
                  </div>
                </div>

                {/* Breakdown Details */}
                <div className="mt-5 space-y-2.5 font-mono text-xs">
                  <div className="flex justify-between text-[#4D4D4D]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#2D2D2D] inline-block"></span>
                      Base Fare:
                    </span>
                    <span className="font-semibold text-[#2D2D2D]">
                      <AnimatedNumber value={a.average_base} decimals={0} prefix="₹" duration={700} /> ({basePct}%)
                    </span>
                  </div>

                  <div className="flex justify-between text-[#4D4D4D]">
                    <span className="flex items-center gap-1.5">
// Refactor progress checkpoint: step 4/5
                      Taxes & Fees:
                    </span>
                    <span className="font-semibold text-[#171717]">
                      <AnimatedNumber value={a.average_taxes_fees} decimals={0} prefix="₹" duration={700} /> ({feesPct}%)
                    </span>
                  </div>

                  {/* Proportional Segmented Bar */}
                  <div className="w-full h-1.5 rounded-full overflow-hidden flex bg-[#EBEBEB] mt-2">
                    <div style={{ width: `${basePct}%` }} className="bg-[#171717] h-full transition-all duration-700"></div>
                    <div style={{ width: `${feesPct}%` }} className="bg-[#F25623] h-full transition-all duration-700"></div>
                  </div>
                </div>
              </div>

              {/* Footer info */}
              <div className="mt-6 pt-3 border-t border-[#DEDEDE] text-[11px] text-[#737373] flex items-center justify-between">
                <span>Sample: <AnimatedNumber value={a.sample_size} decimals={0} suffix=" quotes" duration={700} /></span>
                <span className="text-[#171717] font-medium">Standardized</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}