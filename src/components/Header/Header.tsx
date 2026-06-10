import { useEffect, useRef, useState } from "react";
import { useMantineColorScheme } from "@mantine/core";
import { IconMoonStars, IconSunHigh } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { LogoMark } from "./LogoMark";
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
        <Link to="/" className={styles.brand} aria-label="ЖЭЎЖЫКІ — главная">
          <LogoMark />
          <span>ЖЭЎЖЫКІ</span>
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
          <div className={styles.socials}>
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
      </div>
      {isMobileMenuOpen && (
        <nav
          id="mobile-main-nav"
          className={styles.mobileMenu}
          aria-label="Мобильная навигация"
        >
          <Link
            to="/#schedule"
            className={styles.mobileNavLink}
            onClick={closeMobileMenu}
          >
            Расписание сплавов
          </Link>
          <Link
            to="/corporate"
            className={styles.mobileNavLink}
            onClick={closeMobileMenu}
          >
            Корпоративные сплавы
          </Link>
          <Link
            to="/faq"
            className={styles.mobileNavLink}
            onClick={closeMobileMenu}
          >
            Популярные вопросы
          </Link>
          <Link
            to="/about"
            className={styles.mobileNavLink}
            onClick={closeMobileMenu}
          >
            Про нас
          </Link>
        </nav>
      )}
    </header>
  );
}
