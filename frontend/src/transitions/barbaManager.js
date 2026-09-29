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