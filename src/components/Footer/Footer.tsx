import { Link } from "react-router-dom";
import { NAV_ITEMS, ROUTES } from "@/constants/routes";
import { FooterContacts } from "@/components/ContactInfoRow";
import { DesignDevPanel } from "@/components/DesignDevPanel";
import { SocialLinks } from "@/components/SocialLinks";
import styles from "./Footer.module.css";

const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer id="contacts" className={styles.footer}>
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
          <FooterContacts linkClassName={styles.link} />
          <span className={styles.muted}>Ответим, подберём реку и дату.</span>
        </address>
      </div>

      <div className={styles.bottom}>
        <DesignDevPanel year={currentYear} />
        <span>Сплавы на байдарках в Беларуси</span>
      </div>
    </footer>
  );
}
