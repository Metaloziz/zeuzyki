import { Link } from "react-router-dom";
import styles from "./Header.module.css";

function InstagramIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand} aria-label="Zeuzyki — главная">
          Zeuzyki
        </Link>
        <div className={styles.right}>
          <nav className={styles.nav} aria-label="Основная навигация">
            <Link to="/#schedule" className={styles.navLink}>
              Расписание сплавов
            </Link>
            <Link to="/corporate" className={styles.navLink}>
              Корпоративные сплавы
            </Link>
            <Link to="/faq" className={styles.navLink}>
              Популярные вопросы
            </Link>
            <Link to="/about" className={styles.navLink}>
              Про нас
            </Link>
          </nav>
          <a
            href="https://www.instagram.com/zeuzyki/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.social}
            aria-label="Zeuzyki в Instagram"
            title="Мы в Instagram"
          >
            <InstagramIcon />
          </a>
        </div>
      </div>
    </header>
  );
}
