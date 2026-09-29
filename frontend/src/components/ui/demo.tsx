import React from "react";
import { ScrollFlyIn } from "@/components/ui/hero-section-3";

export default function ScrollFlyInDemo() {
  return (
// Refactor progress checkpoint: step 1/4
      <GradientBackground className="h-full w-full" variant="brand" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 pointer-events-none">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#F25623] bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 mb-3">
          Farelytics Grain Surface
        </span>
        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Tactile Noise & Brand Gradient
        </h3>
        <p className="text-xs sm:text-sm text-[#DEDEDE] max-w-md mt-2">
          Procedural SVG turbulence grain with obsidian and aerospace flame gradient.
        </p>
      </div>
    </div>
  );
}