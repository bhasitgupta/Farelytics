"use client";

import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ScrollFlyInProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  imageUrl: string;
  imageAlt?: string;
}

const ScrollFlyIn = React.forwardRef<HTMLDivElement, ScrollFlyInProps>(
  ({ children, imageUrl, imageAlt = "Animated aircraft flying across screen", className, ...props }, ref) => {
    const localRef = React.useRef<HTMLDivElement>(null);
    const targetRef = (ref as React.RefObject<HTMLDivElement>) || localRef;
    const [screenWidth, setScreenWidth] = React.useState(
      typeof window !== "undefined" ? window.innerWidth : 1200
    );

    React.useEffect(() => {
      const handleResize = () => setScreenWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    const { scrollYProgress } = useScroll({
      target: targetRef,
      offset: ["start start", "end end"],
    });

    // Realistic flight path: start just off left screen edge, bank across hero, exit off right edge
    const startX = -Math.max(screenWidth * 0.55, 750);
    const endX = screenWidth + 200;

    const x = useTransform(
      scrollYProgress, 
      [0.02, 0.84], 
      [`${startX}px`, `${endX}px`]
    );
    
    // Dynamic altitude tilt & rotation as it banks across
    const rotate = useTransform(scrollYProgress, [0.05, 0.42, 0.84], [-14, -2, 9]);
    const scale = useTransform(scrollYProgress, [0.05, 0.42, 0.84], [0.88, 1.15, 0.95]);
    const opacity = useTransform(scrollYProgress, [0.02, 0.12, 0.74, 0.84], [0, 1, 1, 0]);

    // Text content depth fade as plane finishes and next section approaches
    const contentOpacity = useTransform(scrollYProgress, [0.75, 0.98], [1, 0.25]);
    const contentScale = useTransform(scrollYProgress, [0.75, 0.98], [1, 0.96]);
    const contentY = useTransform(scrollYProgress, [0.75, 0.98], [0, -25]);

    return (
      <div ref={targetRef} className={cn("relative h-[160vh]", className)} {...props}>
        {/* Sticky container stays pinned to viewport for the scroll duration without horizontal bleed */}
        <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
          {/* Main Hero Content */}
          <motion.div 
            style={{ opacity: contentOpacity, scale: contentScale, y: contentY }} 
            className="z-10 text-center w-full max-w-[1120px] mx-auto px-6 sm:px-8 will-change-transform"
          >
            {children}
          </motion.div>

          {/* Animated Aircraft (Plane) */}
          <motion.div 
            style={{ x, rotate, scale, opacity }} 
            className="absolute top-0 left-0 z-20 flex h-full w-full items-center pointer-events-none will-change-transform"
          >
            <img
              src={imageUrl}
              alt={imageAlt}
              className="w-auto h-auto max-w-[650px] sm:max-w-[850px] select-none filter drop-shadow-[0_25px_35px_rgba(0,0,0,0.35)]"
              onError={(e) => {
                e.currentTarget.src = "https://cdn.21st.dev/assets/mirror/1f/1fc1cc87bf58406056e825358749e9cd26c0b98170fd8b786dccf0b71f8192c6.svg";
              }}
            />
          </motion.div>
        </div>
      </div>
    );
  }
);

ScrollFlyIn.displayName = "ScrollFlyIn";

export { ScrollFlyIn };