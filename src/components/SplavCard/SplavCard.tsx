import { Link } from "react-router-dom";
import type { Difficulty, Splav } from "../../types/splav";
import styles from "./SplavCard.module.css";

interface SplavCardProps {
  splav: Splav;
  index: number;
  onBook: () => void;
}

const difficultyLabel: Record<Difficulty, string> = {
  начальный: "Для новичков",
  средний: "Для опытных",
  сложный: "Для профи",
};

const riverImageByName: Record<string, string> = {
  вилия: new URL("../../../assets/Вилия.jpg", import.meta.url).href,
  илия: new URL("../../../assets/Илия.jpg", import.meta.url).href,
  нарочь: new URL("../../../assets/Нарочь.jpg", import.meta.url).href,
  узлянка: new URL("../../../assets/Узлянка.jpg", import.meta.url).href,
};

function normalizeRiverName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/^р\.\s*/, "");
}

export function SplavCard({ splav, index, onBook }: SplavCardProps) {
  const variantClass = styles[`gradient${(index % 4) + 1}`];
  const riverImage = riverImageByName[normalizeRiverName(splav.river)];

  return (
    <article className={styles.card}>
      <div
        className={`${styles.image} ${riverImage ? styles.imageWithPhoto : variantClass}`}
        aria-hidden="true"
      >
        {riverImage && (
          <img
            src={riverImage}
            alt={`Река ${splav.river}`}
            className={styles.imagePhoto}
            loading="lazy"
          />
        )}
      </div>
      <div className={styles.content}>
        <p className={styles.eyebrow}>{difficultyLabel[splav.difficulty]}</p>
        <h3 className={styles.title}>{splav.title}</h3>
        <p className={styles.meta}>
          <span className={styles.river}>р. {splav.river}</span>
          <span className={styles.dot} aria-hidden="true">
            ·
          </span>
          <span className={styles.time}>старт в {splav.startTime}</span>
        </p>
        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={onBook}>
            Занять место
          </button>
          <Link to={`/splav/${splav.id}`} className={styles.secondary}>
            Подробнее
          </Link>
        </div>
      </div>
    </article>
  );
}
