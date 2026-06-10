import { ABOUT_FEATURES, ABOUT_ROUTES } from "@/data/about";
import { SECTION_IDS } from "@/modern/constants/sections";
import { useGsapSectionReveal } from "@/modern/hooks/useGsapSectionReveal";
import { SectionShell } from "@/modern/components/SectionShell";
import shellStyles from "@/modern/components/SectionShell.module.css";
import styles from "./AboutSection.module.css";

export function AboutSection() {
  const contentRef = useGsapSectionReveal<HTMLDivElement>();

  return (
    <SectionShell id={SECTION_IDS.about} dark>
      <div className={styles.wrap}>
        <div className={styles.header} data-reveal>
          <p className={shellStyles.eyebrow}>О нас</p>
          <h2 className={shellStyles.title}>ЖЭЎЖЫКІ на воде</h2>
        </div>

        <div ref={contentRef}>
          <div className={styles.intro} data-reveal>
            <p>
              <strong>ЖЭЎЖЫКІ</strong> — коллектив единомышленников с опытом
              походов более 10 лет. Организуем сборные и корпоративные сплавы
              от нескольких часов до нескольких суток.
            </p>
            <p>
              На реке Илия находится наша база со стоянками, шатрами, мангальными
              зонами и всем необходимым для комфортного отдыха.
            </p>
          </div>

          <div className={styles.features}>
            {ABOUT_FEATURES.map((feature, idx) => (
              <div key={idx} className={styles.feature} data-reveal>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>

          <div className={styles.routes} data-reveal>
            <h3 className={styles.routesTitle}>Наши маршруты</h3>
            <div className={styles.badges}>
              {ABOUT_ROUTES.map((route) => (
                <span key={route.name} className={styles.badge}>
                  {route.name}
                </span>
              ))}
            </div>
            <p className={styles.note}>
              Илия — 60 км от Минска и 30 км от Молодечно. На этой реке
              находится наша база.
            </p>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
