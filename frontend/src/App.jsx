import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import ExplainerBanner from './components/ExplainerBanner';
import BackendStatusModal from './components/BackendStatusModal';
import LineageModal from './components/LineageModal';
import NationalIndexView from './views/NationalIndexView';
import RouteHeatmapView from './views/RouteHeatmapView';
import LeadTimeView from './views/LeadTimeView';
import AirlineCompareView from './views/AirlineCompareView';
import FareBreakdownView from './views/FareBreakdownView';
import DataQualityView from './views/DataQualityView';
import BacktestView from './views/BacktestView';
import { triggerPipeline, fetchCurrentIndex } from './services/api';

const TABS = [
  { id: 'national', label: 'Index Overview' },
  { id: 'routes', label: 'Sector Matrix' },
  { id: 'leadtime', label: 'Lead-Time Curve' },
  { id: 'airlines', label: 'Carrier Spread' },
  { id: 'breakdown', label: 'Fare Breakdown' },
  { id: 'quality', label: 'Data Governance' },
  { id: 'backtest', label: 'DGCA Backtest' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('national');
  const [selectedLineageId, setSelectedLineageId] = useState(null);
  const [isSystemModalOpen, setIsSystemModalOpen] = useState(false);
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [toast, setToast] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const tabRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  const loadCurrentIndex = () => {
    fetchCurrentIndex()
      .then(setCurrentIndex)
      .catch((err) => console.error('Failed to load current index:', err));
  };

  useEffect(() => {
    loadCurrentIndex();
  }, [refreshTrigger]);

  useEffect(() => {
    const el = tabRefs.current[activeTab];
    if (el) {
      setIndicatorStyle({
        left: el.offsetLeft,
        width: el.offsetWidth,
        opacity: 1
      });
    }
  }, [activeTab]);

  const handleTriggerPipeline = async () => {
    setIsRunningPipeline(true);
    try {
      const res = await triggerPipeline();
      setToast({
        type: 'success',
        text: `Pipeline cycle completed: APIx = ${res.apix_value}, Quality = ${(res.data_quality_score * 100).toFixed(1)}%`
      });
      setRefreshTrigger((prev) => prev + 1);
      setTimeout(() => setToast(null), 5000);
    } catch (err) {
      setToast({ type: 'error', text: `Pipeline failed: ${err.message}` });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setIsRunningPipeline(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfd] text-slate-900 selection:bg-sky-100 selection:text-sky-900">
      <Header
        onTriggerPipeline={handleTriggerPipeline}
        isRunningPipeline={isRunningPipeline}
        onOpenSystemModal={() => setIsSystemModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Subtle Toast */}
        {toast && (
          <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 flex items-center justify-between shadow-sm">
            <span>{toast.text}</span>
            <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600 text-sm ml-3">×</button>
          </div>
        )}

        {/* Executive Explainer Banner */}
        <ExplainerBanner onOpenSystemModal={() => setIsSystemModalOpen(true)} current={currentIndex} />

        {/* Tactile Tab Navigation with Gliding Pill (Brainwave Inspiration) */}
        <div className="border-b border-slate-200/80 pb-2">
          <nav
            className="relative flex items-center space-x-1 overflow-x-auto scrollbar-none p-1 bg-slate-100/70 rounded-xl border border-slate-200/60 max-w-fit"
            aria-label="Views"
          >
            {/* Sliding Pill Indicator */}
            <div
              className="absolute top-1 bottom-1 bg-slate-900 rounded-lg shadow-sm pointer-events-none transition-all duration-300"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
                opacity: indicatorStyle.opacity,
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            />

            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={(el) => (tabRefs.current[tab.id] = el)}
                  onClick={() => {
                    if (activeTab !== tab.id) setActiveTab(tab.id);
                  }}
                  className={`relative z-10 px-3.5 py-1.5 text-xs whitespace-nowrap rounded-lg font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-white font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Views with Preserved State and Fluid Float Entry */}
        <div className="pt-1">
          <div key={`tab-${activeTab === 'national' ? 'national' : 'off'}`} className={activeTab === 'national' ? 'view-enter' : 'hidden'}>
            <NationalIndexView
              currentData={currentIndex}
              onInspectLineage={(id) => setSelectedLineageId(id)}
              onOpenSystemModal={() => setIsSystemModalOpen(true)}
              refreshTrigger={refreshTrigger}
            />
          </div>
          <div key={`tab-${activeTab === 'routes' ? 'routes' : 'off'}`} className={activeTab === 'routes' ? 'view-enter' : 'hidden'}>
            <RouteHeatmapView refreshTrigger={refreshTrigger} />
          </div>
          <div key={`tab-${activeTab === 'leadtime' ? 'leadtime' : 'off'}`} className={activeTab === 'leadtime' ? 'view-enter' : 'hidden'}>
            <LeadTimeView refreshTrigger={refreshTrigger} />
          </div>
          <div key={`tab-${activeTab === 'airlines' ? 'airlines' : 'off'}`} className={activeTab === 'airlines' ? 'view-enter' : 'hidden'}>
            <AirlineCompareView refreshTrigger={refreshTrigger} />
          </div>
          <div key={`tab-${activeTab === 'breakdown' ? 'breakdown' : 'off'}`} className={activeTab === 'breakdown' ? 'view-enter' : 'hidden'}>
            <FareBreakdownView refreshTrigger={refreshTrigger} />
          </div>
          <div key={`tab-${activeTab === 'quality' ? 'quality' : 'off'}`} className={activeTab === 'quality' ? 'view-enter' : 'hidden'}>
            <DataQualityView refreshTrigger={refreshTrigger} />
          </div>
          <div key={`tab-${activeTab === 'backtest' ? 'backtest' : 'off'}`} className={activeTab === 'backtest' ? 'view-enter' : 'hidden'}>
            <BacktestView refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200 py-6 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            APIx Platform · SIH 2026 Problem Statement 26056 · CPI Augmentation
          </span>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              type="button"
              onClick={() => setIsSystemModalOpen(true)}
              className="hover:text-slate-700 underline underline-offset-2"
            >
              FastAPI Backend :8000 (Inspect DB)
            </button>
            <span>·</span>
            <span>Base Period: 2026-08 = 100.0</span>
          </div>
        </div>
      </footer>

      {/* Lineage Modal */}
      {selectedLineageId && (
        <LineageModal
          indexId={selectedLineageId}
          onClose={() => setSelectedLineageId(null)}
        />
      )}

      {/* System Status Modal */}
      {isSystemModalOpen && (
        <BackendStatusModal
          onClose={() => setIsSystemModalOpen(false)}
        />
      )}
    </div>
  );
}
