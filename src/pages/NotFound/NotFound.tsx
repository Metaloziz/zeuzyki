import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { PageMeta } from "@/seo/PageMeta";
import { NOT_FOUND_SEO } from "@/seo/pages";
import styles from "./NotFound.module.css";

export function NotFound() {
  return (
    <main className={styles.page}>
      <PageMeta seo={NOT_FOUND_SEO} noIndex />
      <div className={styles.inner}>
        <p className={styles.code}>404</p>
        <h1 className={styles.title}>Страница не найдена</h1>
        <p className={styles.text}>
          Такой страницы нет. Вернитесь на главную и выберите сплав.
        </p>
        <Link to={ROUTES.HOME} className={styles.link}>
          На главную
        </Link>
      </div>
    </main>
  );
}
