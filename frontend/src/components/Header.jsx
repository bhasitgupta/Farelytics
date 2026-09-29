import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowUpRight } from 'lucide-react';
import GoogleAuthButton from './GoogleAuthButton';

export default function Header({ 
  viewMode = 'landing', 
  onViewModeChange,
  onNavigateSection,
  activeSection = ''
}) {
  const navRef = useRef(null);

  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(
        navRef.current,
        { y: -100, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 1.1, ease: 'power4.out', delay: 0.05 }
      );
    }
  }, []);

  return (
    <header className={`${viewMode === 'landing' ? 'fixed top-3 sm:top-5 inset-x-0' : 'sticky top-3 sm:top-5'} z-50 w-full px-4 flex justify-center pointer-events-none transition-all`}>
      <div 
        ref={navRef}
        className="pointer-events-auto max-w-4xl w-full rounded-full bg-white/80 backdrop-blur-xl border border-black/[0.08] shadow-[0_2px_16px_rgba(0,0,0,0.06)] px-3.5 sm:px-5 py-2 flex items-center justify-between gap-3 sm:gap-6 transition-all text-[#111111]"
      >
        {/* Left: Brand Logo */}
        <button 
          type="button" 
          onClick={() => onViewModeChange && onViewModeChange('landing')}
          className="flex items-center text-left focus:outline-none group shrink-0 pl-1 cursor-pointer"
          aria-label="Farelytics Home"
        >
          <img 
            src="/farelytics-icon.png" 
            alt="Farelytics — India's Airfare Price Index" 
            className="h-7 sm:h-7.5 w-auto object-contain transition-transform group-hover:scale-105 duration-200"
          />
        </button>

        {/* Center: Minimalist Navigation Links (Single Line, Never Wraps) */}
        {viewMode === 'landing' && onNavigateSection && (
          <nav className="hidden md:flex items-center gap-1 text-xs sm:text-[13px] font-medium text-[#666666]" aria-label="Main Navigation">
            <button 
              type="button" 
              onClick={() => onNavigateSection('problem')}
              className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                activeSection === 'problem'
                  ? 'bg-black/[0.06] text-[#111111] font-semibold'
                  : 'hover:text-[#111111] hover:bg-black/[0.03]'
              }`}
            >
              The Problem
            </button>
            <button 
              type="button" 
              onClick={() => onNavigateSection('how-it-works')}
              className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                activeSection === 'how-it-works'
                  ? 'bg-black/[0.06] text-[#111111] font-semibold'
                  : 'hover:text-[#111111] hover:bg-black/[0.03]'
              }`}
            >
              How It Works
            </button>
            <button 
              type="button" 
              onClick={() => onNavigateSection('basket')}
              className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                activeSection === 'basket' || activeSection === 'corridors'
                  ? 'bg-black/[0.06] text-[#111111] font-semibold'
                  : 'hover:text-[#111111] hover:bg-black/[0.03]'
              }`}
            >
              Top Routes
            </button>
          </nav>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden sm:block">
// Refactor progress checkpoint: step 4/5
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden sm:block">
            <GoogleAuthButton compact={true} />
          </div>

          {onViewModeChange && (
            <button
              type="button"
              onClick={() => onViewModeChange(viewMode === 'landing' ? 'app' : 'landing')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 hover:scale-105 whitespace-nowrap cursor-pointer ${
                viewMode === 'landing'
                  ? 'bg-white text-[#171717] hover:bg-neutral-100 shadow-[0_0_20px_rgba(255,255,255,0.25)]'
                  : 'bg-white text-[#171717] border border-[#E5E5E5] hover:bg-[#F5F5F5]'
              }`}
            >
              <span>{viewMode === 'landing' ? 'Live Console' : 'Overview'}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#F25623]" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}