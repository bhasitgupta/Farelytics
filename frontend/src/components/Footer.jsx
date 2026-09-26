import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 py-8 px-4 text-center text-xs text-white/50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white/80">Farelytics</span>
          <span>•</span>
          <span>CPI Augmentation Engine</span>
        </div>
        <div className="flex items-center gap-4 text-white/60">
          <a href="https://farelytics.vercel.app" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
            Live Deployment
          </a>
          <a href="https://github.com/bhasitgupta/SIH26056" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
            GitHub Repository
          </a>
        </div>
        <div>
          <span>© 2026 Farelytics. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
