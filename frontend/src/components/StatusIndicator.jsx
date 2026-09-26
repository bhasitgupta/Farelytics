import React from 'react';

export default function StatusIndicator({ status = 'online', label }) {
  const isOnline = status === 'online';

  return (
    <div className="inline-flex items-center gap-2">
      <span className="relative flex h-2 w-2">
        {isOnline && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isOnline ? 'bg-emerald-500' : 'bg-rose-500'
          }`}
        />
      </span>
      {label && <span className="text-xs text-white/60 font-medium">{label}</span>}
    </div>
  );
}
