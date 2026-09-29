import barba from '@barba/core';
import gsap from 'gsap';

let isTransitioning = false;

/**
 * Cinematic Barba.js View Transition
 * Executes a film-grade dual-layer shutter wipe with camera push-in / pull-out
 * and updates React state precisely when the screen is fully masked.
 * 
 * @param {Function} onMidpoint - Callback invoked when the screen is fully covered to update state
 * @param {string} [label] - Text label displayed on the cinematic transit badge
 */
export function executeTransition(onMidpoint, label = 'FARELYTICS · Analytical Dispatch') {
  if (isTransitioning) {
    if (onMidpoint) onMidpoint();
    return;
  }

  const curtain = document.getElementById('barba-curtain');
  const shimmer = document.getElementById('barba-shimmer');
  const textEl = document.getElementById('barba-curtain-text');
  const container = document.querySelector('[data-barba="container"]');

  if (!curtain) {
    if (onMidpoint) onMidpoint();
    return;
  }

  isTransitioning = true;
  if (textEl && label) {
    textEl.textContent = label;
  }

  const tl = gsap.timeline({
    defaults: { ease: 'power4.inOut' },
    onComplete: () => {
      isTransitioning = false;
      gsap.set(curtain, { y: '100%' });
      if (shimmer) gsap.set(shimmer, { opacity: 0 });
      if (textEl) gsap.set(textEl, { opacity: 0 });
      if (container) gsap.set(container, { clearProps: 'transform,opacity' });
    }
  });

  // Outgoing camera pull-out (subtle scale back and fade)
  if (container) {
    tl.to(container, {
      scale: 0.98,
      y: -15,
      opacity: 0.4,
      duration: 0.3,
      ease: 'power3.in'
    }, 0);
  }

  // Dual-layer shutter slide in from bottom
  tl.set(curtain, { y: '100%', pointerEvents: 'auto' }, 0)
    .to(curtain, {
      y: '0%',
      duration: 0.42,
      ease: 'power4.inOut'
    }, 0)
    .to(shimmer, {
      opacity: 1,
      duration: 0.2
    }, 0.2)
    .to(textEl, {
      opacity: 1,
      scale: 1,
      duration: 0.2
    }, 0.25)
    .add(() => {
      // Execute React state change at absolute midpoint
      if (onMidpoint) {
        onMidpoint();
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
    })
    // Incoming camera push-in
    .to(textEl, {
      opacity: 0,
      scale: 0.96,
      duration: 0.2,
      delay: 0.08
    })
    .to(curtain, {
      y: '-100%',
      duration: 0.42,
      ease: 'power4.inOut',
      pointerEvents: 'none'
    })
    .add(() => {
      const newContainer = document.querySelector('[data-barba="container"]');
      if (newContainer) {
        gsap.fromTo(newContainer, 
          { scale: 1.02, y: 20, opacity: 0 },
          { scale: 1.0, y: 0, opacity: 1, duration: 0.4, ease: 'power3.out' }
        );
      }
    }, '-=0.2');
}

/**
 * Kinematic Film-Grade Smooth Scroll
 * Glides the camera smoothly to any section using an authentic power4.inOut velocity curve.
 * 
 * @param {string} targetId - Element ID to scroll to (e.g. 'problem', 'how-it-works')
 * @param {number} offset - Y offset in pixels (default: 76 for header clearance)
 */
export function smoothScrollTo(targetId, offset = 76) {
  if (typeof window === 'undefined') return;

  const el = document.getElementById(targetId);
  if (!el) return;

  const targetY = el.getBoundingClientRect().top + window.pageYOffset - offset;

  // Kinematic tween to window scroll
  const scrollObj = { y: window.pageYOffset };
  gsap.to(scrollObj, {
    y: targetY,