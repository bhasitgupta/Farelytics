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