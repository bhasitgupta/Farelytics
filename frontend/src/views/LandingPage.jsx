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
  cardLagStep: 30,              // Staggered vertical lag (px) between grid items
  blurIntensity: 4,             // Initial blur (px) for blur-to-sharp reveals
  scaleStart: 0.97,             // Initial scale for cards entering viewport
};

const TOP_ROUTES = [
  { code: 'DEL-BOM', name: 'Delhi — Mumbai', pax: '4.92M', base: '₹5,850', fees: '₹1,843', total: '₹7,693', surge: '+8.2%', extraPct: 31.5, reason: 'High airport passenger handling & security tariffs at IGIA.' },
  { code: 'DEL-BLR', name: 'Delhi — Bengaluru', pax: '3.61M', base: '₹6,400', fees: '₹2,000', total: '₹8,400', surge: '+11.4%', extraPct: 31.3, reason: 'Bengaluru airport arrival UDF fee adds ₹1,200 alone.' },
  { code: 'BOM-BLR', name: 'Mumbai — Bengaluru', pax: '2.84M', base: '₹3,900', fees: '₹1,315', total: '₹5,215', surge: '+4.1%', extraPct: 33.7, reason: 'Short trunk flights suffer greatest percentage fee penalty.' },
  { code: 'DEL-HYD', name: 'Delhi — Hyderabad', pax: '2.41M', base: '₹4,800', fees: '₹1,620', total: '₹6,420', surge: '+5.9%', extraPct: 33.8, reason: 'Rajiv Gandhi International airport UDF adds ₹980 + taxes.' },
  { code: 'CCU-DEL', name: 'Kolkata — Delhi', pax: '2.10M', base: '₹5,600', fees: '₹1,770', total: '₹7,370', surge: '+6.5%', extraPct: 31.6, reason: 'Key east-to-north corridor with heavy weekend price surges.' },
  { code: 'MAA-DEL', name: 'Chennai — Delhi', pax: '1.98M', base: '₹5,900', fees: '₹1,815', total: '₹7,715', surge: '+6.8%', extraPct: 30.8, reason: 'Last-minute flights within 72h jump by over 75%.' },
  { code: 'BLR-HYD', name: 'Bengaluru — Hyderabad', pax: '1.94M', base: '₹3,200', fees: '₹1,150', total: '₹4,350', surge: '+9.3%', extraPct: 35.9, reason: 'Fixed airport development fees add 36% over base fare.' },
];

// Accessible Split-Word Opacity Fill Component
function ScrubWordFill({ text, className = "", as: Component = "p", groupClass = "" }) {
  const words = useMemo(() => text.split(" "), [text]);
  return (
    <Component className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={i} className="inline-block whitespace-pre mr-[0.25em]" aria-hidden="true">
          <span 
            className={`scrub-fill-word inline-block will-change-[opacity,transform] ${groupClass}`}
            style={{ opacity: MOTION_TUNING.wordFillStartOpacity }}
          >
            {word}
          </span>
        </span>
      ))}
    </Component>
  );
}

// Accessible Split-Word Masked Heading Component
function ScrubHeadingWords({ text, className = "", as: Component = "h2", groupClass = "" }) {
  const words = useMemo(() => text.split(" "), [text]);
  return (
    <Component className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden pb-1 pt-0.5 mr-[0.25em] align-top" aria-hidden="true">
          <span className={`scrub-heading-word inline-block will-change-transform ${groupClass}`}>
            {word}
          </span>
        </span>
      ))}
    </Component>
  );
}

