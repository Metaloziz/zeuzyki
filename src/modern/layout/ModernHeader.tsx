import { useEffect, useState } from "react";
import { LogoMark } from "@/components/Header/LogoMark";
import { SocialLinks } from "@/components/SocialLinks";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MODERN_NAV_ITEMS, SECTION_IDS } from "@/modern/constants/sections";
import { useSectionNav } from "@/modern/hooks/useSectionNav";
import styles from "./ModernHeader.module.css";

export function ModernHeader() {
  const { activeSection, scrollToSection } = useSectionNav();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const onHero = activeSection === SECTION_IDS.hero;
  const heroNav = onHero && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (id: (typeof MODERN_NAV_ITEMS)[number]["id"]) => {
    scrollToSection(id);
    setMenuOpen(false);
  };

  const iconButtonClass = heroNav ? styles.iconButtonHero : "";

  return (
    <header
      className={`${styles.header} ${scrolled ? styles.scrolled : ""} ${
        heroNav ? styles.heroNav : ""
      }`}
    >
      <div className={styles.inner}>
        <button
          type="button"
          className={`${styles.brand} ${heroNav ? styles.heroBrand : ""}`}
          onClick={() => scrollToSection(SECTION_IDS.hero)}
          aria-label="ЖЭЎЖЫКІ — на главную"
        >
          <LogoMark />
          <span>ЖЭЎЖЫКІ</span>
        </button>

        <nav className={styles.nav} aria-label="Основная навигация">
          {MODERN_NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.navLink} ${
                activeSection === item.id ? styles.navLinkActive : ""
              }`}
              onClick={() => handleNav(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className={styles.actions}>
          <SocialLinks
            className={styles.socials}
            linkClassName={`${styles.social} ${iconButtonClass}`}
            iconClassName={styles.socialIcon}
          />
          <ThemeToggle
            className={`${styles.themeButton} ${iconButtonClass}`}
          />
          <button
            type="button"
            className={`${styles.menuButton} ${iconButtonClass}`}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          {MODERN_NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.navLink} ${
                activeSection === item.id ? styles.navLinkActive : ""
              }`}
              onClick={() => handleNav(item.id)}
            >
              {item.label}
            </button>
          ))}
          <div className={styles.mobileActions}>
            <SocialLinks
              className={styles.socials}
              linkClassName={styles.social}
              iconClassName={styles.socialIcon}
            />
            <ThemeToggle className={styles.themeButton} />
          </div>
        </div>
      )}
    </header>
  );
}
