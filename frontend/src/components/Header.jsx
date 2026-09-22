import React from 'react';
import { RefreshCw, Server, HelpCircle } from 'lucide-react';

export default function Header({ onTriggerPipeline, isRunningPipeline, onOpenSystemModal }) {
  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-sm">
              A
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-slate-900">APIx</span>
                <button
                  type="button"
                  onClick={onOpenSystemModal}
                  className="text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200/60 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Click to inspect real-time database tables and server status"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  FastAPI :8000 Online
                </button>
                <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
                  · CPI Augmentation Feed
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-Time Airfare Inflation Index for India · MoSPI / NSO & RBI Economics
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenSystemModal}
              className="hidden sm:inline-flex items-center gap-1.5 h-8 px-2.5 text-xs font-medium rounded-md bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-sm transition-all btn-tactile"
            >
              <Server className="w-3.5 h-3.5 text-slate-500" />
              <span>DB Status</span>
            </button>

            <button
              type="button"
              onClick={onTriggerPipeline}
              disabled={isRunningPipeline}
              className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all disabled:opacity-50 btn-tactile"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunningPipeline ? 'animate-spin' : ''}`} />
              <span>{isRunningPipeline ? 'Ingesting...' : 'Run Pipeline'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
