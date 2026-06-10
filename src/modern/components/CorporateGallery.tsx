import { useCallback, useEffect, useRef, useState } from "react";
import { CORPORATE_GALLERY } from "@/data/corporate";
import { corporateHeroPhoto } from "@/utils/routePhotos";
import { useReducedMotion } from "@/modern/hooks/useReducedMotion";
import styles from "./CorporateGallery.module.css";

const GALLERY_ITEMS = [
  { src: corporateHeroPhoto, alt: "Корпоративный сплав на реке" },
  ...CORPORATE_GALLERY.slice(0, 4).map((photo) => ({
    src: photo.src,
    alt: photo.alt,
  })),
];

const RESUME_DELAY_MS = 3000;

export function CorporateGallery() {
  const reducedMotion = useReducedMotion();
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [paused, setPaused] = useState(false);
  const [interactive, setInteractive] = useState(reducedMotion);

  const scheduleResume = useCallback(() => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
    }
    resumeTimerRef.current = setTimeout(() => {
      if (!reducedMotion) {
        setPaused(false);
        setInteractive(false);
      }
    }, RESUME_DELAY_MS);
  }, [reducedMotion]);

  const handleInteraction = useCallback(() => {
    setPaused(true);
    setInteractive(true);
    scheduleResume();
  }, [scheduleResume]);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setInteractive(true);
      setPaused(true);
    }
  }, [reducedMotion]);

  const duplicated = [...GALLERY_ITEMS, ...GALLERY_ITEMS];

  return (
    <div
      className={`${styles.viewport} ${interactive ? styles.interactive : ""}`}
      onPointerDown={handleInteraction}
      onTouchStart={handleInteraction}
      onWheel={handleInteraction}
      data-reveal
    >
      <div
        className={`${styles.track} ${paused ? styles.paused : ""} ${
          interactive ? styles.manual : ""
        }`}
      >
        {duplicated.map((photo, index) => (
          <figure key={`${photo.src}-${index}`} className={styles.item}>
            <img
              src={photo.src}
              alt={index < GALLERY_ITEMS.length ? photo.alt : ""}
              loading="lazy"
              draggable={false}
            />
          </figure>
        ))}
      </div>
    </div>
  );
}
