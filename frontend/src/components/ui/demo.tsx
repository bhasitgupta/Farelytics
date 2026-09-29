import React from "react";
import { ScrollFlyIn } from "@/components/ui/hero-section-3";

export default function ScrollFlyInDemo() {
  return (
    <div className="w-full bg-[#FAFAFA] text-[#111111]">
      <ScrollFlyIn
        imageUrl="https://cdn.21st.dev/assets/mirror/f8/f807350ced7c5e2b79dd250c7de73eebcd402442c40f562e3003c95752a75b5c.webp"
        imageAlt="Top view of airliner flying across the screen"
      >
        <div className="max-w-3xl mx-auto px-4 text-center">
// Refactor progress checkpoint: step 2/4
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