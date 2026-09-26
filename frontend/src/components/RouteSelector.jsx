import React from 'react';
import { MONITORED_ROUTES } from '../constants/routes';

export default function RouteSelector({ selectedRoute, onSelectRoute }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelectRoute('ALL')}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
          selectedRoute === 'ALL'
            ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
            : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'
        }`}
      >
        All Sectors
      </button>
      {MONITORED_ROUTES.map(route => (
        <button
          key={route.code}
          onClick={() => onSelectRoute(route.code)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            selectedRoute === route.code
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'
          }`}
        >
          {route.code}
        </button>
      ))}
    </div>
  );
}
