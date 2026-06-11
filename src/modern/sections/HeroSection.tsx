import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, type RefObject } from "react";
import { V2Button } from "@/modern/components/V2Button";
import { SECTION_IDS } from "@/modern/constants/sections";
import { useHeroDevBgSwipe } from "@/modern/hooks/useHeroDevBgSwipe";
import { useSectionNav } from "@/modern/hooks/useSectionNav";
import { useReducedMotion } from "@/modern/hooks/useReducedMotion";
import { SectionShell } from "@/modern/components/SectionShell";
import styles from "./HeroSection.module.css";

gsap.registerPlugin(ScrollTrigger);

export function HeroSection() {
  const { scrollToSection } = useSectionNav();
  const reducedMotion = useReducedMotion();
  const { photo: heroBgPhoto, onTouchStart, onTouchEnd } = useHeroDevBgSwipe();
  const rootRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLImageElement>(null);

  useGSAP(
    () => {
      if (reducedMotion || !rootRef.current) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from("[data-hero-item]", {
        opacity: 0,
        y: 40,
        duration: 0.9,
        stagger: 0.12,
      });

      if (bgRef.current) {
        gsap.to(bgRef.current, {
          yPercent: 12,
          ease: "none",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    },
    { scope: rootRef, dependencies: [reducedMotion] },
  );

  return (
    <SectionShell id={SECTION_IDS.hero} fullBleed>
      <div
        ref={rootRef as RefObject<HTMLDivElement>}
        className={styles.hero}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className={styles.bg} aria-hidden="true">
          <img
            ref={bgRef}
            src={heroBgPhoto}
            alt=""
            className={styles.bgImage}
          />
          <div className={styles.overlay} />
        </div>

        <div className={styles.content}>
          <p className={styles.eyebrow} data-hero-item>
            Беларусь · байдарки · природа
          </p>
          <h1 className={styles.title} data-hero-item>
            Сплавы, которые запомнятся
          </h1>
          <p className={styles.subtitle} data-hero-item>
            Сборные и корпоративные маршруты для новичков и семей. Инструктаж,
            комфорт на воде и тёплый финиш с чаем на берегу.
          </p>
          <div className={styles.actions} data-hero-item>
            <V2Button
              variant="primary"
              onDark
              waterAlways
              onClick={() => scrollToSection(SECTION_IDS.schedule)}
            >
              Выбрать сплав
            </V2Button>
            <V2Button
              variant="secondary"
              onDark
              onClick={() => scrollToSection(SECTION_IDS.routes)}
            >
              Смотреть маршруты
            </V2Button>
          </div>
          <div className={styles.stats} data-hero-item>
            <div className={styles.stat}>
              <strong>10+ лет</strong>
              <span>опыта на воде</span>
            </div>
            <div className={styles.stat}>
              <strong>Новичкам</strong>
              <span>безопасные маршруты</span>
            </div>
            <div className={styles.stat}>
              <strong>Семьям</strong>
              <span>2- и 3-местные байдарки</span>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
