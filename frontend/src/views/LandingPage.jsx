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
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. METHODOLOGY */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-24 sm:py-36 border-b border-[#EAEAEA] scroll-mt-12">
        <div className="max-w-[1120px] mx-auto px-6 sm:px-8 space-y-16">
          
          <div className="max-w-2xl space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#888888] font-medium block">
              Method
            </span>
            <ScrubHeadingWords 
              text="Simple, daily, independent."
              className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.03em] leading-[1.12] text-[#111111]"
              groupClass="method-heading-word"
            />
            <p className="text-base sm:text-lg text-[#555555] leading-relaxed">
              How 50,000 daily quotes turn into India's airfare index.
            </p>
          </div>

          {/* 3 Staggered Elevator Cards Scrubbed to Scroll */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="method-elevator-card p-6 rounded-2xl bg-white border border-[#E5E5E5] space-y-3 will-change-[transform,opacity]">
              <span className="font-mono text-xs text-[#888888]">01</span>
              <h3 className="text-lg font-medium text-[#111111]">Daily collection</h3>
              <p className="text-sm text-[#555555] leading-relaxed">
                We collect prices from IndiGo, Air India, Akasa, and SpiceJet every 24 hours across five booking windows, from next-day to 45 days ahead.
              </p>
              <div className="pt-2 text-xs font-mono text-[#3171C6]">
                50,000 quotes daily
              </div>
            </div>

            <div className="method-elevator-card p-6 rounded-2xl bg-white border border-[#E5E5E5] space-y-3 will-change-[transform,opacity]">
              <span className="font-mono text-xs text-[#888888]">02</span>
              <h3 className="text-lg font-medium text-[#111111]">Total checkout price</h3>
              <p className="text-sm text-[#555555] leading-relaxed">
                Every ticket includes base fare, passenger taxes, and airport user fees so the index reflects real payments.
              </p>
              <div className="pt-2 text-xs font-mono text-[#3171C6]">
                Full price transparency
              </div>
            </div>

            <div className="method-elevator-card p-6 rounded-2xl bg-white border border-[#E5E5E5] space-y-3 will-change-[transform,opacity]">
              <span className="font-mono text-xs text-[#888888]">03</span>
              <h3 className="text-lg font-medium text-[#111111]">Real passenger weights</h3>
              <p className="text-sm text-[#555555] leading-relaxed">
                Busiest routes like Delhi–Mumbai carry 4.9 million people and count for more in the index, matched against official aviation data.
              </p>
              <div className="pt-2 text-xs font-mono text-[#3171C6]">
                94% match with official data
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. THE 7 ROUTES */}
      {/* ========================================================================= */}
      <section id="basket" className="py-24 sm:py-36 border-b border-[#EAEAEA] scroll-mt-12">
        <div className="max-w-[1120px] mx-auto px-6 sm:px-8 space-y-16">
          
          <div className="max-w-2xl space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#888888] font-medium block">
              Network
            </span>
            <ScrubHeadingWords 
              text="India's seven busiest routes."
              className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.03em] leading-[1.12] text-[#111111]"
              groupClass="routes-heading-word"
            />
            <p className="text-base sm:text-lg text-[#555555] leading-relaxed">
              19.8 million passengers yearly. Select any route to open the index.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOP_ROUTES.map((r) => (
              <div
                key={r.code}
                onClick={() => {
                  if (onSelectTab) onSelectTab('routes');
                  onLaunchDashboard();
                }}
                className="route-grid-item p-5 rounded-xl bg-white border border-[#E5E5E5] hover:border-[#CCCCCC] transition-colors cursor-pointer space-y-4 will-change-[transform,opacity]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-medium text-sm text-[#111111]">
                    {r.code}
                  </span>
                  <span className="text-xs font-mono text-[#3171C6]">
                    {r.surge} 30D
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-[#888888] block">Route</span>
                  <span className="text-sm font-medium text-[#111111] block">{r.name}</span>
                </div>

                <div className="pt-3 border-t border-[#EAEAEA] flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-[#888888] block">Average total</span>
                    <span className="font-semibold text-[#111111]">{r.total}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#888888] block">Passengers</span>
                    <span className="text-[#555555]">{r.pax}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. GRAND CALL TO ACTION */}
      {/* ========================================================================= */}
      <section id="cta" className="py-24 sm:py-36">
        <div className="max-w-[1120px] mx-auto px-6 sm:px-8">
          <div className="rounded-3xl bg-[#111111] text-white p-8 sm:p-14 lg:p-16 space-y-12">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-6">
                <span className="text-xs font-mono uppercase tracking-widest text-[#888888] font-medium block">
                  Live index
                </span>

                <ScrubHeadingWords 
                  text="See the true cost of flying."
                  className="text-3xl sm:text-5xl font-medium tracking-[-0.03em] leading-[1.1] text-white"
                  groupClass="cta-heading-word"
                />

                <ScrubWordFill 
                  text="Monthly inflation surveys miss rapid ticket price swings. Use Farelytics to track daily prices, advance booking curves, and airline spreads across seven top routes."
                  className="text-base text-neutral-300 leading-relaxed max-w-xl"
                  groupClass="cta-body-word"
                />

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onLaunchDashboard}
                    className="px-6 py-3 rounded-full bg-white hover:bg-neutral-100 text-[#111111] font-medium text-sm transition-all duration-200 cursor-pointer flex items-center gap-2 active:scale-98"
                  >
                    <span>Open live index</span>
                    <ArrowRight className="w-4 h-4 text-[#888888]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => smoothScrollTo('problem')}
                    className="px-5 py-3 rounded-full bg-transparent hover:bg-neutral-800 text-neutral-300 hover:text-white font-medium text-sm transition-all duration-200 cursor-pointer"
                  >
                    <span>Read the background</span>
                  </button>
                </div>

                {/* Counters scrubbed to scroll progress */}
                <div className="pt-6 border-t border-neutral-800 grid grid-cols-3 gap-4 text-left">
                  <div className="stat-counter-number will-change-[transform,opacity]">
                    <span className="block font-mono text-xl font-medium text-white">
                      107.20
                    </span>
                    <span className="text-xs text-neutral-400">Index (+7.2%)</span>
                  </div>
                  <div className="stat-counter-number will-change-[transform,opacity]">
                    <span className="block font-mono text-xl font-medium text-white">
                      7
                    </span>
                    <span className="text-xs text-neutral-400">Routes</span>
                  </div>
                  <div className="stat-counter-number will-change-[transform,opacity]">
                    <span className="block font-mono text-xl font-medium text-white">
                      94.0%
                    </span>
                    <span className="text-xs text-neutral-400">Official correlation</span>
                  </div>
                </div>
              </div>

              {/* Minimal Corridor Preview HUD with Blur-to-Sharp Scroll Scrub */}
              <div className="cta-hud-card lg:col-span-5 p-5 rounded-2xl bg-[#1A1A1A] border border-neutral-800 space-y-3 will-change-[transform,filter,opacity]">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <span className="font-mono text-xs text-neutral-400">Recent price quotes</span>
                  <span className="font-mono text-[10px] text-neutral-500">Updated daily</span>
                </div>

                <div className="space-y-2">
                  {[
                    { code: 'DEL → BOM', fare: '₹6,840', surge: '+4.8%', carrier: 'IndiGo 6E' },
                    { code: 'BLR → DEL', fare: '₹7,920', surge: '+8.2%', carrier: 'Air India AI' },
                    { code: 'BOM → GOI', fare: '₹4,250', surge: '+12.4%', carrier: 'Akasa QP' },
                  ].map((route, i) => (
                    <div 
                      key={i} 
                      className="p-3 rounded-lg bg-[#222222] border border-neutral-800/80 flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <span className="font-mono text-xs text-white block">{route.code}</span>
                        <span className="text-[11px] text-neutral-400 block">{route.carrier}</span>
                      </div>
                      <div className="text-right space-y-0.5 font-mono">
                        <span className="text-xs font-medium text-white block">{route.fare}</span>
                        <span className="text-[10px] text-[#60A5FA]">{route.surge}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 text-right">
                  <button 
                    type="button"
                    onClick={onLaunchDashboard}
                    className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1 font-mono"
                  >
                    <span>View all routes</span>
                    <ArrowUpRight className="w-3 h-3 text-[#3171C6]" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 p-2.5 rounded-full bg-white hover:bg-neutral-100 text-[#111111] border border-[#E5E5E5] shadow-sm transition-all duration-200 cursor-pointer"
          aria-label="Back to Top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}