import { useEffect, useRef, useState } from "react";
import { useMantineColorScheme } from "@mantine/core";
import { IconMoonStars, IconSunHigh } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { NAV_ITEMS, ROUTES } from "@/constants/routes";
import { SocialLinks } from "@/components/SocialLinks";
import { LogoMark } from "./LogoMark";
import styles from "./Header.module.css";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const headerRef = useRef<HTMLElement | null>(null);
  const isDark = colorScheme === "dark";

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (headerRef.current?.contains(target)) return;
      closeMobileMenu();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isMobileMenuOpen]);

  return (
    <header ref={headerRef} className={styles.header}>
      <div className={styles.inner}>
        <Link
          to={ROUTES.HOME}
          className={styles.brand}
          aria-label="ЖЭЎЖЫКІ — главная"
        >
          <LogoMark />
          <span>ЖЭЎЖЫКІ</span>
        </Link>
        <div className={styles.right}>
          <nav className={styles.nav} aria-label="Основная навигация">
            {NAV_ITEMS.map((item) => (
              <Link key={item.to} to={item.to} className={styles.navLink}>
                {item.label}
              </Link>
            ))}
          </nav>
          <button
            type="button"
            className={styles.themeButton}
            aria-label={
              isDark ? "Включить светлую тему" : "Включить тёмную тему"
            }
            title={isDark ? "Светлая тема" : "Тёмная тема"}
            onClick={() => setColorScheme(isDark ? "light" : "dark")}
          >
            {isDark ? (
              <IconSunHigh size={20} stroke={2.2} aria-hidden="true" />
            ) : (
              <IconMoonStars size={20} stroke={2.2} aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            className={styles.mobileMenuButton}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-main-nav"
            aria-label={
              isMobileMenuOpen ? "Закрыть меню" : "Открыть меню навигации"
            }
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            {isMobileMenuOpen ? "✕" : "☰"}
          </button>
          <SocialLinks
            className={styles.socials}
            linkClassName={styles.social}
            iconClassName={styles.socialIcon}
          />
        </div>
      </div>
      {isMobileMenuOpen && (
        <nav
          id="mobile-main-nav"
          className={styles.mobileMenu}
          aria-label="Мобильная навигация"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={styles.mobileNavLink}
              onClick={closeMobileMenu}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
