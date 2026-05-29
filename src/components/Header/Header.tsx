import { useEffect, useRef, useState } from "react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);

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
