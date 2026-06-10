import belarusbankLogo from "../assets/company-logos/belarusbank.jpg";
import belgosstrakhLogo from "../assets/company-logos/belgosstrakh.svg";
import gazpromLogo from "../assets/company-logos/gazprom.svg";
import mtsLogo from "../assets/company-logos/mts.svg";
import omaLogo from "../assets/company-logos/oma.png";
import { corporateHeroPhoto, getRoutePhotos } from "../lib/routePhotos";
import styles from "./Corporate.module.css";

const FEATURES = [
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22,4 12,14.01 9,11.01" />
      </svg>
    ),
    title: "Аккредитация",
    description:
      "Наша деятельность подтверждена государственной аккредитацией.",
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
    title: "Сплав под ключ",
    description:
      "Организуем трансфер, питание, лагерь, баню и развлечения — от вас только заявка.",
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Командный дух",
    description:
      "Укрепите отношения в коллективе и узнайте коллег с новой стороны в неформальной обстановке.",
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Безопасность",
    description:
      "Все маршруты рассчитаны на новичков. Инструктаж, спасательные жилеты и страховка включены.",
  },
];

const CORPORATE_OPTIONS = [
  {
    id: 1,
    title: "Первый вариант",
    price: 70,
    includes: ["Трёхчасовой сплав по реке"],
  },
  {
    id: 2,
    title: "Второй вариант",
    price: 100,
    includes: [
      "Трёхчасовой сплав по реке",
      "Установка шатра, мебели, мангала и др.",
    ],
  },
  {
    id: 3,
    title: "Третий вариант",
    price: 130,
    includes: [
      "Трёхчасовой сплав по реке",
      "Установка шатра, мебели, мангала и др.",
      "Помощь в организации питания",
    ],
  },
  {
    id: 4,
    title: "Четвёртый вариант",
    price: 240,
    includes: [
      "Однодневный сплав по реке",
      "Установка шатра, мебели, мангала и др.",
      "Помощь в организации питания (обед и ужин)",
    ],
  },
  {
    id: 5,
    title: "Пятый вариант",
    price: 320,
    includes: [
      "Однодневный сплав по реке",
      "Палаточный лагерь и организация ночёвки",
      "Установка шатра, мебели, мангала и др.",
      "Помощь в организации питания (обед, ужин и завтрак)",
    ],
  },
];

const CORPORATE_GALLERY_META = [
  { alt: "Команда на корпоративном сплаве", layout: "wide" },
  { alt: "Участники корпоративного сплава на реке", layout: "default" },
  { alt: "Корпоративный выезд на байдарках", layout: "tall" },
  { alt: "Отдых команды после сплава", layout: "default" },
  { alt: "Корпоративный сплав на реке", layout: "default" },
  { alt: "Корпоративная команда на байдарках", layout: "default" },
] as const;

const CORPORATE_GALLERY = getRoutePhotos("Корпоративный сплав").map(
  (src, index) => ({
    src,
    alt:
      CORPORATE_GALLERY_META[index]?.alt ??
      `Корпоративный сплав, фото ${index + 1}`,
    layout: CORPORATE_GALLERY_META[index]?.layout ?? "default",
  }),
);

const TRUSTED_COMPANIES = [
  { name: "ОМА", logo: omaLogo, variant: "blue" },
  { name: "Беларусбанк", logo: belarusbankLogo, variant: "light" },
  { name: "Белгосстрах", logo: belgosstrakhLogo, variant: "light" },
  { name: "МТС", logo: mtsLogo, variant: "light" },
  { name: "Газпром", logo: gazpromLogo, variant: "light" },
] as const;

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
          {FEATURES.map((feature, idx) => (
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
            <div className={styles.clientTextCard} aria-label="Квалитет">
              Квалитет
            </div>
          </div>
          <p className={styles.clientsNote}>и другие компании</p>
        </div>
      </div>
    </main>
  );
}
