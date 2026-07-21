"use client";

import { useReducedMotion } from "motion/react";
import { motionTokens } from "@/lib/motion-config";

/**
 * Hook SSR-safe que retorna initial/animate/exit
 * respeitando prefers-reduced-motion.
 * Desabilita translateY quando reduced motion está ativo.
 */
export function useSafeMotion(fullY: number = motionTokens.distance.md) {
  const reduce = useReducedMotion();

  return {
    initial: { opacity: 0, y: reduce ? 0 : fullY },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reduce ? 0 : -fullY },
  };
}
