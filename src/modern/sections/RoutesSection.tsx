import { Alert, Skeleton } from "@mantine/core";
import { RiverPhotoCarousel } from "@/components/RiverPhotoCarousel";
import type { River } from "@/types/river";
import { isCorporateRiver } from "@/utils/splav";
import { V2Button } from "@/modern/components/V2Button";
import { SECTION_IDS } from "@/modern/constants/sections";
import { useGsapSectionReveal } from "@/modern/hooks/useGsapSectionReveal";
import { useSectionNav } from "@/modern/hooks/useSectionNav";
import { SectionShell } from "@/modern/components/SectionShell";
import shellStyles from "@/modern/components/SectionShell.module.css";
import styles from "./RoutesSection.module.css";

interface RoutesSectionProps {
  rivers: River[];
  loading: boolean;
  error: string | null;
  onRiverBook: (river: River) => void;
}

export function RoutesSection({
  rivers,
  loading,
  error,
  onRiverBook,
}: RoutesSectionProps) {
  const gridRef = useGsapSectionReveal<HTMLDivElement>({ stagger: 0.1 });
  const { scrollToSection } = useSectionNav();

  return (
    <SectionShell id={SECTION_IDS.routes}>
      <div className={styles.wrap}>
        <div className={styles.header} data-reveal>
          <p className={shellStyles.eyebrow}>Маршруты</p>
          <h2 className={shellStyles.title}>Наши реки</h2>
          <p className={shellStyles.lead}>
            Каждый маршрут рассчитан на комфортное прохождение новичками — с
            инструктажом, сопровождением и остановками на отдых.
          </p>
        </div>

        {loading ? (
          <div className={styles.grid}>
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} height={380} radius="lg" />
            ))}
          </div>
        ) : error ? (
          <Alert color="red" variant="light" title="Ошибка загрузки">
            {error}
          </Alert>
        ) : rivers.length === 0 ? (
          <p className={styles.empty}>
            Виды сплавов появятся после заполнения таблицы.
          </p>
        ) : (
          <div ref={gridRef} className={styles.grid}>
            {rivers.map((river) => (
              <article
                key={river.id}
                className={`${styles.card} ${
                  isCorporateRiver(river) ? styles.desktopOnlyRiverCard : ""
                }`}
              >
                <RiverPhotoCarousel
                  riverId={river.id}
                  riverName={river.river}
                  variant="riverCard"
                />
                <div className={styles.body} data-reveal>
                  <h3 className={styles.title}>{river.river}</h3>
                  {river.description && (
                    <p className={styles.description}>{river.description}</p>
                  )}
                  <div className={styles.meta}>
                    {river.distance?.trim() && (
                      <span className={styles.metaChip}>
                        {river.distance}
                      </span>
                    )}
                    {river.time?.trim() && (
                      <span className={styles.metaChip}>{river.time}</span>
                    )}
                    {river.price?.trim() && (
                      <span className={styles.metaChip}>{river.price}</span>
                    )}
                  </div>
                  <div className={styles.actions}>
                    <V2Button
                      variant="primary"
                      onClick={() => onRiverBook(river)}
                    >
                      Занять место
                    </V2Button>
                    {isCorporateRiver(river) && (
                      <V2Button
                        variant="secondary"
                        onClick={() => scrollToSection(SECTION_IDS.corporate)}
                      >
                        Подробнее
                      </V2Button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </SectionShell>
  );
}
