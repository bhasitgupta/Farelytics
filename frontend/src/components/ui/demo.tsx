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
          <p className="text-xs font-semibold uppercase tracking-widest text-[#888888]">
            Welcome to Farelytics
          </p>
          <h2 className="text-4xl md:text-6xl font-medium tracking-tight leading-tight mt-2 text-[#111111]">
            Where journeys become transparent
          </h2>
        </div>
      </ScrollFlyIn>
    </div>
  );
}
