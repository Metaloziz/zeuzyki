import styles from './Header.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <a href="/" className={styles.brand} aria-label="Zeuzyki — главная">
          Zeuzyki
        </a>
        <nav className={styles.nav} aria-label="Основная навигация">
          <a href="#splavs" className={styles.navLink}>
            Сплавы
          </a>
          <a href="#about" className={styles.navLink}>
            О нас
          </a>
          <a href="#contacts" className={styles.navLink}>
            Контакты
          </a>
        </nav>
      </div>
    </header>
  );
}
