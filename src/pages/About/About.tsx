import { Badge, Group } from "@mantine/core";
import { ABOUT_FEATURES, ABOUT_ROUTES } from "@/data/about";
import styles from "./About.module.css";

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
              Специализируемся на маршрутах по рекам в северо-западной стороне
              от Минска. Все наши маршруты несложные и безопасные — рассчитаны
              на прохождение новичками и родителями с детьми.
            </p>
            <p className={styles.heroDescription}>
              На реке Илия находится наша база и обустроенные стоянки со всем
              необходимым: шатры, мебель, уютные костровые зоны, мангалы, WC
              туалет, волейбольная площадка и другое.
            </p>
          </div>
        </div>

        <div className={styles.features}>
          {ABOUT_FEATURES.map((feature, idx) => (
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
            {ABOUT_ROUTES.map((route) => (
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
      </div>
    </main>
  );
}
