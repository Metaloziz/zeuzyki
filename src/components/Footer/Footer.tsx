import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

const telegramIcon = new URL(
  "../../../assets/telegram-icon.svg",
  import.meta.url,
).href;

const instagramIcon = new URL(
  "../../../assets/instagramm-icon.png",
  import.meta.url,
).href;

const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandBlock}>
          <Link to="/" className={styles.brand} aria-label="ЖЭЎЖЫКІ — главная">
            ЖЭЎЖЫКІ
          </Link>
          <p className={styles.tagline}>
            Байдарочные сплавы по живописным рекам Беларуси для новичков,
            компаний и корпоративных команд.
          </p>
          <div className={styles.socials} aria-label="Социальные сети">
            <a
              href="https://t.me/zeuzyki_admin"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.social}
              aria-label="ЖЭЎЖЫКІ в Telegram"
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
              aria-label="ЖЭЎЖЫКІ в Instagram"
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

        <nav className={styles.navBlock} aria-label="Навигация в футере">
          <h2 className={styles.blockTitle}>Разделы</h2>
          <Link to="/#schedule" className={styles.link}>
            Расписание сплавов
          </Link>
          <Link to="/corporate" className={styles.link}>
            Корпоративные сплавы
          </Link>
          <Link to="/faq" className={styles.link}>
            Популярные вопросы
          </Link>
          <Link to="/about" className={styles.link}>
            Про нас
          </Link>
        </nav>

        <address className={styles.contactBlock}>
          <h2 className={styles.blockTitle}>Связаться</h2>
          <a href="tel:+375296826327" className={styles.link}>
            Телефон: +375 (29) 682-63-27
          </a>
          <a href="https://t.me/zeuzyki_admin" className={styles.link}>
            Telegram: @zeuzyki_admin
          </a>
          <a href="https://www.instagram.com/zeuzyki/" className={styles.link}>
            Instagram: @zeuzyki
          </a>
          <span className={styles.muted}>Ответим, подберём реку и дату.</span>
        </address>
      </div>

      <div className={styles.bottom}>
        <span>© {currentYear} ЖЭЎЖЫКІ</span>
        <span>Сплавы на байдарках в Беларуси</span>
      </div>
    </footer>
  );
}
