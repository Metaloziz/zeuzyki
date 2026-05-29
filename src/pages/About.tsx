import { Badge, Group } from "@mantine/core";
import styles from "./About.module.css";

const FEATURES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Опытная команда",
    description: "Более 10 лет организации походов и сплавов. Инструктора с опытом работы с группами любого уровня подготовки.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: "Собственная база",
    description: "На реке Илия расположена наша база с оборудованными стоянками, шатрами, мангалами, WC и волейбольной площадкой.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Безопасность",
    description: "Все маршруты рассчитаны на новичков и семьи с детьми. Спасательные жилеты, страховка и инструктаж включены.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
    title: "Комфорт на природе",
    description: "Уютные костровые зоны, мебель, мангалы, горячий чай и питание на берегу. Всё для приятного отдыха.",
  },
];

const ROUTES = [
  { name: "р. Илия", distance: "60 км от Минска, 30 км от Молодечно" },
  { name: "р. Вилия", distance: "живописные виды и спокойное течение" },
  { name: "р. Рыбчанка", distance: "тихие воды и лесные пейзажи" },
  { name: "р. Нарочанка", distance: "маршруты выходного дня" },
];

export function About() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Про нас</h1>

        <div className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.heroIntro}>
              <strong>ЖЭЎЖЫКІ</strong> — коллектив единомышленников с опытом
              походов более 10 лет. Организуем сборные и корпоративные сплавы
              продолжительностью от нескольких часов до нескольких суток.
            </p>
            <p className={styles.heroDescription}>
              Специализируемся на маршрутах по рекам в северо-западной стороне от
              Минска. Все наши маршруты несложные и безопасные — рассчитаны на
              прохождение новичками и родителями с детьми.
            </p>
            <p className={styles.heroDescription}>
              На реке Илия находится наша база и обустроенные стоянки со всем
              необходимым: шатры, мебель, уютные костровые зоны, мангалы, WC
              туалет, волейбольная площадка и другое.
            </p>
          </div>
          <div className={styles.heroImage} aria-hidden="true">
            <div className={styles.imagePlaceholder}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="5" />
                <path d="M20 21a8 8 0 0 0-16 0" />
              </svg>
              <span>Фото команды</span>
            </div>
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

        <div className={styles.routes}>
          <h2 className={styles.routesTitle}>Наши маршруты</h2>
          <Group justify="center" wrap="wrap" gap="sm" mb="md">
            {ROUTES.map((route) => (
              <Badge
                key={route.name}
                size="lg"
                variant="outline"
                className={styles.routeBadge}
              >
                {route.name}
              </Badge>
            ))}
          </Group>
          <p className={styles.routesNote}>
            Илия — 60 км от Минска и 30 км от Молодечно. На этой реке находится
            наша база.
          </p>
        </div>

        <div className={styles.contact}>
          <h2 className={styles.contactTitle}>Свяжитесь с нами</h2>
          <a href="tel:+375333608720" className={styles.contactPhone}>
            +375 33 360 87 20
          </a>
          <p className={styles.contactNote}>
            Звоните, пишите — ответим на все вопросы о маршрутах, снаряжении и
            подготовке к походу.
          </p>
        </div>
      </div>
    </main>
  );
}
