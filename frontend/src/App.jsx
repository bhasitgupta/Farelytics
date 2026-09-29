import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import ExplainerBanner from './components/ExplainerBanner';
import OperationsDrawer from './components/OperationsDrawer';
import LineageModal from './components/LineageModal';
import NationalIndexView from './views/NationalIndexView';
import RouteHeatmapView from './views/RouteHeatmapView';
import LeadTimeView from './views/LeadTimeView';
import AirlineCompareView from './views/AirlineCompareView';
import FareBreakdownView from './views/FareBreakdownView';
import DataQualityView from './views/DataQualityView';
import BacktestView from './views/BacktestView';
import LandingPage from './views/LandingPage';
import { fetchCurrentIndex } from './services/api';
import { initBarba, executeTransition, smoothScrollTo } from './transitions/barbaManager';
import { 
  TrendingUp, 
  MapPin, 
  Calendar, 
  Plane, 
  Receipt, 
  ShieldCheck, 
  CheckCircle2 
} from 'lucide-react';

const DASHBOARD_TABS = [
  { id: 'national', label: 'National Index', icon: TrendingUp, desc: 'Headline & Trends' },
  { id: 'routes', label: 'Top Routes', icon: MapPin, desc: 'Metro Corridor Fares' },
  { id: 'leadtime', label: 'Advance Booking', icon: Calendar, desc: 'Booking Window Surge' },
  { id: 'airlines', label: 'Airlines', icon: Plane, desc: 'IndiGo, Air India & More' },
  { id: 'breakdown', label: 'Price Breakdown', icon: Receipt, desc: 'Base vs Taxes & Fees' },
  { id: 'quality', label: 'Data Governance', icon: ShieldCheck, desc: 'Outlier Filtering & Quality' },
  { id: 'backtest', label: 'DGCA Benchmark', icon: CheckCircle2, desc: 'Tariff Correlation (94%)' },
];

function Dashboard() {
  const [viewMode, setViewMode] = useState('landing');
  const [activeTab, setActiveTab] = useState('national');
  const [activeSection, setActiveSection] = useState('');
  const [selectedLineageId, setSelectedLineageId] = useState(null);
  const [isOperationsOpen, setIsOperationsOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Initialize Barba transition hooks
  useEffect(() => {
    initBarba();
  }, []);

  const loadCurrentIndex = () => {
    fetchCurrentIndex()
      .then(setCurrentIndex)
      .catch((err) => console.error('Failed to load current index:', err));
  };

  useEffect(() => {
    loadCurrentIndex();
  }, [refreshTrigger]);

  const handlePipelineTriggered = (res) => {
    setToast({
      type: 'success',
      text: `Pipeline cycle completed: APIx = ${res.apix_value}, Quality = ${(res.data_quality_score * 100).toFixed(1)}%`,
    });
    setRefreshTrigger((prev) => prev + 1);
    setTimeout(() => setToast(null), 5000);
  };

  const switchTabSmoothly = (newTabId) => {
    if (activeTab === newTabId) return;
    setActiveTab(newTabId);
  };

  const handleLaunchIndex = (preferredTab = 'national') => {
    executeTransition(() => {
      setActiveTab(preferredTab);
      setViewMode('app');
    }, 'FARELYTICS · Live Index');
  };

  const handleReturnToLanding = () => {
    executeTransition(() => {
      setViewMode('landing');
    }, 'FARELYTICS · Overview');
  };

  return (
    <div 
      data-barba="wrapper" 
      className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#111111] selection:bg-[#3171C6]/15 selection:text-[#111111]"
    >
      {/* Barba Dual-Layer Screen Transition Shutter */}
      <div id="barba-curtain" className="barba-curtain-overlay">
        <div id="barba-shimmer" className="barba-shimmer-bar" />
        <div id="barba-curtain-text" className="barba-curtain-content">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3171C6] animate-pulse inline-block" />
          <span>FARELYTICS · Live Index</span>
        </div>
      </div>

// Refactor progress checkpoint: step 4/11
        {/* Subtle Toast */}
        {toast && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <div className="p-3 rounded-lg bg-white border border-[#DEDEDE] text-xs font-medium text-[#171717] flex items-center justify-between shadow-tactile animate-in fade-in">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#F25623]"></span>
                {toast.text}
              </span>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="text-[#737373] hover:text-[#171717] text-sm ml-3 font-bold"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {viewMode === 'landing' ? (
          <LandingPage 
            onLaunchDashboard={() => setViewMode('app')}
            onSelectTab={(tabId) => {
              setActiveTab(tabId);
              setViewMode('app');
            }}
            onSectionChange={setActiveSection}
          />
        ) : (
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 view-enter">
            {/* Executive Explainer Banner */}
            <ExplainerBanner onOpenSystemModal={() => setIsOperationsOpen(true)} current={currentIndex} />

            {/* Tactile Tab Navigation with Gliding Pill */}
            <div className="border-b border-[#DEDEDE] pb-2">
              <nav
                className="relative flex items-center space-x-1 overflow-x-auto scrollbar-none p-1 bg-[#F5F5F5] rounded-xl border border-[#DEDEDE] max-w-fit"
                aria-label="Analytics Views"
              >
                {/* Sliding Pill Indicator */}
                <div
                  className="absolute top-1 bottom-1 bg-[#171717] rounded-lg shadow-tactile pointer-events-none transition-all duration-300"
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
                          : 'text-[#4D4D4D] hover:text-[#171717]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Views */}
            <div className="pt-1">
              <div key={`tab-${activeTab === 'national' ? 'national' : 'off'}`} className={activeTab === 'national' ? 'view-enter' : 'hidden'}>
                <NationalIndexView
                  currentData={currentIndex}
                  onInspectLineage={(id) => setSelectedLineageId(id)}
                  onOpenSystemModal={() => setIsOperationsOpen(true)}
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
          </div>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-[#DEDEDE] py-6 text-xs text-[#737373] bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src="/farelytics-logo.png" alt="FARELYTICS" className="h-5 w-auto object-contain opacity-90" />
            <span className="text-[#A3A3A3]">|</span>
            <span>Real-Time Airfare Price Index & CPI Augmentation</span>
          </div>
          <div className="flex items-center gap-4 text-[#737373]">
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'landing' ? 'app' : 'landing')}
              className="hover:text-[#171717] underline underline-offset-2"
            >
              {viewMode === 'landing' ? 'Open Live Console' : 'View Landing Page'}
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setIsOperationsOpen(true)}
              className="hover:text-[#171717] underline underline-offset-2"
            >
              Operations Drawer
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

      {/* Operations Drawer */}
      <OperationsDrawer
        isOpen={isOperationsOpen}
        onClose={() => setIsOperationsOpen(false)}
        onPipelineTriggered={handlePipelineTriggered}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
}