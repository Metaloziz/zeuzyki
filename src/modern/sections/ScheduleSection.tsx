import type { CSSProperties } from "react";
import { Alert, Skeleton } from "@mantine/core";
import type { Splav } from "@/types/splav";
import { formatHumanDate } from "@/utils/format";
import { getScheduleRowPhoto } from "@/utils/routePhotos";
import { getSplavCardTitle, toDateTime } from "@/utils/splav";
import { V2Button } from "@/modern/components/V2Button";
import { SECTION_IDS } from "@/modern/constants/sections";
import { useGsapSectionReveal } from "@/modern/hooks/useGsapSectionReveal";
import { SectionShell } from "@/modern/components/SectionShell";
import shellStyles from "@/modern/components/SectionShell.module.css";
import styles from "./ScheduleSection.module.css";

interface ScheduleSectionProps {
  splavy: Splav[];
  loading: boolean;
  error: string | null;
  onBook: (splav: Splav) => void;
}

export function ScheduleSection({
  splavy,
  loading,
  error,
  onBook,
}: ScheduleSectionProps) {
  const listRef = useGsapSectionReveal<HTMLDivElement>({ stagger: 0.06, y: 32 });

  const sorted = [...splavy].sort(
    (a, b) => toDateTime(a).getTime() - toDateTime(b).getTime(),
  );

  return (
    <SectionShell id={SECTION_IDS.schedule} dark>
      <div className={styles.wrap}>
        <div className={styles.header} data-reveal>
          <p className={shellStyles.eyebrow}>Расписание</p>
          <h2 className={shellStyles.title}>Ближайшие даты</h2>
          <p className={shellStyles.lead}>
            Выберите дату и запишитесь онлайн — мы свяжемся для подтверждения.
          </p>
        </div>

        {loading ? (
          <div className={styles.list}>
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} height={72} radius="md" />
            ))}
          </div>
        ) : error ? (
          <Alert color="red" variant="light" title="Ошибка загрузки">
            {error}
          </Alert>
        ) : sorted.length === 0 ? (
          <div className={styles.empty}>
            <h3>Сезон закрыт</h3>
            <p>Новые даты появятся, как только их добавят в расписание.</p>
          </div>
        ) : (
          <>
            <div className={styles.info} data-reveal>
              <p>
                Мы проводим сплавы в любой день при наборе группы от 6 человек.
              </p>
              <p>
                Каждый маршрут доступен новичкам, а после сплава — чай, кофе и
                печенье.
              </p>
            </div>
            <div ref={listRef} className={styles.list}>
              {sorted.map((splav) => {
                const routeImage = getScheduleRowPhoto(splav.river);
                return (
                  <article
                    key={splav.id}
                    className={`${styles.item} ${
                      routeImage ? styles.itemWithBg : ""
                    }`}
                    style={
                      routeImage
                        ? ({ "--item-bg": `url(${routeImage})` } as CSSProperties)
                        : undefined
                    }
                    data-reveal
                  >
                    <div className={styles.itemInner}>
                      <div className={styles.main}>
                        <div>
                          <p className={styles.date}>
                            {formatHumanDate(toDateTime(splav))}
                          </p>
                          <h3 className={styles.title}>
                            {getSplavCardTitle(splav)}
                          </h3>
                          <p className={styles.meta}>
                            старт в {splav.startTime}
                          </p>
                        </div>
                      </div>
                      <V2Button
                        variant="primary"
                        className={styles.book}
                        onClick={() => onBook(splav)}
                      >
                        Записаться
                      </V2Button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
    </SectionShell>
  );
}
