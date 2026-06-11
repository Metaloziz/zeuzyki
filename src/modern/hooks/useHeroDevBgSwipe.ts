import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type TouchEvent,
} from "react";
import {
  corporateHeroPhoto,
  getHeroDevBackgroundPhotos,
} from "@/utils/routePhotos";

const MOBILE_MQ = "(max-width: 720px)";
const MIN_SWIPE_PX = 48;

export function useHeroDevBgSwipe() {
  const devPhotos = useMemo(
    () => (import.meta.env.DEV ? getHeroDevBackgroundPhotos() : []),
    [],
  );
  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const mq = window.matchMedia(MOBILE_MQ);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const enabled = import.meta.env.DEV && isMobile && devPhotos.length > 1;

  const photo = enabled
    ? (devPhotos[index] ?? corporateHeroPhoto)
    : corporateHeroPhoto;

  const onTouchStart = useCallback(
    (e: TouchEvent<HTMLDivElement>) => {
      if (!enabled) return;
      const touch = e.touches[0];
      if (!touch) return;
      swipeStartRef.current = { x: touch.clientX, y: touch.clientY };
    },
    [enabled],
  );

  const onTouchEnd = useCallback(
    (e: TouchEvent<HTMLDivElement>) => {
      if (!enabled) return;

      const start = swipeStartRef.current;
      const touch = e.changedTouches[0];
      if (!touch || !start) return;

      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      swipeStartRef.current = null;

      if (Math.abs(dx) < MIN_SWIPE_PX || Math.abs(dx) < Math.abs(dy)) return;

      setIndex((current) => {
        if (dx < 0) return (current + 1) % devPhotos.length;
        return (current - 1 + devPhotos.length) % devPhotos.length;
      });
    },
    [devPhotos.length, enabled],
  );

  return { photo, onTouchStart, onTouchEnd };
}
