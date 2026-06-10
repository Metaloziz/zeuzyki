import {
  CORPORATE_FEATURES,
  CORPORATE_OPTIONS,
  TRUSTED_COMPANIES,
} from "@/data/corporate";
import { CorporateGallery } from "@/modern/components/CorporateGallery";
import { SECTION_IDS } from "@/modern/constants/sections";
import { useGsapSectionReveal } from "@/modern/hooks/useGsapSectionReveal";
import { SectionShell } from "@/modern/components/SectionShell";
import shellStyles from "@/modern/components/SectionShell.module.css";
import styles from "./CorporateSection.module.css";

export function CorporateSection() {
  const contentRef = useGsapSectionReveal<HTMLDivElement>();

  return (
    <SectionShell id={SECTION_IDS.corporate} className={styles.compactSection}>
      <div className={styles.wrap}>
        <div className={styles.header} data-reveal>
          <p className={shellStyles.eyebrow}>Корпоратив</p>
          <h2 className={shellStyles.title}>Командные сплавы под ключ</h2>
          <p className={shellStyles.lead}>
            Укрепите командный дух на реке Илия — с трансфером, питанием и
            обустроенной базой.
          </p>
        </div>

        <div ref={contentRef}>
          <CorporateGallery />

          <div className={styles.pricingGrid} data-reveal>
            {CORPORATE_OPTIONS.map((option) => (
              <article key={option.id} className={styles.priceCard}>
                <h3>{option.title}</h3>
                <p className={styles.price}>от {option.price} руб./участник</p>
                <ul className={styles.includes}>
                  {option.includes.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className={styles.features}>
            {CORPORATE_FEATURES.map((feature, idx) => (
              <div key={idx} className={styles.feature} data-reveal>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>

          <h3 className={styles.clientsTitle} data-reveal>
            C нами отдыхали
          </h3>
          <div className={styles.clientsGrid} data-reveal>
            {TRUSTED_COMPANIES.map((company) => (
              <div
                key={company.name}
                className={`${styles.clientCard} ${
                  company.variant === "blue" ? styles.clientCardBlue : ""
                }`}
              >
                <img
                  src={company.logo}
                  alt={company.name}
                  className={styles.clientLogo}
                  loading="lazy"
                />
              </div>
            ))}
            <div className={styles.clientCard}>
              <span className={styles.clientText}>Квалитет</span>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
