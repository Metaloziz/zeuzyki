import { Link } from "react-router-dom";
import {
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  PHONE_DISPLAY,
  PHONE_HREF,
  TELEGRAM_HANDLE,
  TELEGRAM_URL,
} from "@/constants/contacts";
import { NAV_ITEMS, ROUTES } from "@/constants/routes";
import { SocialLinks } from "@/components/SocialLinks";
import styles from "./Footer.module.css";

const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandBlock}>
          <Link
            to={ROUTES.HOME}
            className={styles.brand}
            aria-label="ЖЭЎЖЫКІ — главная"
          >
            ЖЭЎЖЫКІ
          </Link>
          <p className={styles.tagline}>
            Байдарочные сплавы по живописным рекам Беларуси для новичков,
            компаний и корпоративных команд.
          </p>
          <SocialLinks
            className={styles.socials}
            linkClassName={styles.social}
            iconClassName={styles.socialIcon}
          />
        </div>

        <nav className={styles.navBlock} aria-label="Навигация в футере">
          <h2 className={styles.blockTitle}>Разделы</h2>
          {NAV_ITEMS.map((item) => (
            <Link key={item.to} to={item.to} className={styles.link}>
              {item.label}
            </Link>
          ))}
        </nav>

        <address className={styles.contactBlock}>
          <h2 className={styles.blockTitle}>Связаться</h2>
          <a href={PHONE_HREF} className={styles.link}>
            Телефон: {PHONE_DISPLAY}
          </a>
          <a href={TELEGRAM_URL} className={styles.link}>
            Telegram: {TELEGRAM_HANDLE}
          </a>
          <a href={INSTAGRAM_URL} className={styles.link}>
            Instagram: {INSTAGRAM_HANDLE}
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
