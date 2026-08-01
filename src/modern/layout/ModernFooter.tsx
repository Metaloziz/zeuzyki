import { FooterContacts } from "@/components/ContactInfoRow";
import { DesignDevPanel } from "@/components/DesignDevPanel";
import { SocialLinks } from "@/components/SocialLinks";
import { MODERN_NAV_ITEMS, SECTION_IDS } from "@/modern/constants/sections";
import { useSectionNav } from "@/modern/hooks/useSectionNav";
import { SectionShell } from "@/modern/components/SectionShell";
import styles from "./ModernFooter.module.css";

const currentYear = new Date().getFullYear();

export function ModernFooter() {
  const { scrollToSection } = useSectionNav();

  return (
    <SectionShell id={SECTION_IDS.contacts} dark className={styles.footer}>
      <div className={styles.inner}>
        <div>
          <p className={styles.brand}>ЖЭЎЖЫКІ</p>
          <p className={styles.tagline}>
            Байдарочные сплавы из Минска по рекам Беларуси для новичков,
            компаний и корпоративных команд.
          </p>
          <SocialLinks
            className={styles.socials}
            linkClassName={styles.social}
            iconClassName={styles.socialIcon}
          />
        </div>

        <nav aria-label="Навигация в футере">
          <h2 className={styles.blockTitle}>Разделы</h2>
          {MODERN_NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={styles.navButton}
              onClick={() => scrollToSection(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <address>
          <h2 className={styles.blockTitle}>Связаться</h2>
          <FooterContacts linkClassName={styles.link} />
        </address>
      </div>

      <div className={styles.bottom}>
        <DesignDevPanel year={currentYear} />
        <span>Байдарки Минск · сплавы ЖЭЎЖЫКІ</span>
      </div>
    </SectionShell>
  );
}
