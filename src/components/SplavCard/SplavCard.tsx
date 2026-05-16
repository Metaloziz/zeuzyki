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

export function SplavCard({ splav, index, onBook }: SplavCardProps) {
  // Циклический индекс градиента — пока нет фото
  const variantClass = styles[`gradient${(index % 4) + 1}`];

  return (
    <article className={styles.card}>
      <div className={`${styles.image} ${variantClass}`} aria-hidden="true" />
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
