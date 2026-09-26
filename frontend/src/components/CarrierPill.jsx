import React from 'react';
import { AIRLINE_METADATA } from '../constants/carriers';

export default function CarrierPill({ code, showName = true }) {
  const meta = AIRLINE_METADATA[code] || { name: code, color: '#6b7280' };

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-white/90">
      <span
        className="w-2 h-2 rounded-full inline-block"
        style={{ backgroundColor: meta.color }}
      />
      <span>{code}</span>
      {showName && meta.name !== code && (
        <span className="text-white/50 text-[11px]">({meta.name})</span>
      )}
    </span>
  );
}
