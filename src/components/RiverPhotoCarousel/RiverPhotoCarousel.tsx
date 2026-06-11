import { useMemo, useState, type PointerEvent } from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import {
  corporateHeroPhoto,
  getRoutePhotosByRiverId,
} from "@/utils/routePhotos";
import { isCorporateRiverId, isCorporateRiverName } from "@/utils/splav";
import styles from "./RiverPhotoCarousel.module.css";

const MIN_SWIPE_DISTANCE = 44;

function getRiverCarouselPhotos(
  riverId: string | number,
  riverName: string,
): string[] {
  const routePhotos = getRoutePhotosByRiverId(riverId, riverName);
  const isCorporate =
    isCorporateRiverId(riverId) || isCorporateRiverName(riverName);

  if (!isCorporate) {
    return routePhotos;
  }

  if (routePhotos.length === 0) return [corporateHeroPhoto];

  return [corporateHeroPhoto, ...routePhotos.slice(1)];
}

interface RiverPhotoCarouselProps {
  riverId: string | number;
  riverName: string;
  variant?: "default" | "riverCard";
}

export function RiverPhotoCarousel({
  riverId,
  riverName,
  variant = "default",
}: RiverPhotoCarouselProps) {
  const photos = useMemo(
    () => getRiverCarouselPhotos(riverId, riverName),
    [riverId, riverName],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragStartX, setDragStartX] = useState<number | null>(null);

  const showSlide = (index: number) => {
    setActiveIndex((index + photos.length) % photos.length);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    setDragStartX(event.clientX);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStartX === null) return;

    const distance = event.clientX - dragStartX;
    setDragStartX(null);

    if (Math.abs(distance) < MIN_SWIPE_DISTANCE) return;
    showSlide(activeIndex + (distance < 0 ? 1 : -1));
  };

  if (photos.length === 0) return null;

  return (
    <div
      className={`${styles.carousel} ${
        variant === "riverCard" ? styles.riverCardVariant : ""
      }`}
      aria-label={`Фотографии маршрута ${riverName}`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => setDragStartX(null)}
    >
      <div
        className={styles.track}
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {photos.map((photo, index) => (
          <div
            key={photo}
            className={styles.slide}
            aria-hidden={activeIndex !== index}
          >
            <img
              src={photo}
              alt={`Пейзаж маршрута ${riverName}, фото ${index + 1}`}
              className={styles.slideImage}
              loading={index === 0 ? "eager" : "lazy"}
              draggable={false}
            />
          </div>
        ))}
      </div>

      {photos.length > 1 && (
        <>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonPrev}`}
            onClick={() => showSlide(activeIndex - 1)}
            aria-label="Предыдущее фото"
          >
            <IconChevronLeft size={20} stroke={2.4} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonNext}`}
            onClick={() => showSlide(activeIndex + 1)}
            aria-label="Следующее фото"
          >
            <IconChevronRight size={20} stroke={2.4} aria-hidden="true" />
          </button>

          <div className={styles.dots} aria-hidden="true">
            {photos.map((photo, index) => (
              <span
                key={photo}
                className={`${styles.dot} ${
                  activeIndex === index ? styles.dotActive : ""
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
