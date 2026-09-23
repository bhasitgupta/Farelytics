import React, { useEffect, useState, useRef } from 'react';

/**
 * AnimatedNumber
 * Smoothly interpolates numerical values using requestAnimationFrame with easeOutCubic.
 * Preserves decimal precision, comma separation, prefixes, and suffixes.
 * Zero layout shift via tabular-nums.
 */
export default function AnimatedNumber({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 750,
  className = '',
  fromValue = null
}) {
  const [displayValue, setDisplayValue] = useState(() => (fromValue !== null ? fromValue : value));
  const prevValueRef = useRef(fromValue !== null ? fromValue : value);
  const startTimeRef = useRef(null);
  const rafIdRef = useRef(null);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayValue(value);
      prevValueRef.current = value;
      return;
    }

    const startValue = prevValueRef.current ?? value;
    const endValue = value;
    prevValueRef.current = value;

    if (startValue === endValue) {
      setDisplayValue(endValue);
      return;
    }

    startTimeRef.current = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutCubic: velvety smooth deceleration
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * ease;

      setDisplayValue(current);

      if (progress < 1) {
        rafIdRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
      }
    };

    rafIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [value, duration]);

  // Format with commas and exact decimals (Indian locale for ₹)
  const formatted = Number(displayValue).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  return (
    <span className={`tabular-nums inline-block font-feature-settings-tnum ${className}`}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
