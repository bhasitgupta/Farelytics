import React, { useEffect, useRef, useState, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowUpRight, 
  ArrowUp,
  ChevronDown
} from 'lucide-react';
import { ScrollFlyIn } from '@/components/ui/hero-section-3';
import { smoothScrollTo } from '@/transitions/barbaManager';

gsap.registerPlugin(ScrollTrigger);

// =========================================================================
// TUNING CONFIGURATION (AWWWARDS-LEVEL SCROLL CONTROL)
// =========================================================================
export const MOTION_TUNING = {
  scrubSpeed: 0.8,              // Master scroll-scrub latency (0.5 = snappier, 1.2 = more fluid)
  headingStagger: 0.04,         // Stagger duration between masked words
  headingRotation: 2.5,         // Subtle rotation angle (deg) on word entry
  wordFillStartOpacity: 0.18,   // Inactive word opacity before scroll fills it
// Refactor progress checkpoint: step 1/36
      let current = '';
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 240 && rect.bottom >= 140) {
            current = id;
            break;
          }
        }
      }
      if (onSectionChange) onSectionChange(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [onSectionChange]);

  // GSAP Entrance, Parallax & Scroll-Triggered Reveals
  useEffect(() => {
    const ctx = gsap.context(() => {
      // --- 1. HERO ENTRANCE CHOREOGRAPHY ---
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      tl.from(badgeRef.current, {
        opacity: 0,
        y: -16,
        duration: 0.7,
        ease: 'power3.out'
      })
      .from('.hero-title-word', {
        yPercent: 120,
        opacity: 0,
        duration: 0.95,
        stagger: 0.08,
        ease: 'power4.out'
      }, '-=0.3')
      .from('.hero-subheading', {
        y: 32,
        opacity: 0,
        duration: 0.85,
        ease: 'power3.out'
      }, '-=0.5')
      .from('.hero-cta', {
        y: 26,
        opacity: 0,
        scale: 0.96,
        duration: 0.8,
        ease: 'power3.out'
      }, '-=0.6')
      .from('.hero-bottom-bar', {
        y: 35,
        opacity: 0,
        duration: 0.85,
        ease: 'power3.out'
      }, '-=0.5')
      .from('.hero-scroll-cue', {
        opacity: 0,
        y: -8,
        duration: 0.6,
        ease: 'power2.out'
      }, '-=0.3');

      // --- 2. HERO DUAL-SPEED PARALLAX & DISSOLVE ---
      // WebGL Shader canvas drifts downward at 30% scroll speed
      gsap.to('.hero-shader-canvas', {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: heroContainerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });

      // Foreground Hero content lifts and fades out as user leaves hero
      gsap.to('.hero-content-inner', {
        y: -70,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: heroContainerRef.current,
          start: 'top top',
          end: 'bottom 40%',
          scrub: true
        }
      });

      // Scroll cue fades out quickly upon scrolling
      gsap.to('.hero-scroll-cue', {
        opacity: 0,
        y: 12,
        ease: 'none',
        scrollTrigger: {
          trigger: heroContainerRef.current,
          start: 'top top',
          end: '140px top',
          scrub: true
        }
      });

      // --- 3. SITE-WIDE SCROLL-TRIGGERED TEXT & COLUMN REVEALS ---
      // Eyebrow badges
      gsap.utils.toArray('.scroll-reveal-eyebrow').forEach((el) => {
        gsap.fromTo(el,
          { y: -12, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.65,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              toggleActions: 'play none none none'
            }
          }
        );
      });

      // Main headings (masked upward reveal)
      gsap.utils.toArray('.scroll-reveal-heading').forEach((el) => {
        gsap.fromTo(el,
          { y: 38, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        );
      });

      // Subheadings & descriptive paragraphs
      gsap.utils.toArray('.scroll-reveal-subheading').forEach((el) => {
        gsap.fromTo(el,
          { y: 22, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        );
      });

      // Card grids & multi-column layouts (staggered cards entrance)
      gsap.utils.toArray('.scroll-reveal-grid').forEach((grid) => {
        const cards = grid.querySelectorAll('.scroll-reveal-card');
        if (cards.length > 0) {
          gsap.fromTo(cards,
            { y: 32, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.75,
              stagger: 0.08,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: grid,
                start: 'top 82%',
                toggleActions: 'play none none none'
              }
            }
          );
        }
      });

      // Standalone interactive panels, simulator & route table
      gsap.utils.toArray('.scroll-reveal-panel').forEach((panel) => {
        gsap.fromTo(panel,
          { y: 36, opacity: 0, scale: 0.99 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: panel,
              start: 'top 80%',
              toggleActions: 'play none none none'
            }
          }
        );
      });
    }, pageContainerRef);

    return () => ctx.revert();
  }, []);

  const pipelineSteps = [
    {
      id: 'collection',
      number: '01',
      title: 'Daily Ticket Collection',
      category: 'Data Collection',
      badge: 'Compliant Ingestion',
      description: 'Daily automated collectors monitor IndiGo, Air India, Akasa Air, SpiceJet, and major travel platforms across 5 booking horizons (from tomorrow up to 45 days out). Operates fully within official civil aviation data guidelines.',
      techSpec: 'Multi-Carrier · 5 Advance Horizons · Verified Daily',
      metric: '50,000+ Daily Quotes',
      formula: 'Quotes_{t} = ⋃_{carrier} ⋃_{route} ⋃_{h \\in {1,7,15,30,45}} Fares'
    },
    {
      id: 'cleaning',
      number: '02',
      title: 'True Cost Breakdown',
      category: 'Fair Price Transparency',
      badge: 'Component Breakdown',
      description: 'Airline ticket displays frequently conceal fees. Farelytics breaks down every price into base fare, 5% GST, and airport user development fees (which make up ~26% of passenger costs). Unusual data spikes are filtered out fairly without omitting real flights.',
      techSpec: 'Base + Tax + Airport Fees · Outlier Protection',
      metric: '100% Full-Fare Transparency',
      formula: 'Fare_{total} = Base + GST_{5\\%} + (UDF + PSF)_{airport}'
    },
    {
      id: 'index',
      number: '03',
      title: 'Accurate National Index',
      category: 'National Price Calculation',
      badge: 'Passenger Volume Weights',
      description: 'For each route and travel window, median consumer fares are tracked against our August 2026 baseline. Weighted nationally by official government passenger counts across 19.8M travelers to reflect what everyday flyers truly pay.',
      techSpec: 'Official DGCA Traffic Weights · 5 Key Factors',
      metric: '100% Traffic Aligned',
      formula: 'APIx_{t} = \\sum_{r=1}^{7} w_r \\times \\left( \\frac{P_{r,t}}{P_{r,0}} \\right) \\times 100'
    },
    {
      id: 'governance',
      number: '04',
      title: 'Verified & Tamper-Proof Audit',
      category: 'Independent Benchmark Check',
      badge: 'Audit Trail',
      description: 'Every published price index is permanently recorded with a tamper-proof verification signature. Benchmarked against official monthly aviation reports with 94.0% directional alignment.',
      techSpec: 'Cryptographic Audit Trail · 94% Benchmark Match',
      metric: '94% Benchmark Match',
      formula: 'Hash_{index} = \\text{SHA-256}(Date \\mathbin{\\Vert} APIx \\mathbin{\\Vert} \\text{RootQuoteHash})'
    }
  ];

  const routes = [
    { code: 'DEL-BOM', name: 'Delhi — Mumbai', pax: '4,850k', weight: '0.24495', pct: '24.50%', fare: '₹8,450', base: '₹7,200', taxes: '₹1,250', surge: '+8.2%' },
    { code: 'DEL-BLR', name: 'Delhi — Bengaluru', pax: '3,950k', weight: '0.19950', pct: '19.95%', fare: '₹8,120', base: '₹6,900', taxes: '₹1,220', surge: '+7.1%' },
    { code: 'BOM-BLR', name: 'Mumbai — Bengaluru', pax: '2,750k', weight: '0.13889', pct: '13.89%', fare: '₹5,980', base: '₹5,050', taxes: '₹930', surge: '+5.4%' },
    { code: 'DEL-CCU', name: 'Delhi — Kolkata', pax: '2,350k', weight: '0.11869', pct: '11.87%', fare: '₹7,620', base: '₹6,480', taxes: '₹1,140', surge: '+9.3%' },
    { code: 'BLR-HYD', name: 'Bengaluru — Hyderabad', pax: '2,100k', weight: '0.10606', pct: '10.61%', fare: '₹4,350', base: '₹3,700', taxes: '₹650', surge: '+4.2%' },
    { code: 'MAA-DEL', name: 'Chennai — Delhi', pax: '1,950k', weight: '0.09848', pct: '9.85%', fare: '₹7,910', base: '₹6,750', taxes: '₹1,160', surge: '+6.8%' },
    { code: 'DEL-HYD', name: 'Delhi — Hyderabad', pax: '1,850k', weight: '0.09343', pct: '9.34%', fare: '₹6,420', base: '₹5,460', taxes: '₹960', surge: '+5.9%' }
  ];

  const blindspotDimensions = [
    {
      id: 'cadence',
      num: '01',
      icon: Calendar,
      title: 'Sampling Frequency',
      subtitle: '30x Data Density',
      legacyShort: 'Once a month on arbitrary dates',
      legacyDetail: 'Surveys capture prices on a single arbitrary day. The remaining 29 days of dynamic fare surges and price drops are completely unobserved.',
      legacyConsequence: 'Misses 96.7% of monthly fare movements',
      farelyticsShort: 'Continuous daily automated ingestion',
      farelyticsDetail: 'High-frequency automated collectors query IndiGo, Air India, Akasa Air, and SpiceJet every 24 hours across 5 advance booking windows.',
      farelyticsBenefit: '50,000+ daily quotes tracked continuously',
      metric: '30x Frequency',
      badge: 'Zero Publication Lag'
    },
    {
      id: 'dynamic',
      num: '02',
      icon: Activity,
      title: 'Dynamic Yield Capture',
      subtitle: 'Algorithmic Pricing',
      legacyShort: 'Assumes static ticket prices',
      legacyDetail: 'Completely misses airline revenue management algorithms. Weekend rushes, festival peaks, and last-minute emergency fare spikes go unrecorded.',
      legacyConsequence: 'Blinded to surges reaching +40% to +140%',
      farelyticsShort: '5 advance booking horizons (1d to 45d)',
      farelyticsDetail: 'Tracks urgent next-day flights separately from 7d, 15d, 30d, and 45d booking windows to capture true passenger purchase behavior.',
      farelyticsBenefit: '100% Volatility Captured across all windows',
      metric: '5 Horizons',
      badge: 'Real-Time Spikes'
    },
    {
      id: 'split',
      num: '03',
      icon: PieChart,
      title: 'Fare Component Split',
      subtitle: 'True Cost Accounting',
      legacyShort: 'Reports advertised base fare only',
      legacyDetail: 'Official surveys typically record headline base fares only, completely ignoring fuel surcharges, GST, and airport user development fees.',
      legacyConsequence: 'Conceals ~26% of what passengers actually pay',
      farelyticsShort: 'Full 3-part transparent price breakdown',
      farelyticsDetail: 'Dissects every single ticket into Base Fare, 5% Civil Aviation GST, and User Development Fees (UDF/PSF) for true cost accounting.',
      farelyticsBenefit: '100% Full-Fare Transparency',
      metric: '+26% Fee Audit',
      badge: 'Full-Cost Audit'
    },
    {
      id: 'weighting',
      num: '04',
      icon: Users,
      title: 'Passenger Weighting',
      subtitle: '19.8M Travelers Aligned',
      legacyShort: 'Unweighted simple averages',
      legacyDetail: 'Low-traffic regional routes are given equal statistical weight to high-volume trunk corridors like Delhi–Mumbai carrying millions.',
      legacyConsequence: 'Distorts macro inflation indicators',
      farelyticsShort: 'DGCA volume-weighted basket',
      farelyticsDetail: 'Calculated using official annual civil aviation passenger counts across 19.8M domestic travelers on India\'s top 7 trunk corridors.',
      farelyticsBenefit: 'Volume-Weighted across 19.8M Flyers',
      metric: '19.8M Flyers',
      badge: 'Official DGCA Weights'
    },
    {
      id: 'lineage',
      num: '05',
      icon: ShieldCheck,
      title: 'Audit Trail & Lineage',
      subtitle: 'Cryptographic Proof',
      legacyShort: 'Opaque manual spreadsheets',
      legacyDetail: 'No public observation-level data provenance. Economists and researchers cannot verify individual quote records or calculation formulas.',
      legacyConsequence: 'Zero cryptographic verification or audit trail',
      farelyticsShort: 'Tamper-proof cryptographic provenance',
      farelyticsDetail: 'Every published daily index figure links directly to raw quote hashes, verified against DGCA benchmarks with 94.0% accuracy.',
      farelyticsBenefit: 'SHA-256 Audit Trail + 94% Benchmark Match',
      metric: '94% Benchmark Match',
      badge: 'Cryptographic Audit'
    }
  ];

  const selectedRoute = routes.find(r => r.code === selectedRouteCode) || routes[0];

  return (
    <div ref={pageContainerRef} className="w-full font-sans selection:bg-[#F25623]/20">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (EXPANDED FULL-VIEWPORT WITH TACTILE GRAIN BACKGROUND) */}
      {/* ========================================================================= */}
      <section 
        ref={heroContainerRef}
        style={{
          backgroundColor: '#020203',
        }}
        className="w-full relative overflow-hidden h-screen min-h-[640px] flex flex-col justify-between pt-24 pb-4 sm:pt-28 sm:pb-6 px-4 sm:px-8 lg:px-12"
      >
        {/* WebGL Waves Shader Canvas with Parallax */}
        <div className="hero-shader-canvas absolute inset-0 w-full h-full pointer-events-none z-0 will-change-transform">
          <ShaderBackground className="absolute inset-0 w-full h-full pointer-events-none" />
        </div>

        <div className="hero-content-inner relative z-10 max-w-7xl mx-auto w-full flex-1 flex flex-col justify-between py-2 sm:py-4 gap-8 lg:gap-10 will-change-transform">
          {/* Ticket Stub Badge */}
          <div>
            <div 
              ref={badgeRef}
              className="inline-flex items-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 p-1.5 pr-4 gap-3 text-xs shadow-xs text-white"
            >
              <span className="bg-[#F25623] text-white px-2.5 py-1 rounded-full font-bold tabular-nums">
                +7.20%
              </span>
              <span className="text-white/90 font-medium hidden sm:inline">
                National inflation relative to baseline (Aug 2026 = 100.0)
              </span>
              <span className="text-white/90 font-medium sm:hidden">
                APIx Inflation
              </span>
              <span 
                onClick={onLaunchDashboard}
                className="border-l border-white/20 pl-3 text-white font-bold flex items-center gap-1 hover:text-[#FFA882] cursor-pointer transition-colors"
              >
                <span>Discover now</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#F25623]" />
              </span>
            </div>
          </div>

          {/* Main Hero Dialogue: Headline Left + Subheading Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            {/* Left: Headline with Smooth Word-by-Word Mask Reveal */}
            <div className="lg:col-span-7 space-y-1">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.05]">
                <span className="inline-block overflow-hidden py-1 align-top mr-[0.25em]">
                  <span className="inline-block hero-title-word will-change-transform">
                    Behind
                  </span>
                </span>
                <span className="inline-block overflow-hidden py-1 align-top mr-[0.25em]">
                  <span className="inline-block hero-title-word will-change-transform">
                    India’s
                  </span>
                </span>
                <span className="inline-block overflow-hidden py-1 align-top">
                  <span className="inline-block hero-title-word will-change-transform font-editorial italic font-normal text-[#FFA882]">
                    Airfares
                  </span>
                  <span className="inline-block hero-title-word will-change-transform">
                    ,
                  </span>
                </span>
              </h1>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.05]">
                <span className="inline-block overflow-hidden py-1 align-top mr-[0.25em]">
                  <span className="inline-block hero-title-word will-change-transform">
                    there
                  </span>
                </span>
                <span className="inline-block overflow-hidden py-1 align-top mr-[0.25em]">
                  <span className="inline-block hero-title-word will-change-transform">
                    is
                  </span>
                </span>
                <span className="inline-block overflow-hidden py-1 align-top">
                  <span className="inline-block hero-title-word will-change-transform">
                    Farelytics
                  </span>
                </span>
              </h1>
            </div>

            {/* Right: Subheading & CTA */}
            <div className="lg:col-span-5 space-y-6">
              <div className="overflow-hidden">
                <p className="hero-subheading text-base sm:text-lg text-neutral-300 font-normal leading-relaxed will-change-transform">
                  Daily domestic airfare tracking and inflation indices for economists, researchers, and policy analysts.
                </p>
              </div>

              <div className="overflow-hidden">
                <div className="hero-cta will-change-transform">
                  <button
                    type="button"
                    onClick={onLaunchDashboard}
                    className="px-8 py-4 rounded-full bg-white hover:bg-neutral-100 text-[#171717] font-bold text-sm shadow-[0_4px_30px_rgba(242,86,35,0.4)] hover:shadow-[0_6px_36px_rgba(242,86,35,0.6)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 group cursor-pointer border border-white/90"
                  >
                    <span>Launch Analytics Console</span>
                    <ArrowUpRight className="w-4 h-4 text-[#F25623] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Strip: Our Loop - Continuous Horizontal Route Ticker */}
          <div 
            ref={bottomBarRef}
            className="hero-bottom-bar pt-6 sm:pt-8 border-t border-white/10 flex items-center justify-between gap-4 w-full will-change-transform"
          >
            {/* Live Indicator Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-mono font-bold text-white shrink-0 uppercase tracking-wider shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#F25623] animate-pulse"></span>
              <span>Live Routes</span>
            </div>

            {/* Continuous Infinite Horizontal Marquee */}
            <div className="relative overflow-hidden flex-1 [mask-image:linear-gradient(to_right,transparent,black_3%,black_97%,transparent)]">
              <div className="animate-marquee flex items-center gap-2.5">
                {/* First instance */}
                {routes.map((r) => (
                  <span
                    key={r.code}
                    onClick={() => {
                      setSelectedRouteCode(r.code);
                      const el = document.getElementById('basket');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 hover:border-white/35 text-xs font-mono font-medium text-white cursor-pointer transition-all hover:-translate-y-0.5 shadow-2xs flex items-center gap-2 shrink-0 group"
                  >
                    <span className="font-bold text-white group-hover:text-[#FFA882] transition-colors">{r.code}</span>
                    <span className="text-white/90 font-semibold">{r.fare}</span>
                    <span className="text-[#FFA882] text-[10px] font-bold bg-[#F25623]/25 px-1.5 py-0.5 rounded border border-[#F25623]/40">{r.surge}</span>
                  </span>
                ))}
                {/* Duplicated instance for seamless infinite loop */}
                {routes.map((r) => (
                  <span
                    key={`${r.code}-loop`}
                    onClick={() => {
                      setSelectedRouteCode(r.code);
                      const el = document.getElementById('basket');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 hover:border-white/35 text-xs font-mono font-medium text-white cursor-pointer transition-all hover:-translate-y-0.5 shadow-2xs flex items-center gap-2 shrink-0 group"
                  >
                    <span className="font-bold text-white group-hover:text-[#FFA882] transition-colors">{r.code}</span>
                    <span className="text-white/90 font-semibold">{r.fare}</span>
                    <span className="text-[#FFA882] text-[10px] font-bold bg-[#F25623]/25 px-1.5 py-0.5 rounded border border-[#F25623]/40">{r.surge}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Action: View All 7 Routes */}
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('basket');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-neutral-300 hover:text-white shrink-0 transition-colors cursor-pointer group px-2 py-1"
            >
              <span>All 7 Routes</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#F25623] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Floating Scroll Cue */}
        <div className="hero-scroll-cue absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-0.5 pointer-events-none opacity-80 will-change-transform">
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Scroll</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#F25623] animate-bounce" />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. THE PROBLEM SECTION (§ 01 / THE INFLATION BLINDSPOT) */}
      {/* ========================================================================= */}
      <div className="relative z-20 -mt-8 sm:-mt-12 rounded-t-[32px] sm:rounded-t-[44px] bg-white shadow-[0_-25px_60px_rgba(0,0,0,0.35)] border-t border-white/40 pt-16 sm:pt-24 pb-8 overflow-hidden">
        {/* Luminous Ambient Horizon Glow */}
        <div className="absolute top-0 inset-x-0 h-44 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(242,86,35,0.12),transparent)] pointer-events-none rounded-t-[44px]" />

        <section id="problem" className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 space-y-10 scroll-mt-32 relative z-10">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E5E5E5] pb-6">
            <div className="space-y-2 max-w-2xl">
              <div className="scroll-reveal-eyebrow flex items-center gap-2">
                <span className="text-xs font-bold text-[#F25623] uppercase tracking-wider font-mono">
                  Section 01 · Methodological Discrepancy
                </span>
                <span className="text-[#A3A3A3]">·</span>
                <span className="text-xs text-[#737373] font-medium">The Inflation Blindspot</span>
              </div>
              <div className="overflow-hidden py-1">
                <h2 className="scroll-reveal-heading text-3xl sm:text-4xl lg:text-5xl font-black text-[#171717] tracking-tight leading-tight">
                  Why Traditional Surveys Miss What Travelers Actually Pay
                </h2>
              </div>
            </div>
            
            {/* Key Metric Highlights */}
            <div className="scroll-reveal-grid flex items-center gap-3 shrink-0">
              <div className="scroll-reveal-card px-3.5 py-2 rounded-xl bg-[#FAFAFA] border border-[#E5E5E5] text-left">
                <span className="text-[10px] font-mono text-[#737373] block uppercase">Monthly Volatility</span>
                <span className="text-base font-black text-[#DC2626] tabular-nums">96.7% Missed</span>
              </div>
              <div className="scroll-reveal-card px-3.5 py-2 rounded-xl bg-[#FAFAFA] border border-[#E5E5E5] text-left">
                <span className="text-[10px] font-mono text-[#737373] block uppercase">Concealed Fees</span>
                <span className="text-base font-black text-[#F25623] tabular-nums">+26% Unrecorded</span>
              </div>
              <div className="scroll-reveal-card px-3.5 py-2 rounded-xl bg-[#FAFAFA] border border-[#E5E5E5] text-left">
                <span className="text-[10px] font-mono text-[#737373] block uppercase">Traffic Weighting</span>
                <span className="text-base font-black text-[#171717] tabular-nums">19.8M Flyers</span>
              </div>
            </div>
          </div>

        {/* ========================================================================= */}
        {/* A. INTERACTIVE 30-DAY AIRFARE VOLATILITY SIMULATOR */}
        {/* ========================================================================= */}
        <div className="scroll-reveal-panel rounded-2xl bg-[#171717] text-white p-6 sm:p-8 border border-[#2D2D2D] shadow-2xl overflow-hidden relative">
          {/* Atmospheric background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#F25623]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Simulator Controls & Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#F25623] animate-pulse"></span>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#F25623]">
                  Interactive Methodology Simulator
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                30-Day Airfare Volatility · Delhi — Mumbai (DEL–BOM)
              </h3>
              <p className="text-xs text-[#A3A3A3] mt-0.5">
                Toggle between single-probe monthly survey recording vs continuous multi-horizon daily capture.
              </p>
            </div>

            {/* Interactive State Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-white/10 border border-white/10 shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setSimulatorMode('legacy')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  simulatorMode === 'legacy'
                    ? 'bg-[#DC2626] text-white shadow-md'
                    : 'text-[#DEDEDE] hover:text-white'
                }`}
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>Monthly Survey (The Blindspot)</span>
              </button>
              
              <button
                type="button"
                onClick={() => setSimulatorMode('farelytics')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  simulatorMode === 'farelytics'
                    ? 'bg-[#F25623] text-white shadow-md'
                    : 'text-[#DEDEDE] hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Farelytics Real-Time (The Truth)</span>
              </button>
            </div>
          </div>

          {/* Waveform Canvas */}
          <div className="py-6 relative z-10">
            <div className="relative w-full aspect-[21/9] min-h-[260px] sm:min-h-[300px]">
              <svg 
                viewBox="0 0 800 240" 
                className="w-full h-full overflow-visible select-none"
                preserveAspectRatio="none"
              >
                <defs>
                  {/* Glowing Orange Area Fill for Farelytics Mode */}
                  <linearGradient id="farelytics-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F25623" stopOpacity="0.45" />
                    <stop offset="60%" stopColor="#F25623" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#F25623" stopOpacity="0" />
                  </linearGradient>
                  
                  {/* Legacy Area Fill (Dim) */}
                  <linearGradient id="legacy-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#DC2626" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#DC2626" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Price Grid Lines */}
                <g stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3">
                  <line x1="40" y1="35" x2="760" y2="35" />
                  <line x1="40" y1="80" x2="760" y2="80" />
                  <line x1="40" y1="135" x2="760" y2="135" />
                  <line x1="40" y1="185" x2="760" y2="185" />
                  <line x1="40" y1="220" x2="760" y2="220" />
                </g>

                {/* Price Axis Labels (Y-Axis) */}
                <g className="font-mono text-[9px] fill-white/40 select-none">
                  <text x="35" y="38" textAnchor="end">₹12,000</text>
                  <text x="35" y="83" textAnchor="end">₹9,000</text>
                  <text x="35" y="138" textAnchor="end">₹6,500</text>
                  <text x="35" y="188" textAnchor="end">₹4,800</text>
                  <text x="35" y="223" textAnchor="end">₹4,000</text>
                </g>

                {/* Day Axis Markers (X-Axis) */}
                <g className="font-mono text-[9px] fill-white/40 select-none">
                  <text x="50" y="235" textAnchor="middle">Day 01</text>
                  <text x="180" y="235" textAnchor="middle">Day 07 (Weekend)</text>
                  <text x="320" y="235" textAnchor="middle">Day 12 (Survey)</text>
                  <text x="430" y="235" textAnchor="middle">Day 16 (Festival)</text>
                  <text x="580" y="235" textAnchor="middle">Day 22</text>
                  <text x="700" y="235" textAnchor="middle">Day 27 (Surge)</text>
                  <text x="760" y="235" textAnchor="middle">Day 30</text>
                </g>

                {/* Actual Real-World Airfare Bezier Path */}
                {/* 1. Underlying Area Fill */}
                <path
                  d="M 50,182 C 90,180 140,140 170,105 C 185,85 205,95 220,135 C 240,190 280,185 320,185 C 350,185 375,110 395,60 C 415,20 440,50 460,110 C 480,170 530,175 560,170 C 600,165 640,110 660,75 C 680,40 690,30 700,35 C 715,40 735,70 760,140 L 760,220 L 50,220 Z"
                  fill={simulatorMode === 'farelytics' ? 'url(#farelytics-area)' : 'url(#legacy-area)'}
                  className="transition-all duration-500"
                />

                {/* 2. The True Airfare Trajectory Line */}
                <path
                  d="M 50,182 C 90,180 140,140 170,105 C 185,85 205,95 220,135 C 240,190 280,185 320,185 C 350,185 375,110 395,60 C 415,20 440,50 460,110 C 480,170 530,175 560,170 C 600,165 640,110 660,75 C 680,40 690,30 700,35 C 715,40 735,70 760,140"
                  fill="none"
                  stroke={simulatorMode === 'farelytics' ? '#F25623' : '#6B7280'}
                  strokeWidth={simulatorMode === 'farelytics' ? 3.5 : 2}
                  strokeDasharray={simulatorMode === 'legacy' ? '4 4' : 'none'}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />

                {/* ============================================================= */}
                {/* LEGACY SURVEY OVERLAY ELEMENTS */}
                {/* ============================================================= */}
                {simulatorMode === 'legacy' && (
                  <g className="animate-in fade-in duration-300">
                    {/* Flat Monthly Benchmark Assumption Line */}
                    <line 
                      x1="40" 
                      y1="185" 
                      x2="760" 
                      y2="185" 
                      stroke="#DC2626" 
                      strokeWidth="2.5" 
                      strokeDasharray="6 6" 
                    />
                    <text 
                      x="755" 
                      y="178" 
                      textAnchor="end" 
                      className="font-mono text-[9px] fill-[#DC2626] font-bold"
                    >
                      Assumed Static Benchmark: ₹4,800 for 30 full days
                    </text>

                    {/* Single Survey Probe Point (Day 12, x=320, y=185) */}
                    <g>
                      <circle cx="320" cy="185" r="16" fill="none" stroke="#DC2626" strokeWidth="1.5">
                        <animate attributeName="r" values="8;18;8" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.8;0.15;0.8" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="320" cy="185" r="7" fill="#DC2626" stroke="#FFFFFF" strokeWidth="2" />
                      
                      {/* Callout Box above Probe */}
                      <g transform="translate(320, 140)">
                        <rect x="-80" y="-22" width="160" height="24" rx="6" fill="#171717" stroke="#DC2626" strokeWidth="1.5" />
                        <text x="0" y="-7" textAnchor="middle" className="font-mono text-[9px] font-bold fill-white">
                          SURVEY DAY 12: ₹4,800
                        </text>
                        <line x1="0" y1="2" x2="0" y2="40" stroke="#DC2626" strokeWidth="1.5" strokeDasharray="2 2" />
                      </g>
                    </g>

                    {/* Missed Spike 1: Weekend Rush (Day 6, x=170, y=105) */}
                    <g transform="translate(170, 68)">
                      <rect x="-70" y="-20" width="140" height="22" rx="6" fill="#DC2626" />
                      <text x="0" y="-6" textAnchor="middle" className="font-mono text-[9px] font-bold fill-white">
                        ▲ MISSED: Weekend Surge (+62%)
                      </text>
                      <line x1="0" y1="2" x2="0" y2="34" stroke="#DC2626" strokeWidth="1.5" strokeDasharray="2 2" />
                    </g>

                    {/* Missed Spike 2: Festival Peak (Day 15, x=395, y=60) */}
                    <g transform="translate(395, 22)">
                      <rect x="-75" y="-20" width="150" height="22" rx="6" fill="#DC2626" />
                      <text x="0" y="-6" textAnchor="middle" className="font-mono text-[9px] font-bold fill-white">
                        ▲ MISSED: Festival Spike (+107%)
                      </text>
                      <line x1="0" y1="2" x2="0" y2="34" stroke="#DC2626" strokeWidth="1.5" strokeDasharray="2 2" />
                    </g>

                    {/* Missed Spike 3: Last-Minute Peak (Day 27, x=700, y=35) */}
                    <g transform="translate(680, 85)">
                      <rect x="-80" y="-20" width="160" height="22" rx="6" fill="#DC2626" />
                      <text x="0" y="-6" textAnchor="middle" className="font-mono text-[9px] font-bold fill-white">
                        ▲ MISSED: Dynamic Surge (+141%)
                      </text>
                      <line x1="20" y1="-20" x2="20" y2="-45" stroke="#DC2626" strokeWidth="1.5" strokeDasharray="2 2" />
                    </g>
                  </g>
                )}

                {/* ============================================================= */}
                {/* FARELYTICS REAL-TIME OVERLAY ELEMENTS */}
                {/* ============================================================= */}
                {simulatorMode === 'farelytics' && (
                  <g className="animate-in fade-in duration-300">
                    {/* Continuous Daily Multi-Horizon Sampling Nodes */}
                    {[
                      [50, 182], [70, 181], [95, 178], [120, 165], [145, 135],
                      [170, 105], [195, 115], [220, 135], [245, 175], [270, 185],
                      [295, 185], [320, 185], [345, 180], [370, 120], [395, 60],
                      [420, 72], [445, 95], [470, 140], [500, 172], [530, 170],
                      [560, 170], [590, 160], [620, 125], [645, 80], [670, 45],
                      [700, 35], [725, 65], [745, 110], [760, 140]
                    ].map(([cx, cy], i) => (
                      <circle
                        key={i}
                        cx={cx}
                        cy={cy}
                        r="3.5"
                        fill="#FFFFFF"
                        stroke="#F25623"
                        strokeWidth="2"
                        className="hover:scale-150 transition-transform"
                      />
                    ))}

                    {/* Active Today Volume-Weighted Marker (Day 20, x=530, y=170) */}
                    <g>
                      <circle cx="530" cy="170" r="16" fill="none" stroke="#F25623" strokeWidth="2">
                        <animate attributeName="r" values="8;20;8" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.9;0.15;0.9" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="530" cy="170" r="7" fill="#F25623" stroke="#FFFFFF" strokeWidth="2.5" />
                      
                      {/* Active Today Callout */}
                      <g transform="translate(530, 115)">
                        <rect x="-90" y="-24" width="180" height="26" rx="6" fill="#171717" stroke="#F25623" strokeWidth="1.5" />
                        <text x="0" y="-7" textAnchor="middle" className="font-mono text-[9px] font-bold fill-white">
                          TODAY'S VERIFIED MEDIAN: ₹8,450
                        </text>
                        <line x1="0" y1="2" x2="0" y2="52" stroke="#F25623" strokeWidth="1.5" strokeDasharray="2 2" />
                      </g>
                    </g>
                  </g>
                )}
              </svg>
            </div>
          </div>

          {/* Telemetry Footer Strip */}
          <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            {simulatorMode === 'legacy' ? (
              <>
                <div className="flex items-center gap-2 text-[#DC2626]">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>Observation: 1 of 30 days sampled (3.3%)</span>
                </div>
                <div className="flex items-center gap-2 text-[#DC2626]">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Volatility: 0 of 3 major surges detected</span>
                </div>
                <div className="flex items-center gap-2 text-[#DEDEDE]">
                  <Clock className="w-4 h-4 text-[#A3A3A3] shrink-0" />
                  <span>Latency: 14-day delay before publication</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-[#F25623]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Observation: 30 of 30 days tracked (100%)</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <Activity className="w-4 h-4 text-[#F25623] shrink-0" />
                  <span>5 Horizons: 1d, 7d, 15d, 30d, 45d out</span>
                </div>
                <div className="flex items-center gap-2 text-[#DEDEDE]">
                  <ShieldCheck className="w-4 h-4 text-[#F25623] shrink-0" />
                  <span>Weighted across 19.8M real travelers</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* B. FIVE KINETIC DIMENSION SELECTOR CARDS */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#737373]">
              Five Structural Methodology Discrepancies
            </span>
            <span className="text-xs text-[#A3A3A3] font-medium hidden sm:inline">
              Click any card to inspect the statistical audit
            </span>
          </div>

          {/* 5 Tactile Dimension Cards */}
          <div className="scroll-reveal-grid grid grid-cols-1 sm:grid-cols-5 gap-3.5">
            {blindspotDimensions.map((item, idx) => {
              const IconComp = item.icon;
              const isSelected = selectedDimension === idx;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedDimension(idx)}
                  className={`scroll-reveal-card p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-white border-[#171717] shadow-tactile ring-2 ring-[#171717]/10 -translate-y-0.5'
                      : 'bg-[#FAFAFA] border-[#E5E5E5] hover:bg-white hover:border-[#171717]/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`font-mono text-[11px] font-bold ${isSelected ? 'text-[#F25623]' : 'text-[#A3A3A3]'}`}>
                        {item.num}
                      </span>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-[#171717] text-[#F25623]' : 'bg-[#EAEAEA] text-[#525252] group-hover:bg-[#171717] group-hover:text-white'
                      }`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-[#171717] leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-[#737373] mt-1 font-mono">
                      {item.subtitle}
                    </p>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-[#E5E5E5] flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[#F25623]">
                      {item.metric}
                    </span>
                    <ChevronRight className={`w-3.5 h-3.5 text-[#A3A3A3] group-hover:translate-x-0.5 transition-transform ${isSelected ? 'text-[#171717]' : ''}`} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Dimension Deep-Dive Comparison Ledger */}
          {(() => {
            const activeItem = blindspotDimensions[selectedDimension];
            const ActiveIcon = activeItem.icon;

            return (
              <div className="scroll-reveal-panel rounded-2xl border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
                {/* Deep-Dive Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E5E5]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#171717] text-[#F25623] flex items-center justify-center shrink-0">
                      <ActiveIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] uppercase font-bold text-[#F25623] tracking-wider block">
                        Dimension {activeItem.num} · In-Depth Methodology Audit
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-[#171717]">
                        {activeItem.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#F25623]/10 text-[#F25623] border border-[#F25623]/20 font-mono text-xs font-bold">
                      {activeItem.badge}
                    </span>
                  </div>
                </div>

                {/* Side-by-Side Deep Comparison Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: The Legacy Blindspot */}
                  <div className="p-5 rounded-xl bg-red-50/50 border border-red-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                        <span>Traditional Monthly Survey</span>
                      </span>
                      <span className="text-[10px] font-mono text-red-600 font-semibold px-2 py-0.5 rounded bg-red-100">
                        Blindspot
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-red-950">
                      {activeItem.legacyShort}
                    </h4>

                    <p className="text-xs text-red-800 leading-relaxed">
                      {activeItem.legacyDetail}
                    </p>

                    <div className="pt-2 border-t border-red-200/60 font-mono text-[11px] text-red-700 font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span>Consequence: {activeItem.legacyConsequence}</span>
                    </div>
                  </div>

                  {/* Right: The Farelytics Method */}
                  <div className="p-5 rounded-xl bg-neutral-900 text-white border border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#F25623] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#F25623]" />
                        <span>Farelytics Real-Time System</span>
                      </span>
                      <span className="text-[10px] font-mono text-[#F25623] font-semibold px-2 py-0.5 rounded bg-[#F25623]/20">
                        Verified Truth
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white">
                      {activeItem.farelyticsShort}
                    </h4>

                    <p className="text-xs text-[#DEDEDE] leading-relaxed">
                      {activeItem.farelyticsDetail}
                    </p>

                    <div className="pt-2 border-t border-neutral-800 font-mono text-[11px] text-[#F25623] font-semibold flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#F25623] shrink-0" />
                      <span>Advantage: {activeItem.farelyticsBenefit}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>
    </div>

      {/* ========================================================================= */}
      {/* 3. HOW IT WORKS (§ 02 / REPRODUCIBLE PIPELINE STUDIO) */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pt-20 pb-16 sm:pt-28 sm:pb-24 space-y-10 scroll-mt-32 border-t border-[#E5E5E5]">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E5E5E5] pb-6">
          <div className="space-y-2 max-w-2xl">
            <div className="scroll-reveal-eyebrow flex items-center gap-2">
              <span className="text-xs font-bold text-[#F25623] uppercase tracking-wider font-mono">
                Section 02 · Reproducible Pipeline
              </span>
              <span className="text-[#A3A3A3]">·</span>
              <span className="text-xs text-[#737373] font-medium">How Farelytics Works</span>
            </div>
            <div className="overflow-hidden py-1">
              <h2 className="scroll-reveal-heading text-3xl sm:text-4xl lg:text-5xl font-black text-[#171717] tracking-tight leading-tight">
                From Daily Quotes to an Audited National Index
              </h2>
            </div>
          </div>
          <p className="scroll-reveal-subheading text-xs sm:text-sm text-[#737373] max-w-md leading-relaxed">
            Four automated, mathematically transparent stages transform volatile airline dynamic fares into India’s volume-weighted civil aviation inflation benchmark.
          </p>
        </div>

        {/* Stepper Tabs */}
        <div className="scroll-reveal-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {pipelineSteps.map((step, idx) => {
            const isSelected = activeStep === idx;
            const StepIcon = [Layers, PieChart, TrendingUp, ShieldCheck][idx] || Layers;

            return (
              <div
                key={step.id}
                onClick={() => setActiveStep(idx)}
                className={`scroll-reveal-card p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-[#171717] text-white border-[#171717] shadow-xl ring-2 ring-[#F25623]/20 -translate-y-0.5'
                    : 'bg-white text-[#171717] border-[#E5E5E5] hover:border-[#171717]/60 hover:bg-[#FAFAFA]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`font-mono text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${
                      isSelected ? 'bg-white/15 text-[#F25623]' : 'bg-[#F4F4F5] text-[#737373]'
                    }`}>
                      Stage {step.number}
                    </span>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-[#F25623] text-white' : 'bg-[#F0F0F0] text-[#737373] group-hover:bg-[#171717] group-hover:text-white'
                    }`}>
                      <StepIcon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-sm font-bold leading-snug">
                    {step.title}
                  </h3>
                  <p className={`text-[11px] mt-1 font-mono ${isSelected ? 'text-[#DEDEDE]' : 'text-[#737373]'}`}>
                    {step.category}
                  </p>
                </div>

                <div className={`mt-4 pt-3 border-t text-[11px] font-mono flex items-center justify-between ${
                  isSelected ? 'border-white/10 text-[#F25623]' : 'border-[#E5E5E5] text-[#171717] font-semibold'
                }`}>
                  <span>{step.metric}</span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-[#F25623] translate-x-0.5' : 'text-[#A3A3A3] group-hover:translate-x-0.5'}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Stage Production Showcase Studio */}
        <div className="scroll-reveal-panel rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-10 shadow-tactile space-y-8 animate-in fade-in duration-300">
          {/* Stage Top Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#E5E5E5]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#F25623] animate-pulse"></span>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#F25623]">
                  Pipeline Phase {pipelineSteps[activeStep].number} · {pipelineSteps[activeStep].category}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
                {pipelineSteps[activeStep].title}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3.5 py-1.5 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] font-mono text-xs font-bold text-[#171717]">
                {pipelineSteps[activeStep].techSpec}
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-[#F25623]/10 text-[#F25623] border border-[#F25623]/20 font-mono text-xs font-bold">
                {pipelineSteps[activeStep].metric}
              </span>
            </div>
          </div>

          {/* Descriptive Narrative */}
          <p className="text-sm sm:text-base text-[#4D4D4D] leading-relaxed max-w-4xl">
            {pipelineSteps[activeStep].description}
          </p>

          {/* ===================================================================== */}
          {/* CUSTOM INTERACTIVE VISUAL CANVAS PER STAGE */}
          {/* ===================================================================== */}

          {/* STAGE 01 VISUAL: MULTI-CARRIER INGESTION HUB */}
          {activeStep === 0 && (
            <div className="rounded-2xl bg-[#FAFAFA] border border-[#E5E5E5] p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E5E5]">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#171717] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#F25623]" />
                  <span>Daily Multi-Carrier Harvester Architecture</span>
                </span>
                <span className="text-[11px] font-mono text-[#737373]">
                  Ingestion Frequency: Every 24 Hours · Zero API Violations
                </span>
              </div>

              {/* Ingestion Visual Nodes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. 5 Monitored Providers */}
                <div className="p-4 rounded-xl bg-white border border-[#E5E5E5] space-y-3">
                  <span className="text-[11px] font-mono uppercase text-[#737373] font-bold block">
                    1. Direct Airline Feeds
                  </span>
                  <div className="space-y-2">
                    {[
                      { name: 'IndiGo Airlines', code: '6E', share: '62.4% Domestic Share' },
                      { name: 'Air India', code: 'AI', share: 'Full-Service Network' },
                      { name: 'Akasa Air', code: 'QP', share: 'High-Density Metro' },
                      { name: 'SpiceJet', code: 'SG', share: 'Regional Connectivity' },
                      { name: 'MakeMyTrip API', code: 'OTA', share: 'Aggregator Parity Audit' },
                    ].map((carrier) => (
                      <div key={carrier.name} className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#FAFAFA] border border-[#EBEBEB]">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-[#171717] text-white font-mono font-bold text-[10px] flex items-center justify-center">
                            {carrier.code}
                          </span>
                          <span className="font-semibold text-[#171717]">{carrier.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-[#737373]">{carrier.share}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. 5 Advance Booking Horizons */}
                <div className="p-4 rounded-xl bg-white border border-[#E5E5E5] space-y-3">
                  <span className="text-[11px] font-mono uppercase text-[#737373] font-bold block">
                    2. Advance Booking Windows
                  </span>
                  <div className="space-y-2">
                    {[
                      { horizon: 'Horizon 1 (Next Day)', role: 'Emergency & Business Travel', icon: '🚨' },
                      { horizon: 'Horizon 7 (7-Days Out)', role: 'Weekend & Near-Term Shifts', icon: '📅' },
                      { horizon: 'Horizon 15 (15-Days Out)', role: 'Semi-Planned Regular Travel', icon: '🛫' },
                      { horizon: 'Horizon 30 (30-Days Out)', role: 'Standard Leisure Bookings', icon: '🌴' },
                      { horizon: 'Horizon 45 (45-Days Out)', role: 'Advance Baseline Fares', icon: '⚓' },
                    ].map((h) => (
                      <div key={h.horizon} className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#FAFAFA] border border-[#EBEBEB]">
                        <span className="font-semibold text-[#171717]">{h.horizon}</span>
                        <span className="text-[10px] font-mono text-[#737373]">{h.role}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Daily Capacity & Health Stats */}
                <div className="p-4 rounded-xl bg-[#171717] text-white border border-black space-y-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-mono uppercase text-[#F25623] font-bold block">
                      3. Harvester Throughput
                    </span>
                    <div className="mt-4 space-y-3">
                      <div>
                        <span className="text-3xl font-black text-white font-mono block">50,000+</span>
                        <span className="text-xs text-[#A3A3A3]">Unique flight quotes collected every 24 hours</span>
                      </div>
                      <div className="pt-3 border-t border-white/10">
                        <span className="text-xl font-bold text-[#F25623] font-mono block">7 Trunk Corridors</span>
                        <span className="text-xs text-[#A3A3A3]">100% of major metro passenger flows tracked</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 text-[10px] font-mono text-[#A3A3A3] flex items-center justify-between">
                    <span>Protocol: DGCA Guidelines</span>
                    <span className="text-emerald-400 font-bold">● Live Ingestion Active</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 02 VISUAL: TRUE COST DECOMPOSITION */}
          {activeStep === 1 && (
            <div className="rounded-2xl bg-[#FAFAFA] border border-[#E5E5E5] p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E5E5]">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#171717] flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-[#F25623]" />
                  <span>Three-Part Ticket Cost Decomposition Analysis</span>
                </span>
                <span className="text-[11px] font-mono text-[#737373]">
                  Representative Route: DEL–BOM (₹8,450 Total Consumer Price)
                </span>
              </div>

              {/* Segmented Visual Price Bar */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-[#171717]">Full Out-Of-Pocket Fare Decomposition</span>
                  <span className="text-xs font-bold text-[#F25623]">₹8,450 Paid at Checkout</span>
                </div>
                
                {/* Visual Ratio Bar */}
                <div className="h-6 w-full rounded-xl overflow-hidden flex shadow-inner">
                  <div style={{ width: '74%' }} className="bg-[#171717] flex items-center justify-center text-[11px] font-mono text-white font-bold" title="Base Fare: ₹6,250 (74%)">
                    Base Fare 74%
                  </div>
                  <div style={{ width: '5%' }} className="bg-[#F25623] flex items-center justify-center text-[10px] font-mono text-white font-bold" title="GST: ₹312 (5%)">
                    5%
                  </div>
                  <div style={{ width: '21%' }} className="bg-[#525252] flex items-center justify-center text-[11px] font-mono text-white font-bold" title="Airport Fees: ₹1,888 (21%)">
                    Airport Fees 21%
                  </div>
                </div>
              </div>

              {/* 3 Detail Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white border border-[#E5E5E5] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#171717]">1. Airline Base Fare</span>
                    <span className="font-mono text-xs font-bold text-[#171717]">₹6,250</span>
                  </div>
                  <p className="text-xs text-[#737373] leading-relaxed">
                    Pure carrier yield and fuel surcharge. Subject to seat-class algorithmic price escalation.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#E5E5E5] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#F25623]">2. Civil Aviation GST</span>
                    <span className="font-mono text-xs font-bold text-[#F25623]">₹312</span>
                  </div>
                  <p className="text-xs text-[#737373] leading-relaxed">
                    Mandatory 5% central tax on domestic economy travel, dynamically fluctuating with ticket cost.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#E5E5E5] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#525252]">3. Airport UDF & PSF</span>
                    <span className="font-mono text-xs font-bold text-[#171717]">₹1,888</span>
                  </div>
                  <p className="text-xs text-[#737373] leading-relaxed">
                    User Development and Passenger Security Fees charged by airport operators (~21% of cost).
                  </p>
                </div>
              </div>

              {/* The Discrepancy Callout Banner */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold">The ₹2,200 Consumer Discrepancy: </span>
                  Standard government price surveys only record the ₹6,250 headline base fare. Farelytics tracks the full ₹8,450 checkout price, exposing +26.2% in true out-of-pocket costs that official statistics overlook.
                </div>
              </div>
            </div>
          )}

          {/* STAGE 03 VISUAL: VOLUME-WEIGHTED CALCULATION */}
          {activeStep === 2 && (
            <div className="rounded-2xl bg-[#FAFAFA] border border-[#E5E5E5] p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E5E5]">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#171717] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#F25623]" />
                  <span>DGCA Passenger Volume Distribution (19.8M Travelers)</span>
                </span>
                <span className="text-[11px] font-mono text-[#737373]">
                  Laspeyres Formulation · 7 Corridors
                </span>
              </div>

              {/* Route Weights Grid */}
              <div className="space-y-3">
                {routes.map((r) => (
                  <div key={r.code} className="p-3 rounded-xl bg-white border border-[#E5E5E5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-xs bg-[#171717] text-white px-2.5 py-1 rounded">
                        {r.code}
                      </span>
                      <span className="font-bold text-[#171717]">{r.name}</span>
                    </div>

                    <div className="flex items-center gap-6 font-mono text-[11px]">
                      <span className="text-[#737373]">{r.pax} Annual Pax</span>
                      
                      {/* Weight Bar */}
                      <div className="flex items-center gap-2 w-36">
                        <div className="h-2 flex-1 rounded-full bg-[#E5E5E5] overflow-hidden">
                          <div 
                            className="h-full bg-[#F25623] rounded-full" 
                            style={{ width: `${parseFloat(r.pct) * 3}%` }} 
                          />
                        </div>
                        <span className="font-bold text-[#171717] w-12 text-right">{r.pct}</span>
                      </div>

                      <span className="font-bold text-[#171717] w-16 text-right">{r.fare}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between font-mono">
                <span>Sum of Corridor Weights: ∑ w_r = 1.0000 (100.0%)</span>
                <span className="font-bold">Total Domestic Traffic Represented: 19,800,000 Pax</span>
              </div>
            </div>
          )}

          {/* STAGE 04 VISUAL: CRYPTOGRAPHIC AUDIT TRAIL */}
          {activeStep === 3 && (
            <div className="rounded-2xl bg-[#FAFAFA] border border-[#E5E5E5] p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E5E5]">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#171717] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#F25623]" />
                  <span>Cryptographic Merkle Audit Trail Architecture</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Verified Tamper-Proof
                </span>
              </div>

              {/* 3-Node Connected Hash Chain */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white border border-[#E5E5E5] space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#737373] block">Step 1: Observation Hashes</span>
                  <h4 className="text-sm font-bold text-[#171717]">50,000+ Raw Flight Quotes</h4>
                  <p className="text-xs text-[#737373] leading-relaxed">
                    Every collected flight quote is permanently hashed with timestamp, carrier ID, and cabin tier.
                  </p>
                  <code className="text-[10px] font-mono text-[#F25623] block bg-[#FAFAFA] p-1.5 rounded border border-[#EBEBEB] truncate">
                    sha256(Quote_ID + Fare + Time)
                  </code>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#E5E5E5] space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#737373] block">Step 2: Corridor Merkle Nodes</span>
                  <h4 className="text-sm font-bold text-[#171717]">7 Route Medians</h4>
                  <p className="text-xs text-[#737373] leading-relaxed">
                    Route medians are mathematically verified across all 5 horizons without dropping verified flights.
                  </p>
                  <code className="text-[10px] font-mono text-[#F25623] block bg-[#FAFAFA] p-1.5 rounded border border-[#EBEBEB] truncate">
                    sha256(Route_DEL_BOM + Median)
                  </code>
                </div>

                <div className="p-4 rounded-xl bg-[#171717] text-white border border-black space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#F25623] block">Step 3: Published Daily Signature</span>
                  <h4 className="text-sm font-bold text-white">APIx National Index Hash</h4>
                  <p className="text-xs text-[#DEDEDE] leading-relaxed">
                    Permanent cryptographic seal. Any alteration to underlying quotes invalidates the root signature.
                  </p>
                  <code className="text-[10px] font-mono text-emerald-400 block bg-black/50 p-1.5 rounded border border-white/10 truncate">
                    root_hash = 7f8a92...c014d
                  </code>
                </div>
              </div>

              {/* DGCA 94% Benchmark Match Banner */}
              <div className="p-4 rounded-xl bg-white border border-[#E5E5E5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold font-mono">
                    94%
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#171717]">DGCA Monthly Report Directional Match</h5>
                    <p className="text-[11px] text-[#737373]">Backtested across 30 consecutive monthly government aviation summaries.</p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-[#171717] bg-[#FAFAFA] px-3 py-1.5 rounded-lg border border-[#E5E5E5]">
                  Statistically Validated
                </span>
              </div>
            </div>
          )}

          {/* Clean Formatted Mathematical Formula Box (No raw LaTeX) */}
          <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E5E5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-[#171717]"></span>
              <span className="text-[#737373] font-semibold">Mathematical Formula:</span>
              <code className="text-[#171717] font-bold bg-white px-3 py-1 rounded-lg border border-[#E5E5E5]">
                {activeStep === 0 && 'Quotes(t) = ⋃ [ Carrier × Route × Horizon ]'}
                {activeStep === 1 && 'Total_Fare = Base_Fare + GST(5%) + (UDF + PSF)_Airport'}
                {activeStep === 2 && 'APIx(t) = ∑ [ w(r) × ( Price(r, t) / BasePrice(r, 0) ) ] × 100'}
                {activeStep === 3 && 'IndexHash = SHA-256 ( Date ‖ APIx_Value ‖ MerkleRootQuoteHash )'}
              </code>
            </div>

            <span className="text-[#A3A3A3] text-[11px] font-mono">
              Volume-Weighted Passenger Average
            </span>
          </div>

          {/* Stepper Navigation Controls & Live Action */}
          <div className="pt-4 border-t border-[#E5E5E5] flex flex-wrap items-center justify-between gap-4">
            {/* Previous & Next Stage Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveStep((prev) => (prev > 0 ? prev - 1 : 3))}
                className="px-3.5 py-2 rounded-lg bg-[#FAFAFA] hover:bg-[#F0F0F0] text-[#171717] font-mono text-xs font-bold border border-[#E5E5E5] transition-all cursor-pointer"
              >
                ← Prev Stage
              </button>
              <button
                type="button"
                onClick={() => setActiveStep((prev) => (prev < 3 ? prev + 1 : 0))}
                className="px-3.5 py-2 rounded-lg bg-[#171717] hover:bg-[#2D2D2D] text-white font-mono text-xs font-bold transition-all cursor-pointer"
              >
                Next Stage →
              </button>
            </div>

            {/* Direct Console Launch Link */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#737373] hidden sm:inline">
                Powered by Supabase PostgreSQL with local SQLite resilience.
              </span>
              <button
                type="button"
                onClick={onLaunchDashboard}
                className="px-4 py-2 rounded-lg bg-[#F25623] hover:bg-[#D94412] text-white font-bold text-xs shadow-tactile active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Inspect in live console</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. POPULAR FLIGHT ROUTES (§ 03 / MONITORED ROUTES) */}
      {/* ========================================================================= */}
      <section id="basket" className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-16 sm:py-24 space-y-8 scroll-mt-24 border-t border-[#E5E5E5]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E5E5E5] pb-4">
          <div>
            <div className="scroll-reveal-eyebrow flex items-center gap-2">
              <span className="text-xs font-bold text-[#F25623] uppercase tracking-wider font-mono">
                Popular Flight Routes
              </span>
              <span className="text-[#A3A3A3]">·</span>
              <span className="text-xs text-[#737373] font-medium">Top City Pairs by Passenger Count</span>
            </div>
            <div className="overflow-hidden py-1">
              <h2 className="scroll-reveal-heading text-3xl sm:text-4xl font-black text-[#171717] tracking-tight mt-1">
                India’s Top 7 Domestic Flight Routes
              </h2>
            </div>
          </div>
          <p className="scroll-reveal-subheading text-xs sm:text-sm text-[#737373] max-w-md leading-relaxed">
            Airlines operate hundreds of routes across India. To ensure rock-solid statistical accuracy, Farelytics tracks the 7 major city connections carrying 19.8 million travelers every year.
          </p>
        </div>

        {/* Route Ledger Table + Interactive Flight Ticket Stub */}
        <div className="scroll-reveal-panel grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Continuous Route Ledger (8 cols) */}
          <div className="lg:col-span-8 border border-[#E5E5E5] rounded-xl bg-white overflow-hidden shadow-sm">
            <div className="grid grid-cols-12 px-4 py-3 bg-[#FAFAFA] border-b border-[#E5E5E5] font-mono text-[10px] font-bold uppercase tracking-wider text-[#737373]">
              <div className="col-span-3">Route Pair</div>
              <div className="col-span-4">City Pair</div>
              <div className="col-span-2 text-right">Traffic</div>
              <div className="col-span-3 text-right">Weight / Surge</div>
            </div>

            <div className="divide-y divide-[#E5E5E5]">
              {routes.map((r) => {
                const isSelected = selectedRouteCode === r.code;
                return (
                  <div
                    key={r.code}
                    onClick={() => setSelectedRouteCode(r.code)}
                    className={`grid grid-cols-12 px-4 py-3.5 items-center cursor-pointer transition-colors text-xs ${
                      isSelected ? 'bg-[#FAFAFA] font-bold' : 'hover:bg-[#F9F9F8]'
                    }`}
                  >
                    <div className="col-span-3 flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#F25623]' : 'bg-transparent'}`}></span>
                      <span className="font-mono font-bold text-[#171717]">{r.code}</span>
                    </div>
                    <div className="col-span-4 text-[#4D4D4D]">
                      {r.name}
                    </div>
                    <div className="col-span-2 text-right font-mono text-[#737373]">
                      {r.pax}
                    </div>
                    <div className="col-span-3 text-right font-mono flex items-center justify-end gap-2">
                      <span className="text-[#171717] font-bold">{r.pct}</span>
                      <span className="text-[#F25623] font-bold">{r.surge}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Coverage Footer Row */}
            <div className="p-4 bg-[#F9F9F8] border-t border-[#E5E5E5] flex items-center justify-between text-xs font-mono">
              <span className="text-[#737373] uppercase font-bold">Total Monitored Route Volume</span>
              <span className="text-[#171717] font-bold">19.8M Pax · 100% Traffic Covered</span>
            </div>
          </div>

          {/* Right: Boarding Ticket Stub Breakdown Card (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-[#E5E5E5] rounded-2xl shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#F25623] font-bold">
                  Route Inspector
                </span>
                <h4 className="text-xl font-black font-mono text-[#171717] mt-0.5">
                  {selectedRoute.code}
                </h4>
              </div>
              <span className="text-xs font-bold text-[#F25623] bg-[#F25623]/10 px-2 py-0.5 rounded">
                {selectedRoute.surge} Surge
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-[#737373] block">Route Details</span>
              <span className="text-sm font-bold text-[#171717] block">{selectedRoute.name}</span>
            </div>

            {/* Ticket Perforation Notch */}
            <div className="ticket-notch-divider pt-4 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center text-[#737373]">
                <span>Annual Passenger Trips:</span>
                <span className="font-bold text-[#171717]">{selectedRoute.pax}</span>
              </div>
              <div className="flex justify-between items-center text-[#737373]">
                <span>National Route Share:</span>
                <span className="font-bold text-[#171717]">{selectedRoute.weight} ({selectedRoute.pct})</span>
              </div>
              <div className="flex justify-between items-center text-[#737373]">
                <span>Mean Base Fare:</span>
                <span className="text-[#171717]">{selectedRoute.base}</span>
              </div>
              <div className="flex justify-between items-center text-[#737373]">
                <span>Taxes & Airport Fees:</span>
                <span className="text-[#171717]">{selectedRoute.taxes}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#E5E5E5] font-bold text-sm">
                <span className="text-[#171717]">Total Payable Fare:</span>
                <span className="text-[#F25623]">{selectedRoute.fare}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onSelectTab && onSelectTab('routes');
                onLaunchDashboard();
              }}
              className="w-full py-3 rounded-xl bg-[#171717] hover:bg-[#2D2D2D] text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm cursor-pointer"
            >
              <span>Explore Route Heatmap</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#F25623]" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. PLATFORM CAPABILITIES (§ 04 / INTERACTIVE PERSPECTIVES) */}
      {/* ========================================================================= */}
      <section id="capabilities" className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-16 sm:py-24 space-y-8 scroll-mt-24 border-t border-[#E5E5E5]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E5E5E5] pb-4">
          <div>
            <div className="scroll-reveal-eyebrow flex items-center gap-2">
              <span className="text-xs font-bold text-[#F25623] uppercase tracking-wider font-mono">
                Platform Features
              </span>
              <span className="text-[#A3A3A3]">·</span>
              <span className="text-xs text-[#737373] font-medium">Interactive Perspectives</span>
            </div>
            <div className="overflow-hidden py-1">
              <h2 className="scroll-reveal-heading text-3xl sm:text-4xl font-black text-[#171717] tracking-tight mt-1">
                7 Interactive Analytics Views
              </h2>
            </div>
          </div>
          <p className="scroll-reveal-subheading text-xs sm:text-sm text-[#737373] max-w-md leading-relaxed">
            Select any view below to inspect real-time data in the live console.
          </p>
        </div>

        <div className="scroll-reveal-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            onClick={() => { onSelectTab && onSelectTab('national'); onLaunchDashboard(); }}
            className="scroll-reveal-card card-tactile p-6 bg-white border border-[#E5E5E5] rounded-xl cursor-pointer group flex flex-col justify-between hover:border-[#171717]"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#171717] text-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform">
                <TrendingUp className="w-5 h-5 text-[#F25623]" />
              </div>
              <h4 className="text-sm font-bold text-[#171717] group-hover:text-[#F25623] transition-colors flex items-center justify-between">
                <span>National Airfare Index</span>
                <ArrowUpRight className="w-4 h-4 text-[#737373] group-hover:text-[#F25623] transition-transform" />
              </h4>
              <p className="text-xs text-[#737373] mt-2 leading-relaxed">
                National price index tracking with daily, weekly, and monthly trends, plus a detailed 5-factor price breakdown.
              </p>
            </div>
            <span className="mt-4 pt-3 border-t border-[#E5E5E5] font-mono text-[10px] text-[#A3A3A3] block">
              TAB 01 · NATIONAL INDEX
            </span>
          </div>

          <div 
            onClick={() => { onSelectTab && onSelectTab('routes'); onLaunchDashboard(); }}
            className="scroll-reveal-card card-tactile p-6 bg-white border border-[#E5E5E5] rounded-xl cursor-pointer group flex flex-col justify-between hover:border-[#171717]"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#171717] text-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform">
                <Plane className="w-5 h-5 text-[#F25623]" />
              </div>
              <h4 className="text-sm font-bold text-[#171717] group-hover:text-[#F25623] transition-colors flex items-center justify-between">
                <span>Route Price Heatmap</span>
                <ArrowUpRight className="w-4 h-4 text-[#737373] group-hover:text-[#F25623] transition-transform" />
              </h4>
              <p className="text-xs text-[#737373] mt-2 leading-relaxed">
                Visual price matrix across all major routes. Spot which flight paths are driving airfare inflation at a glance.
              </p>
            </div>
            <span className="mt-4 pt-3 border-t border-[#E5E5E5] font-mono text-[10px] text-[#A3A3A3] block">
              TAB 02 · ROUTE MATRIX
            </span>
          </div>

          <div 
            onClick={() => { onSelectTab && onSelectTab('leadtime'); onLaunchDashboard(); }}
            className="scroll-reveal-card card-tactile p-6 bg-white border border-[#E5E5E5] rounded-xl cursor-pointer group flex flex-col justify-between hover:border-[#171717]"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#171717] text-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5 text-[#F25623]" />
              </div>
              <h4 className="text-sm font-bold text-[#171717] group-hover:text-[#F25623] transition-colors flex items-center justify-between">
                <span>Advance Booking Surge</span>
                <ArrowUpRight className="w-4 h-4 text-[#737373] group-hover:text-[#F25623] transition-transform" />
              </h4>
              <p className="text-xs text-[#737373] mt-2 leading-relaxed">
                Tracks how prices jump as departure day approaches. See the difference between booking 45 days early vs last-minute.
              </p>
            </div>
            <span className="mt-4 pt-3 border-t border-[#E5E5E5] font-mono text-[10px] text-[#A3A3A3] block">
              TAB 03 · ADVANCE PURCHASE
            </span>
          </div>

          <div 
            onClick={() => { onSelectTab && onSelectTab('airlines'); onLaunchDashboard(); }}
            className="scroll-reveal-card card-tactile p-6 bg-white border border-[#E5E5E5] rounded-xl cursor-pointer group flex flex-col justify-between hover:border-[#171717]"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#171717] text-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5 text-[#F25623]" />
              </div>
              <h4 className="text-sm font-bold text-[#171717] group-hover:text-[#F25623] transition-colors flex items-center justify-between">
                <span>Airline Price Comparison</span>
                <ArrowUpRight className="w-4 h-4 text-[#737373] group-hover:text-[#F25623] transition-transform" />
              </h4>
              <p className="text-xs text-[#737373] mt-2 leading-relaxed">
                Side-by-side airfare comparison across IndiGo, Air India, Akasa Air, and SpiceJet with budget and full-service tags.
              </p>
            </div>
            <span className="mt-4 pt-3 border-t border-[#E5E5E5] font-mono text-[10px] text-[#A3A3A3] block">
              TAB 04 · CARRIER SPREAD
            </span>
          </div>

          <div 
            onClick={() => { onSelectTab && onSelectTab('breakdown'); onLaunchDashboard(); }}
            className="scroll-reveal-card card-tactile p-6 bg-white border border-[#E5E5E5] rounded-xl cursor-pointer group flex flex-col justify-between hover:border-[#171717]"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#171717] text-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5 text-[#F25623]" />
              </div>
              <h4 className="text-sm font-bold text-[#171717] group-hover:text-[#F25623] transition-colors flex items-center justify-between">
                <span>Ticket Cost Breakdown</span>
                <ArrowUpRight className="w-4 h-4 text-[#737373] group-hover:text-[#F25623] transition-transform" />
              </h4>
              <p className="text-xs text-[#737373] mt-2 leading-relaxed">
                See where passenger money actually goes: pure base airline fare, 5% GST, and airport development charges.
              </p>
            </div>
            <span className="mt-4 pt-3 border-t border-[#E5E5E5] font-mono text-[10px] text-[#A3A3A3] block">
              TAB 05 · FARE BREAKDOWN
            </span>
          </div>

          <div 
            onClick={() => { onSelectTab && onSelectTab('backtest'); onLaunchDashboard(); }}
            className="scroll-reveal-card card-tactile p-6 bg-white border border-[#E5E5E5] rounded-xl cursor-pointer group flex flex-col justify-between hover:border-[#171717]"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#171717] text-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform">
                <FileCheck2 className="w-5 h-5 text-[#F25623]" />
              </div>
              <h4 className="text-sm font-bold text-[#171717] group-hover:text-[#F25623] transition-colors flex items-center justify-between">
                <span>30-Day Benchmark Check</span>
                <ArrowUpRight className="w-4 h-4 text-[#737373] group-hover:text-[#F25623] transition-transform" />
              </h4>
              <p className="text-xs text-[#737373] mt-2 leading-relaxed">
                Verified against official government civil aviation reports with a 94.0% accuracy match.
              </p>
            </div>
            <span className="mt-4 pt-3 border-t border-[#E5E5E5] font-mono text-[10px] text-[#A3A3A3] block">
              TAB 07 · DGCA BACKTEST
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. CALL TO ACTION SECTION */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pt-6 pb-20 sm:pb-28">
        <div className="scroll-reveal-panel rounded-3xl bg-[#171717] text-white p-8 sm:p-14 text-center shadow-xl relative overflow-hidden">
          <GradientBackground className="absolute inset-0 pointer-events-none opacity-80" variant="brand" grainOpacity={0.08} />
          <div className="relative z-10 space-y-6">
            <div className="max-w-3xl mx-auto space-y-4">
              <span className="scroll-reveal-eyebrow text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 inline-block text-[#F25623] font-mono">
                Production Ready · Stable Benchmark
              </span>
              <div className="overflow-hidden py-1">
                <h2 className="scroll-reveal-heading text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                  Audit India’s Airfare Inflation with Statistical Rigor.
                </h2>
              </div>
              <p className="scroll-reveal-subheading text-sm sm:text-base text-[#DEDEDE] max-w-xl mx-auto leading-relaxed font-normal">
                Inspect live route prices, advance booking trends, and verified airfare history in the live console now.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              <button
                type="button"
                onClick={onLaunchDashboard}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#F25623] hover:bg-[#D94412] text-white font-bold text-sm shadow-tactile active:scale-95 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Launch Analytics Console</span>
                <ArrowUpRight className="w-4 h-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
              
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('basket');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-7 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 active:scale-95 transition-all cursor-pointer"
              >
                Explore Flight Routes
              </button>
            </div>

            <div className="pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 font-mono text-[11px] text-[#A3A3A3]">
              <span>● MoSPI / NSO & RBI Economics</span>
              <span>● DGCA Traffic Aligned (19.8M Pax)</span>
              <span>● Volume-Weighted Calculation</span>
              <span>● Verified Data Audit Trail</span>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-black/60 hover:bg-[#F25623] backdrop-blur-xl border border-white/20 text-white shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group cursor-pointer"
          aria-label="Back to Top"
        >
          <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      )}
    </div>
  );
}