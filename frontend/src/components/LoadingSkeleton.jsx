import React from 'react';

export default function LoadingSkeleton({ className = 'h-6 w-full' }) {
  return (
    <div className={`animate-pulse bg-white/5 rounded-xl border border-white/5 ${className}`} />
  );
}
