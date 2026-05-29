import { Link } from "react-router-dom";
import styles from "./Header.module.css";

const telegramIcon = new URL(
  "../../../assets/telegram-icon.svg",
  import.meta.url,
).href;

const instagramIcon = new URL(
  "../../../assets/instagramm-icon.png",
  import.meta.url,
).href;

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
          <div className={styles.socials}>
            <a
              href="https://t.me/zeuzyki_admin"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.social}
              aria-label="Zeuzyki в Telegram"
              title="@zeuzyki_admin"
            >
              <img
                src={telegramIcon}
                alt=""
                aria-hidden="true"
                className={styles.socialIcon}
              />
            </a>
            <a
              href="https://www.instagram.com/zeuzyki/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.social}
              aria-label="Zeuzyki в Instagram"
              title="Мы в Instagram"
            >
              <img
                src={instagramIcon}
                alt=""
                aria-hidden="true"
                className={styles.socialIcon}
              />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
