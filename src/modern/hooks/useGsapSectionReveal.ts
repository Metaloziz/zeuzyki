import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { useReducedMotion } from "./useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

interface UseGsapSectionRevealOptions {
  stagger?: number;
  y?: number;
}

export function useGsapSectionReveal<T extends HTMLElement>(
  options: UseGsapSectionRevealOptions = {},
) {
  const ref = useRef<T>(null);
  const reducedMotion = useReducedMotion();
  const { stagger = 0.08, y = 48 } = options;

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || reducedMotion) return;

      const items = root.querySelectorAll("[data-reveal]");
      if (items.length === 0) return;

      gsap.set(items, { opacity: 0, y });

      ScrollTrigger.batch(items, {
        start: "top 85%",
        onEnter: (batch) => {
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger,
            ease: "power3.out",
            overwrite: true,
          });
        },
        once: true,
      });
    },
    { scope: ref, dependencies: [reducedMotion, stagger, y] },
  );

  return ref;
}
