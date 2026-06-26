import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SectionId } from "@/modern/constants/sections";
import { MODERN_NAV_ITEMS, SECTION_IDS } from "@/modern/constants/sections";

interface SectionNavContextValue {
  activeSection: SectionId;
  scrollToSection: (id: SectionId) => void;
}

const SectionNavContext = createContext<SectionNavContextValue | null>(null);

export function SectionNavProvider({ children }: { children: ReactNode }) {
  const [activeSection, setActiveSection] = useState<SectionId>(SECTION_IDS.hero);

  const scrollToSection = useCallback((id: SectionId) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
    window.history.replaceState(null, "", `#${id}`);
  }, []);

  useEffect(() => {
    const ids = MODERN_NAV_ITEMS.map((item) => item.id).concat([
      SECTION_IDS.hero,
    ]);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        const top = visible[0];
        if (top?.target.id) {
          setActiveSection(top.target.id as SectionId);
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "") as SectionId;
    if (!hash) return;

    const timer = window.setTimeout(() => {
      scrollToSection(hash);
    }, 120);

    return () => window.clearTimeout(timer);
  }, [scrollToSection]);

  const value = useMemo(
    () => ({ activeSection, scrollToSection }),
    [activeSection, scrollToSection],
  );

  return (
    <SectionNavContext.Provider value={value}>
      {children}
    </SectionNavContext.Provider>
  );
}

export function useSectionNav(): SectionNavContextValue {
  const ctx = useContext(SectionNavContext);
  if (!ctx) {
    throw new Error("useSectionNav must be used within SectionNavProvider");
  }
  return ctx;
}
