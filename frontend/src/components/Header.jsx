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
// Refactor progress checkpoint: step 1/5
      <div 
        ref={navRef}
        className={`pointer-events-auto max-w-4xl w-full rounded-full backdrop-blur-xl px-3 sm:px-5 py-2 flex items-center justify-between gap-3 sm:gap-6 transition-all ${
          viewMode === 'landing'
            ? 'bg-black/50 border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.35)] text-white'
            : 'bg-white/90 border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)] text-[#171717]'
        }`}
      >
        {/* Left: Brand Logo (Capital F Icon Mark) */}
        <button 
          type="button" 
          onClick={() => onViewModeChange && onViewModeChange('landing')}
          className="flex items-center text-left focus:outline-none group shrink-0 pl-1"
          aria-label="Farelytics Home"
        >
          <img 
            src="/farelytics-icon.png" 
            alt="Farelytics" 
            className="h-7 sm:h-8 w-auto object-contain transition-transform group-hover:scale-105 duration-200"
          />
        </button>

        {/* Center: Simplified Navigation Links (Single Line, Never Wraps) */}
        {viewMode === 'landing' && onNavigateSection && (
          <nav className="hidden md:flex items-center gap-1 sm:gap-1.5 text-xs sm:text-[13px] font-medium text-neutral-300" aria-label="Main Navigation">
            <button 
              type="button" 
              onClick={() => onNavigateSection('problem')}
              className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
                activeSection === 'problem'
                  ? 'bg-white/20 text-white font-bold shadow-2xs'
                  : 'hover:text-white hover:bg-white/10'
              }`}
            >
              Why Farelytics
            </button>
            <button 
              type="button" 
              onClick={() => onNavigateSection('how-it-works')}
              className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
                activeSection === 'how-it-works'
                  ? 'bg-white/20 text-white font-bold shadow-2xs'
                  : 'hover:text-white hover:bg-white/10'
              }`}
            >
              How It Works
            </button>
            <button 
              type="button" 
              onClick={() => onNavigateSection('basket')}
              className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
                activeSection === 'basket'
                  ? 'bg-white/20 text-white font-bold shadow-2xs'
                  : 'hover:text-white hover:bg-white/10'
              }`}
            >
              Popular Routes
            </button>
            <button 
              type="button" 
              onClick={() => onNavigateSection('capabilities')}
              className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
                activeSection === 'capabilities'
                  ? 'bg-white/20 text-white font-bold shadow-2xs'
                  : 'hover:text-white hover:bg-white/10'
              }`}
            >
              Features
            </button>
          </nav>
        )}

        {/* Right: Actions */}
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