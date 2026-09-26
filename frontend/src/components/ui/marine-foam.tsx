import React from "react";

// GradientBackground — Adapted for Farelytics Brand System & 21st.dev Gradient Builder
// Includes dual-pass SVG procedural grain, container queries (cqmin), and Farelytics palette.
// Palette options:
// - 'hero': Luminous radiant warm core with Aerospace Flame Orange (#F25623) & atmospheric slate (#203138)
// - 'brand': Deep Obsidian (#171717) into Aerospace Orange (#F25623)
// - 'brand-light': Subtle tactile editorial cream with warm orange tint
// - 'marine': Original 21st.dev Marine Foam recipe (#0F5C63 -> #EAF7F2)

export interface GradientBackgroundProps {
  className?: string;
  variant?: 'hero' | 'brand' | 'brand-light' | 'marine';
  grainOpacity?: number;
}

const GRADIENT_RECIPES = {
  hero: {
    bg: "#F25623",
    gradient: "radial-gradient(ellipse 95% 85% at 38% 44%, #FFF0E8 0%, #FFA882 22%, #F25623 48%, #D44211 70%, #203138 100%)",
  },
  brand: {
    bg: "#171717",
    gradient: "linear-gradient(145deg, #171717 0%, #28211E 35%, #943414 70%, #F25623 100%)",
  },
  'brand-light': {
    bg: "#FAFAFA",
    gradient: "linear-gradient(145deg, #FFFFFF 0%, #F5F5F5 45%, #FDEEE7 80%, #FED9C9 100%)",
  },
  marine: {
    bg: "#0F5C63",
    gradient: "linear-gradient(145deg, #0F5C63 0%, #3F9EA8 33%, #A9E2D9 67%, #EAF7F2 100%)",
  },
};

export function GradientBackground({ 
  className = "", 
  variant = 'hero',
  grainOpacity = 0.08,
  style = {}
}: GradientBackgroundProps & { style?: React.CSSProperties }) {
  const recipe = GRADIENT_RECIPES[variant] || GRADIENT_RECIPES.hero;

  // RFC 2397 compliant URL-encoded SVG grain pattern for fail-safe rendering across all engines
  const svgGrainUri = `data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='140'%20height='140'%3E%3Cfilter%20id='noise'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.85'%20numOctaves='3'%20stitchTiles='stitch'/%3E%3C/filter%3E%3Crect%20width='100%25'%20height='100%25'%20filter='url(%23noise)'%20opacity='${grainOpacity}'/%3E%3C/svg%3E`;

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0 ${className}`}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
        ...style,
      }}
    >
      {/* 1. Base Gradient Fill (Guaranteed to render under all circumstances) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          backgroundColor: recipe.bg,
          backgroundImage: recipe.gradient,
        }}
      />

      {/* 2. Soften Blur Pass */}
      <div
        style={{
          position: "absolute",
          inset: "-12px",
          width: "calc(100% + 24px)",
          height: "calc(100% + 24px)",
          backgroundImage: recipe.gradient,
          filter: "blur(8px)",
          opacity: 0.85,
        }}
      />

      {/* 3. Embedded Data URI Grain Tile */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url("${svgGrainUri}")`,
          backgroundSize: "140px 140px",
          mixBlendMode: "overlay",
          opacity: 0.95,
        }}
      />

      {/* 4. Procedural Full-Surface SVG Grain Overlay */}
      <svg
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: grainOpacity,
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }}
      >
        <filter id="grain-procedural">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-procedural)" />
      </svg>
    </div>
  );
}

export default GradientBackground;
