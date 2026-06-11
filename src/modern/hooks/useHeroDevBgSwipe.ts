import {
  useEffect,
  useMemo,
  useState,
  type RefObject,
} from "react";
import {
  corporateHeroPhoto,
  getHeroDevBackgroundPhotos,
} from "@/utils/routePhotos";

const MOBILE_MQ = "(max-width: 720px)";
const MIN_SWIPE_PX = 48;
const LOCK_THRESHOLD_PX = 10;

export function useHeroDevBgSwipe(targetRef: RefObject<HTMLElement | null>) {
  const devPhotos = useMemo(
    () => (import.meta.env.DEV ? getHeroDevBackgroundPhotos() : []),
    [],
  );
  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

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

  useEffect(() => {
    if (!enabled) return;

    const el = targetRef.current;
    if (!el) return;

    let startX = 0;
    let startY = 0;
    let tracking = false;
    let axisLock: "x" | "y" | null = null;

    const reset = () => {
      tracking = false;
      axisLock = null;
    };

    const commitSwipe = (dx: number) => {
      if (Math.abs(dx) < MIN_SWIPE_PX) return;

      setIndex((current) => {
        if (dx < 0) return (current + 1) % devPhotos.length;
        return (current - 1 + devPhotos.length) % devPhotos.length;
      });
    };

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;

      startX = touch.clientX;
      startY = touch.clientY;
      tracking = true;
      axisLock = null;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!tracking) return;

      const touch = event.touches[0];
      if (!touch) return;

      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;

      if (
        axisLock === null &&
        (Math.abs(dx) > LOCK_THRESHOLD_PX || Math.abs(dy) > LOCK_THRESHOLD_PX)
      ) {
        axisLock = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      }

      if (axisLock === "x") {
        event.preventDefault();
      }
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (!tracking) return;

      const touch = event.changedTouches[0];
      const wasHorizontal = axisLock === "x";
      reset();

      if (!touch || !wasHorizontal) return;
      commitSwipe(touch.clientX - startX);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;

      startX = event.clientX;
      startY = event.clientY;
      tracking = true;
      axisLock = null;
      el.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!tracking || event.pointerType === "touch") return;

      const dx = event.clientX - startX;
      const dy = event.clientY - startY;

      if (
        axisLock === null &&
        (Math.abs(dx) > LOCK_THRESHOLD_PX || Math.abs(dy) > LOCK_THRESHOLD_PX)
      ) {
        axisLock = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      }

      if (axisLock === "x") {
        event.preventDefault();
      }
    };

    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      if (!tracking) return;

      const wasHorizontal = axisLock === "x";
      const dx = event.clientX - startX;
      reset();

      if (el.hasPointerCapture(event.pointerId)) {
        el.releasePointerCapture(event.pointerId);
      }

      if (!wasHorizontal) return;
      commitSwipe(dx);
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
    };
  }, [devPhotos.length, enabled, targetRef]);

  return { photo, enabled };
}
