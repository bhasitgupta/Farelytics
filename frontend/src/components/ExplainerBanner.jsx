import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info, Activity } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';

export default function ExplainerBanner({ onOpenSystemModal, current }) {
  const [isOpen, setIsOpen] = useState(false);

  const indexVal = current?.index ?? current?.apix_headline ?? 107.20;
  const headlineDelta = current?.index ? Number((current.index - 100).toFixed(2)) : (current?.cpi_delta_pct ?? 7.20);
  const avgFare = current?.average_ticket_fare ?? 7851;
  const baseFare = current?.base_ticket_fare ?? 7324;
  const diffFare = Math.round(avgFare - baseFare);

  return (
    <div className="rounded-2xl border border-[#E5E5E5] bg-white overflow-hidden shadow-xs transition-all">
      {/* Sleek, Non-Intrusive Quick-Context Ribbon */}
      <div className="px-4 py-2.5 sm:px-5 sm:py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-neutral-50/80">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-[#E5E5E5] text-[#111111] text-[11px] font-mono font-medium shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3171C6] animate-pulse"></span>
            LIVE AIRFARE BENCHMARK
          </span>
          <p className="text-xs text-[#555555] font-normal leading-tight">
            Tracking actual out-of-pocket domestic flight inflation across India's top 7 trunk corridors.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-end md:self-auto shrink-0">
          {/* Quick Stat Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#E5E5E5] text-xs font-mono shadow-xs">
            <span className="text-[#888888]">Avg Fare:</span>
            <strong className="text-[#111111] font-semibold">
              <AnimatedNumber value={avgFare} fromValue={baseFare} prefix="₹" duration={850} />
            </strong>
            <span className="text-[#3171C6] font-medium">
              (+<AnimatedNumber value={diffFare} fromValue={0} prefix="₹" duration={850} />)
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-xs font-medium text-[#111111] hover:text-black flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-[#E5E5E5] shadow-xs transition-colors cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-[#3171C6]" />
            <span>{isOpen ? 'Hide Context' : 'How This Works'}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={onOpenSystemModal}
            className="text-xs font-medium text-[#666666] hover:text-[#111111] flex items-center gap-1 px-2.5 py-1 transition-colors cursor-pointer"
          >
            <Activity className="w-3 h-3 text-[#888888]" />
            <span>Operations</span>
          </button>
        </div>
      </div>

      {/* Expandable Methodology & Context Drawer */}
      <div
        className={`transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
          isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 sm:p-5 space-y-3.5 text-xs text-[#555555] border-t border-[#E5E5E5] bg-white">
          {/* Plain-English Headline Card */}
          <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E5E5] text-[#111111] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <strong className="text-sm font-medium text-[#111111] flex items-center gap-1.5">
                Headline Inflation: <span className="text-[#3171C6] font-semibold">+{headlineDelta}%</span> vs August 2026 Baseline
              </strong>
              <p className="text-xs text-[#555555] leading-relaxed">
                In plain terms: An average domestic airfare that cost <strong><AnimatedNumber value={baseFare} prefix="₹" /></strong> in August 2026 currently costs <strong><AnimatedNumber value={avgFare} fromValue={baseFare} prefix="₹" duration={850} /> (+<AnimatedNumber value={diffFare} fromValue={0} prefix="₹" duration={850} /> increase)</strong> across India's top flight routes.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-full bg-white border border-[#E5E5E5] font-mono font-medium text-sm text-[#111111] shadow-xs flex items-center gap-1.5">
                <span className="text-[10px] text-[#888888] uppercase font-sans">Index</span>
                <span className="text-[#3171C6] font-semibold">
                  <AnimatedNumber value={indexVal} fromValue={100.0} decimals={2} duration={850} />
                </span>
              </span>
            </div>
          </div>

          {/* 3 Pillar Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-white border border-[#E5E5E5] space-y-1.5">
              <span className="text-xs font-semibold text-[#111111] flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#111111] text-white flex items-center justify-center text-[10px] font-medium">1</span>
                The Real-World Problem
              </span>
              <p className="text-xs text-[#555555] leading-relaxed">
                Official CPI surveys airfares manually once a month on arbitrary days. Because airline algorithms surge ticket prices dynamically, manual surveys produce false spikes and miss real inflation.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E5E5E5] space-y-1.5">
              <span className="text-xs font-semibold text-[#111111] flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#111111] text-white flex items-center justify-center text-[10px] font-medium">2</span>
                The Solution Built: Farelytics
              </span>
              <p className="text-xs text-[#555555] leading-relaxed">
                Farelytics automatically collects and normalizes 7 top trunk routes (DEL-BOM, DEL-BLR, etc.) across 5 advance purchase horizons (T+1 to T+45) and weights them using official DGCA passenger volume data.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E5E5E5] space-y-1.5">
              <span className="text-xs font-semibold text-[#111111] flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#111111] text-white flex items-center justify-center text-[10px] font-medium">3</span>
                Total Consumer Price
              </span>
              <p className="text-xs text-[#555555] leading-relaxed">
                Advertised base fares exclude mandatory airport UDF fees and GST which make up ~26% of ticket cost. Farelytics calculates the true consumer payable price for accurate inflation accounting.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
