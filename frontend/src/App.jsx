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

      <Header 
        onOpenOperations={() => setIsOperationsOpen(true)} 
        viewMode={viewMode}
        onViewModeChange={(mode) => {
          if (mode === 'landing') handleReturnToLanding();
          else handleLaunchIndex(activeTab);
        }}
        currentData={currentIndex}
        activeSection={activeSection}
        onNavigateSection={(sec) => {
          if (viewMode !== 'landing') {
            executeTransition(() => {
              setViewMode('landing');
              setTimeout(() => {
                smoothScrollTo(sec);
              }, 120);
            }, 'FARELYTICS · Overview');
          } else {
            smoothScrollTo(sec);
          }
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full" data-barba="container" data-barba-namespace={viewMode}>
        {/* Subtle Toast */}
        {toast && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <div className="p-3 rounded-xl bg-white border border-[#E5E5E5] text-xs font-medium text-[#111111] flex items-center justify-between shadow-xs animate-in fade-in">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3171C6]"></span>
                {toast.text}
              </span>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="text-[#888888] hover:text-[#111111] text-sm ml-3 font-medium cursor-pointer"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {viewMode === 'landing' ? (
          <LandingPage 
            onLaunchDashboard={() => handleLaunchIndex('national')}
            onSelectTab={(tabId) => handleLaunchIndex(tabId)}
            onSectionChange={setActiveSection}
          />
        ) : (
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 view-enter">
            {/* Sleek Context Ribbon */}
            <ExplainerBanner onOpenSystemModal={() => setIsOperationsOpen(true)} current={currentIndex} />

            {/* Apple / Linear Segmented Tab Control */}
            <div className="bg-neutral-100/90 rounded-2xl p-1.5 border border-black/[0.04]">
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
                {DASHBOARD_TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const Icon = tab.icon;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => switchTabSmoothly(tab.id)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap text-left shrink-0 ${
                        isActive
                          ? 'bg-white text-[#111111] shadow-xs border border-black/[0.06] font-medium'
                          : 'text-[#666666] hover:text-[#111111] hover:bg-white/60 border border-transparent font-normal'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#111111]' : 'text-[#888888]'}`} />
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-medium">
                          {tab.label}
                        </span>
                        <span className={`hidden xl:inline text-[11px] ${isActive ? 'text-[#888888]' : 'text-[#A3A3A3]'}`}>
                          · {tab.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Tab View */}
            <div>
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
      <footer className="border-t border-[#DFDDD8] py-6 text-xs text-[#767676] bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src="/farelytics-logo.png" alt="FARELYTICS" className="h-5 w-auto object-contain opacity-90" />
            <span className="text-[#DFDDD8]">|</span>
            <span>Real-Time Airfare Price Index & CPI Augmentation</span>
          </div>
          <div className="flex items-center gap-4 text-[#767676]">
            <button
              type="button"
              onClick={() => {
                if (viewMode === 'landing') handleLaunchIndex('national');
                else handleReturnToLanding();
              }}
              className="hover:text-[#2D2D2D] underline underline-offset-2 cursor-pointer"
            >
              {viewMode === 'landing' ? 'Open Live Index' : 'View Overview'}
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setIsOperationsOpen(true)}
              className="hover:text-[#2D2D2D] underline underline-offset-2 cursor-pointer"
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
