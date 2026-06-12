import { corporateHeroPhoto } from "@/utils/routePhotos";
import {
  CORPORATE_FEATURES,
  CORPORATE_GALLERY,
  CORPORATE_OPTIONS,
  TRUSTED_COMPANIES,
} from "@/data/corporate";
import styles from "./Corporate.module.css";

export function Corporate() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Корпоративные сплавы</h1>

        <div className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.heroIntro}>
              Отличный способ укрепить командный дух и узнать свой коллектив с
              новой стороны.
            </p>
            <p className={styles.heroDescription}>
              Наши маршруты рассчитаны на новичков с учётом всех мер
              безопасности и комфорта. Мы организуем сплав под ключ: поможем с
              трансфером, питанием, обустроим палаточный лагерь, санитарную
              зону, походную баню и спортивные развлечения.
            </p>
            <p className={styles.heroDescription}>
              Атмосферные посиделки у костра, шашлыки на углях, уха из красной
              рыбы — всё это ждёт вашу команду на нашей базе на реке Илия.
            </p>
          </div>
          <div className={styles.heroImage}>
            <img
              src={corporateHeroPhoto}
              alt="Корпоративный сплав на байдарках"
              className={styles.heroImg}
            />
          </div>
        </div>
        <section className={styles.gallerySection}>
          <h2 className={styles.galleryTitle}>
            Как выглядит корпоративный сплав
          </h2>
          <div className={styles.galleryGrid}>
            {CORPORATE_GALLERY.map((photo) => (
              <figure
                key={photo.src}
                className={`${styles.galleryItem} ${
                  photo.layout === "wide"
                    ? styles.galleryItemWide
                    : photo.layout === "tall"
                      ? styles.galleryItemTall
                      : ""
                }`}
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className={styles.galleryImg}
                  loading="lazy"
                />
              </figure>
            ))}
          </div>
        </section>

        <div className={styles.pricing}>
          <h2 className={styles.pricingTitle}>
            Варианты корпоративного сплава
          </h2>
          <div className={styles.grid}>
            {CORPORATE_OPTIONS.map((option) => (
              <article key={option.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{option.title}</h3>
                  <p className={styles.cardPrice}>
                    от <span>{option.price}</span> руб./участник
                  </p>
                </div>
                <ul className={styles.includes}>
                  {option.includes.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
        <div className={styles.features}>
          {CORPORATE_FEATURES.map((feature, idx) => (
            <div key={idx} className={styles.feature}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>

        <div className={styles.clients}>
          <h2 className={styles.clientsTitle}>C нами отдыхали</h2>
          <div
            className={styles.clientsGrid}
            aria-label="Компании, которые нам доверяют"
          >
            {TRUSTED_COMPANIES.map((company) => (
              <div
                key={company.name}
                className={`${styles.clientLogoCard} ${company.variant === "blue" ? styles.clientLogoCardBlue : ""}`}
              >
                <img
                  src={company.logo}
                  alt={company.name}
                  className={styles.clientLogo}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
          <p className={styles.clientsNote}>и другие компании</p>
        </div>
      </div>
    </main>
  );
}
