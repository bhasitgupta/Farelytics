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
// Refactor progress checkpoint: step 1/6
          <span className="text-xs font-bold uppercase tracking-wider text-[#171717]">
            Executive Summary · What Is Farelytics & What Are You Seeing?
          </span>
          <span className="hidden sm:inline-block text-[11px] font-medium text-[#171717] bg-white px-2 py-0.5 rounded border border-[#DEDEDE]">
            For MoSPI, RBI & Economic Analysts
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenSystemModal}
            className="text-xs font-medium text-[#F25623] hover:underline flex items-center gap-1"
          >
            <span>Operations Console</span>
          </button>
          <span className="text-[#DEDEDE]">·</span>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-xs text-[#4D4D4D] hover:text-[#171717] flex items-center gap-1 font-medium"
          >
            <span>{isOpen ? 'Minimize' : 'Expand Context'}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable Body */}
      <div
        className={`transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
          isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-5 sm:p-6 space-y-4 text-xs text-[#4D4D4D] leading-relaxed border-t border-[#DEDEDE]/60">
          {/* Key translation box */}
          <div className="p-3.5 rounded-lg bg-[#FAFAFA] border border-[#DEDEDE] text-[#171717] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-0.5">
              <strong className="text-sm font-semibold text-[#171717] flex items-center gap-1">
                Headline Inflation: <span className="text-[#F25623] font-bold">+{headlineDelta}%</span> vs August 2026 Baseline
              </strong>
              <p className="text-xs text-[#4D4D4D]">
                In plain terms: An average domestic airfare that cost <strong><AnimatedNumber value={baseFare} prefix="₹" /></strong> in August 2026 currently costs <strong><AnimatedNumber value={avgFare} fromValue={baseFare} prefix="₹" duration={850} /> (+<AnimatedNumber value={diffFare} fromValue={0} prefix="₹" duration={850} /> increase)</strong> across India's top flight routes.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-lg bg-white border border-[#DEDEDE] font-mono font-bold text-sm text-[#171717] shadow-tactile flex items-center gap-1.5">
                <span className="text-[10px] text-[#737373] uppercase font-sans">Index</span>
                <span className="text-[#F25623]">
                  <AnimatedNumber value={indexVal} fromValue={100.0} decimals={2} duration={850} />
                </span>
              </span>
            </div>
          </div>

          {/* 3 Pillar Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-3.5 rounded-lg bg-white border border-[#DEDEDE] space-y-1">
              <span className="text-[11px] font-bold text-[#171717] flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#171717] text-white flex items-center justify-center text-[10px] font-bold">1</span>
                The Real-World Problem
              </span>
              <p className="text-[11px] text-[#4D4D4D]">
                Official CPI surveys airfares manually once a month on arbitrary days. Because airline algorithms surge ticket prices dynamically, manual surveys produce false spikes and miss real inflation.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-white border border-[#DEDEDE] space-y-1">
              <span className="text-[11px] font-bold text-[#171717] flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#171717] text-white flex items-center justify-center text-[10px] font-bold">2</span>
                The Solution Built: Farelytics
              </span>
              <p className="text-[11px] text-[#4D4D4D]">
                Farelytics automatically collects and normalizes 7 top trunk routes (DEL-BOM, DEL-BLR, etc.) across 5 advance purchase horizons (T+1 to T+45) and weights them using official DGCA passenger volume data.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-white border border-[#DEDEDE] space-y-1">
              <span className="text-[11px] font-bold text-[#171717] flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#171717] text-white flex items-center justify-center text-[10px] font-bold">3</span>
                Total Consumer Price
              </span>
              <p className="text-[11px] text-[#4D4D4D]">
                Advertised base fares exclude mandatory airport UDF fees and GST which make up ~26% of ticket cost. Farelytics calculates the true consumer payable price for accurate inflation accounting.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}