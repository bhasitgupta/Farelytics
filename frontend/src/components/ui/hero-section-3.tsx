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