export default function LandingPage({ onLaunchDashboard, onSelectTab, onSectionChange }) {
  const pageContainerRef = useRef(null);
  const progressBarRef = useRef(null);
  const [activeRouteIndex, setActiveRouteIndex] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Section Observer
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);

      const sections = ['problem', 'how-it-works', 'basket', 'cta'];
      let current = '';
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 260 && rect.bottom >= 120) {
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

  // =========================================================================
  // MASTER SCROLL-DRIVEN MOTION ENGINE (GSAP + SCROLLTRIGGER WITH SCRUB)
  // =========================================================================
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Small timeout ensures DOM and heights are stable before measuring triggers
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    const ctx = gsap.context(() => {
      // 0. Top Scroll Progress Bar
      if (progressBarRef.current) {
        gsap.to(progressBarRef.current, {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: pageContainerRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.1,
          },
        });
      }

      // 1. THE PROBLEM SECTION SCROLL-DRIVEN REVEALS
      gsap.fromTo('.problem-heading-word', 
        { yPercent: 110, rotateZ: MOTION_TUNING.headingRotation, opacity: 0 },
        {
          yPercent: 0,
          rotateZ: 0,
          opacity: 1,
          stagger: MOTION_TUNING.headingStagger,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '#problem',
            start: 'top 85%',
            end: 'top 45%',
            scrub: MOTION_TUNING.scrubSpeed,
          },
        }
      );

      // Problem paragraph word-by-word opacity fill
      gsap.to('.problem-body-word', {
        opacity: 1,
        stagger: 0.015,
        ease: 'none',
        scrollTrigger: {
          trigger: '#problem',
          start: 'top 75%',
          end: 'top 40%',
          scrub: MOTION_TUNING.scrubSpeed,
        },
      });

      // Problem 3-stage ticket cards scrubbed sequential scale & highlight
      gsap.fromTo('.ticket-step-card',
        { opacity: 0.3, y: 30, scale: MOTION_TUNING.scaleStart },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.ticket-inspector-card',
            start: 'top 80%',
            end: 'top 35%',
            scrub: MOTION_TUNING.scrubSpeed,
          },
        }
      );

      // 2. METHODOLOGY SECTION SCROLL SCRUB
      gsap.fromTo('.method-heading-word',
        { yPercent: 110, rotateZ: -MOTION_TUNING.headingRotation, opacity: 0 },
        {
          yPercent: 0,
          rotateZ: 0,
          opacity: 1,
          stagger: MOTION_TUNING.headingStagger,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '#how-it-works',
            start: 'top 85%',
            end: 'top 45%',
            scrub: MOTION_TUNING.scrubSpeed,
          },
        }
      );

      // 3 Staggered Elevator Cards with individual view scrub
      gsap.utils.toArray('.method-elevator-card').forEach((card, idx) => {
        const lag = (idx + 1) * MOTION_TUNING.cardLagStep;
        gsap.fromTo(card,
          { opacity: 0.2, y: lag + 30, scale: MOTION_TUNING.scaleStart },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '#how-it-works',
              start: `top ${85 - idx * 5}%`,
              end: `top ${40 - idx * 5}%`,
              scrub: MOTION_TUNING.scrubSpeed,
            },
          }
        );
      });

      // 3. THE 7 ROUTES CORRIDORS GRID
      gsap.fromTo('.routes-heading-word',
        { yPercent: 110, rotateZ: MOTION_TUNING.headingRotation, opacity: 0 },
        {
          yPercent: 0,
          rotateZ: 0,
          opacity: 1,
          stagger: MOTION_TUNING.headingStagger,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '#basket',
            start: 'top 85%',
            end: 'top 45%',
            scrub: MOTION_TUNING.scrubSpeed,
          },
        }
      );

      // Route Cards wave scrub
      gsap.fromTo('.route-grid-item',
        { opacity: 0.15, y: 40, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '#basket',
            start: 'top 75%',
            end: 'top 30%',
            scrub: MOTION_TUNING.scrubSpeed,
          },
        }
      );

      // 4. GRAND CALL TO ACTION SECTION
      gsap.fromTo('.cta-heading-word',
        { yPercent: 110, rotateZ: -MOTION_TUNING.headingRotation, opacity: 0 },
        {
          yPercent: 0,
          rotateZ: 0,
          opacity: 1,
          stagger: MOTION_TUNING.headingStagger,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '#cta',
            start: 'top 85%',
            end: 'top 45%',
            scrub: MOTION_TUNING.scrubSpeed,
          },
        }
      );

      // CTA paragraph word-fill
      gsap.to('.cta-body-word', {
        opacity: 1,
        stagger: 0.02,
        ease: 'none',
        scrollTrigger: {
          trigger: '#cta',
          start: 'top 75%',
          end: 'top 40%',
          scrub: MOTION_TUNING.scrubSpeed,
        },
      });

      // CTA Telemetry Glass Card: blur-to-sharp & scale scrub
      gsap.fromTo('.cta-hud-card',
        { 
          opacity: 0.25, 
          scale: MOTION_TUNING.scaleStart, 
          filter: `blur(${MOTION_TUNING.blurIntensity}px)`,
          y: 35
        },
        {
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          y: 0,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '#cta',
            start: 'top 75%',
            end: 'top 35%',
            scrub: MOTION_TUNING.scrubSpeed,
          },
        }
      );

      // Numbers Counter scrub on CTA stats
      gsap.fromTo('.stat-counter-number',
        { opacity: 0.3, y: 15 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '#cta',
            start: 'top 70%',
            end: 'top 40%',
            scrub: MOTION_TUNING.scrubSpeed,
          },
        }
      );

    }, pageContainerRef);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, []);

  const activeRoute = TOP_ROUTES[activeRouteIndex];

  return (
    <div 
      ref={pageContainerRef} 
      className="w-full bg-[#FAFAFA] text-[#111111] selection:bg-[#3171C6]/15 font-sans antialiased min-h-screen relative"
    >
      {/* ========================================================================= */}
      {/* 0. GLOBAL SCROLL PROGRESS BAR (CSS DRIVEN WITH GSAP SCRUB FALLBACK) */}
      {/* ========================================================================= */}
      <div 
        ref={progressBarRef}
        id="scroll-progress-bar"
        className="fixed top-0 left-0 right-0 h-[2px] bg-[#3171C6] z-50 origin-left scale-x-0 css-scroll-progress pointer-events-none"
        aria-hidden="true"
      />

      {/* ========================================================================= */}
      {/* 1. HERO SECTION WITH SCROLL-FLY-IN PARALLAX JET & ENERGETIC ENTRANCE */}
      {/* ========================================================================= */}
      <ScrollFlyIn
        imageUrl="https://cdn.21st.dev/assets/mirror/f8/f807350ced7c5e2b79dd250c7de73eebcd402442c40f562e3003c95752a75b5c.webp"
        imageAlt="Top view of private airliner flying across the screen on scroll"
        className="border-b border-[#EAEAEA]"
      >
        <div className="space-y-8 sm:space-y-10 py-12">
          
          {/* Status Label with Spring Entrance */}
          <motion.div 
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center"
          >
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-[#E5E5E5] text-xs font-mono text-[#555555] shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3171C6] animate-pulse" />
              <span className="font-semibold text-[#111111]">+7.20%</span>
              <span className="text-[#888888]">·</span>
              <span>Daily India airfare index vs August 2026</span>
              <button 
                type="button"
                onClick={onLaunchDashboard}
                className="border-l border-[#E5E5E5] pl-2.5 text-[#3171C6] font-medium hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>Open index</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>

          {/* Masked Headline with Energetic Staggered Rise */}
          <div className="max-w-3xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-[72px] font-medium tracking-[-0.035em] leading-[1.06] text-[#111111]">
              <span className="block overflow-hidden py-1">
                <motion.span 
                  initial={{ y: "115%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                  className="inline-block will-change-transform"
                >
                  The real price
                </motion.span>
              </span>
              <span className="block overflow-hidden py-1">
                <motion.span 
                  initial={{ y: "115%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.22 }}
                  className="inline-block will-change-transform"
                >
                  of flying in India.
                </motion.span>
              </span>
            </h1>

            {/* Subheading with Smooth Spring Fade */}
            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.34 }}
              className="text-lg sm:text-xl text-[#555555] leading-relaxed max-w-[620px] mx-auto font-normal"
            >
              Airlines add airport fees and change ticket prices every hour. We track 50,000 real domestic fares every day so you see true prices.
            </motion.p>
          </div>

          {/* CTAs with Spring Pop */}
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.46 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-1"
          >
            <button
              type="button"
              onClick={onLaunchDashboard}
              className="px-7 py-3.5 rounded-full bg-[#111111] hover:bg-[#2A2A2A] text-white font-medium text-sm transition-all duration-200 cursor-pointer flex items-center gap-2 active:scale-95 shadow-md hover:shadow-lg"
            >
              <span>View live index</span>
              <ArrowRight className="w-4 h-4 text-[#888888]" />
            </button>
            <button
              type="button"
              onClick={() => smoothScrollTo('problem')}
              className="px-5 py-3.5 rounded-full bg-white hover:bg-neutral-100 text-[#555555] hover:text-[#111111] font-medium text-sm border border-[#E5E5E5] transition-all duration-200 cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <span>How pricing works</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#888888]" />
            </button>
          </motion.div>

          {/* Today's Route Strip with Subtle Fade In */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.58 }}
            className="pt-8 border-t border-[#EAEAEA] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs max-w-4xl mx-auto"
          >
            <span className="font-mono text-[#888888] uppercase tracking-wider text-[11px]">
              Today's total price on top routes:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
              {TOP_ROUTES.slice(0, 4).map((r, idx) => (
                <button
                  key={r.code}
                  type="button"
                  onClick={() => {
                    setActiveRouteIndex(idx);
                    smoothScrollTo('problem');
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E5] hover:border-[#CCCCCC] text-[#111111] transition-colors cursor-pointer shrink-0 shadow-xs"
                >
                  <span className="font-mono font-medium text-[#555555]">{r.code}</span>
                  <span className="font-mono font-semibold">{r.total}</span>
                  <span className="font-mono text-[10px] text-[#3171C6] font-medium">{r.surge}</span>
                </button>
              ))}
            </div>
          </motion.div>

        </div>
      </ScrollFlyIn>

      {/* ========================================================================= */}
      {/* 2. THE PROBLEM */}
      {/* ========================================================================= */}
      <section id="problem" className="py-24 sm:py-36 border-b border-[#EAEAEA] scroll-mt-12">
        <div className="max-w-[1120px] mx-auto px-6 sm:px-8 space-y-16">
          
          {/* Section Header with Word-by-Word Scrub Reveal */}
          <div className="max-w-2xl space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#888888] font-medium block">
              The price gap
            </span>
            <ScrubHeadingWords 
              text="Flight search prices leave out 31% in airport fees."
              className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.03em] leading-[1.12] text-[#111111]"
              groupClass="problem-heading-word"
            />
            <ScrubWordFill 
              text="Booking sites show base fares first to look cheaper. Airport user development fees and taxes are added right before payment. We track the final price passengers pay."
              className="text-base sm:text-lg text-[#555555] leading-relaxed"
              groupClass="problem-body-word"
            />
          </div>

          {/* Interactive Ticket Inspector Card with Scroll Progression */}
          <div className="ticket-inspector-card rounded-2xl bg-white border border-[#E5E5E5] p-6 sm:p-10 space-y-8">
            
            {/* Route Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAEAEA]">
              <span className="text-xs font-mono uppercase text-[#888888]">
                Choose a route:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                {TOP_ROUTES.slice(0, 5).map((r, idx) => (
                  <button
                    key={r.code}
                    type="button"
                    onClick={() => setActiveRouteIndex(idx)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
                      activeRouteIndex === idx
                        ? 'bg-[#111111] text-white font-medium'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-[#555555]'
                    }`}
                  >
                    {r.code}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Split - Scrubbed Sequential Progression */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 space-y-6">
                <div>
                  <span className="text-xs font-mono text-[#888888]">{activeRoute.name}</span>
                  <h3 className="text-xl sm:text-2xl font-medium text-[#111111] mt-0.5 tracking-[-0.02em]">
                    Where your money goes
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Step 1 */}
                  <div className="ticket-step-card p-4 rounded-xl bg-[#FAFAFA] border border-[#EAEAEA] space-y-1 will-change-[transform,opacity]">
                    <span className="text-[11px] text-[#888888] block">1. Base fare</span>
                    <span className="text-2xl font-medium font-mono text-[#111111] block">{activeRoute.base}</span>
                    <span className="text-[11px] text-[#999999] block">Shown on search sites</span>
                  </div>

                  {/* Step 2 */}
                  <div className="ticket-step-card p-4 rounded-xl bg-[#FAFAFA] border border-[#3171C6]/30 space-y-1 will-change-[transform,opacity]">
                    <span className="text-[11px] text-[#3171C6] font-medium block">2. Airport fees & 5% GST</span>
                    <span className="text-2xl font-medium font-mono text-[#3171C6] block">+{activeRoute.fees}</span>
                    <span className="text-[11px] text-[#888888] block">Added at checkout</span>
                  </div>

                  {/* Step 3 */}
                  <div className="ticket-step-card p-4 rounded-xl bg-[#111111] text-white space-y-1 will-change-[transform,opacity]">
                    <span className="text-[11px] text-neutral-400 block">3. Total you pay</span>
                    <span className="text-2xl font-medium font-mono text-white block">{activeRoute.total}</span>
                    <span className="text-[11px] text-neutral-300 font-mono block">+{activeRoute.extraPct}% added fee</span>
                  </div>
                </div>

                <p className="text-xs text-[#666666] leading-relaxed pt-1">
                  Note: {activeRoute.reason}
                </p>
              </div>

              {/* Side Note */}
              <div className="lg:col-span-4 p-5 rounded-xl bg-[#FAFAFA] border border-[#EAEAEA] space-y-4">
                <span className="text-xs font-mono uppercase tracking-wider text-[#111111] font-medium block">
                  Why monthly surveys fall behind
                </span>
                <p className="text-xs text-[#555555] leading-relaxed">
                  Official inflation counts airfares once a month on one fixed day and skips airport fees. When weekend flights double, official records miss the rise.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onLaunchDashboard}
                    className="w-full py-2.5 rounded-lg bg-white border border-[#E5E5E5] hover:border-[#CCCCCC] text-[#111111] text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>See route comparisons</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#888888]" />
                  </button>
                </div>
// Refactor progress checkpoint: step 25/36
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