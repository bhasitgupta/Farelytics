import React from 'react';
import { ADVANCE_HORIZONS } from '../constants/carriers';

export default function HorizonFilter({ selectedHorizon, onSelectHorizon }) {
  return (
    <div className="inline-flex rounded-xl bg-white/5 p-1 border border-white/10">
      <button
        onClick={() => onSelectHorizon('ALL')}
        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
          selectedHorizon === 'ALL'
            ? 'bg-white/20 text-white shadow-sm'
            : 'text-white/60 hover:text-white'
        }`}
      >
        All Windows
      </button>
      {ADVANCE_HORIZONS.map(h => (
        <button
          key={h}
          onClick={() => onSelectHorizon(h)}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
            selectedHorizon === h
              ? 'bg-white/20 text-white shadow-sm'
              : 'text-white/60 hover:text-white'
          }`}
        >
          T+{h}d
        </button>
      ))}
    </div>
  );
}
