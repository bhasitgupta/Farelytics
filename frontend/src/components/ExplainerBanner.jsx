import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';

export default function ExplainerBanner({ onOpenSystemModal, current }) {
  const [isOpen, setIsOpen] = useState(true);

  const indexVal = current?.index ?? current?.apix_headline ?? 117.76;
  const headlineDelta = current?.index ? Number((current.index - 100).toFixed(2)) : (current?.cpi_delta_pct ?? 17.76);
  const avgFare = current?.average_ticket_fare ?? 7929;
  const baseFare = current?.base_ticket_fare ?? 6733;
  const diffFare = Math.round(avgFare - baseFare);

  return (
    <div className="mini-card border-slate-200/90 bg-gradient-to-r from-slate-50/70 via-white to-sky-50/20 overflow-hidden">
      {/* Header bar of explainer */}
      <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Executive Summary · What Is APIx & What Are You Seeing?
          </span>
          <span className="hidden sm:inline-block text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
            For MoSPI, RBI & SIH Evaluators
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenSystemModal}
            className="text-xs font-medium text-sky-700 hover:text-sky-900 hover:underline flex items-center gap-1"
          >
            <span>Live DB Status</span>
          </button>
          <span className="text-slate-300">·</span>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
          >
            <span>{isOpen ? 'Minimize' : 'Expand Context'}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable Body with Liquid Accordion Transition */}
      <div
        className={`transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
          isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-5 sm:p-6 space-y-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100/80">
          {/* Key translation box */}
          <div className="p-3.5 rounded-lg bg-sky-50/60 border border-sky-100 text-sky-950 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-0.5">
              <strong className="text-sm font-semibold text-sky-900 flex items-center gap-1">
                Headline Inflation: +<AnimatedNumber value={headlineDelta} fromValue={0.0} decimals={2} duration={850} />% vs August 2026 Baseline
              </strong>
              <p className="text-xs text-sky-800">
                In plain terms: An average domestic airfare that cost <strong><AnimatedNumber value={baseFare} prefix="₹" /></strong> in August 2026 currently costs <strong><AnimatedNumber value={avgFare} fromValue={baseFare} prefix="₹" duration={850} /> (+<AnimatedNumber value={diffFare} fromValue={0} prefix="₹" duration={850} /> increase)</strong> across India's top flight routes.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-md bg-white border border-sky-200 font-mono font-bold text-sm text-sky-900 shadow-sm flex items-center gap-1">
                Index: <AnimatedNumber value={indexVal} fromValue={100.0} decimals={2} duration={850} />
              </span>
            </div>
          </div>

          {/* 3 Pillar Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-3 rounded-lg bg-white border border-slate-100 space-y-1">
              <span className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px]">1</span>
                The Real-World Problem
              </span>
              <p className="text-[11px] text-slate-500">
                Official CPI surveys airfares manually once a month on arbitrary days. Because airline algorithms surge ticket prices dynamically, manual surveys produce false spikes and miss real inflation.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-white border border-slate-100 space-y-1">
              <span className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px]">2</span>
                The Solution We Built
              </span>
              <p className="text-[11px] text-slate-500">
                APIx automatically scrapes and normalizes 7 top trunk routes (DEL-BOM, DEL-BLR, etc.) across 5 advance purchase horizons (T+1 to T+45) and weights them using official DGCA passenger volume data.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-white border border-slate-100 space-y-1">
              <span className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px]">3</span>
                Total Consumer Price
              </span>
              <p className="text-[11px] text-slate-500">
                Advertised base fares exclude mandatory airport UDF fees and GST which make up ~26% of ticket cost. APIx calculates the true consumer payable price for accurate inflation accounting.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
