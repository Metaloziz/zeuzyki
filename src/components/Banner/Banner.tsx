import { Link } from "react-router-dom";
import { formatDateRange } from "../../lib/format";
import type { Splav } from "../../types/splav";
import styles from "./Banner.module.css";

export type BannerMode = "light" | "dark";

interface BannerProps {
  splav: Splav;
  mode: BannerMode;
  onBook: () => void;
}

export function Banner({ splav, mode, onBook }: BannerProps) {
  return (
    <section
      className={`${styles.banner} ${mode === "dark" ? styles.dark : styles.light}`}
      aria-label={splav.title}
    >
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.content}>
        <p className={styles.eyebrow}>
          {formatDateRange(splav.startDate, splav.endDate)} ·{" "}
          {splav.durationDays} дня
        </p>

        <h2 className={styles.title}>{splav.title}</h2>

        <p className={styles.subtitle}>{splav.shortDescription}</p>

        <p className={styles.price}>
          От <span className={styles.priceValue}>{splav.price} BYN</span> с
          человека.{" "}
          <span className={styles.seats}>
            Свободно {splav.seatsLeft} из {splav.seatsTotal} мест.
          </span>
        </p>

        <div className={styles.ctas}>
          <button type="button" className={styles.primary} onClick={onBook}>
            Записаться
          </button>
          <Link to={`/splav/${splav.id}`} className={styles.secondary}>
            Подробнее <span aria-hidden="true">›</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
