import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { BookingModal } from "../components/BookingModal/BookingModal";
import { splavy } from "../mocks/splavy";
import type { Splav } from "../types/splav";
import styles from "./Home.module.css";

function toDateTime(splav: Splav) {
  return new Date(`${splav.startDate}T${splav.startTime}`);
}

const humanDate = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
});

const riverImageByName: Record<string, string> = {
  вилия: new URL("../../assets/Вилия.jpg", import.meta.url).href,
  илия: new URL("../../assets/Илия.jpg", import.meta.url).href,
  нарочь: new URL("../../assets/Нарочь.jpg", import.meta.url).href,
  узлянка: new URL("../../assets/Узлянка.jpg", import.meta.url).href,
};

function normalizeRiverName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/^р\.\s*/, "");
}

function getSplavCardTitle(splav: Splav): string {
  return `Сплав по р. ${splav.river}`;
}

export function Home() {
  const [opened, { open, close }] = useDisclosure(false);
  const [activeSplav, setActiveSplav] = useState<Splav | null>(
    splavy[0] ?? null,
  );

  const handleBook = (splav: Splav) => {
    setActiveSplav(splav);
    open();
  };

  const sortedSplavy = [...splavy].sort(
    (a, b) => toDateTime(a).getTime() - toDateTime(b).getTime(),
  );
  const now = new Date();
  const upcoming = sortedSplavy.filter((s) => toDateTime(s) >= now);
  const nearestSource = upcoming.length > 0 ? upcoming : sortedSplavy;
  const featuredSplavy = nearestSource.slice(0, 2);
  const featuredIds = new Set(featuredSplavy.map((s) => s.id));
  const listSplavy = sortedSplavy.filter((s) => !featuredIds.has(s.id));

  return (
    <>
      <main>
        <section id="schedule" className={styles.section}>
          <h1 className={styles.sectionTitle}>Расписание сплавов</h1>

          {splavy.length === 0 ? (
            <div className={styles.sectionEmpty}>
              <h2 className={styles.emptyTitle}>Сезон закрыт</h2>
              <p className={styles.emptyText}>
                Новые даты появятся, как только их добавят в форму записи.
              </p>
            </div>
          ) : (
            <>
              <div className={styles.featuredGrid}>
                {featuredSplavy.map((splav) => {
                  const riverImage =
                    riverImageByName[normalizeRiverName(splav.river)];

                  return (
                    <article key={splav.id} className={styles.featuredCard}>
                      <div
                        className={`${styles.featuredImageWrap} ${!riverImage ? styles.imageFallback : ""}`}
                        aria-hidden="true"
                      >
                        {riverImage && (
                          <img
                            src={riverImage}
                            alt={`Река ${splav.river}`}
                            className={styles.featuredImage}
                            loading="lazy"
                          />
                        )}
                      </div>
                      <p className={styles.featuredDate}>
                        {humanDate.format(toDateTime(splav))}
                      </p>
                      <h2 className={styles.featuredTitle}>
                        {getSplavCardTitle(splav)}
                      </h2>
                      <p className={styles.featuredMeta}>
                        старт в {splav.startTime}
                      </p>
                      <button
                        type="button"
                        className={`${styles.bookButton} ${styles.featuredBookButton}`}
                        onClick={() => handleBook(splav)}
                      >
                        Записаться
                      </button>
                    </article>
                  );
                })}
              </div>

              <div className={styles.infoBox}>
                <p>
                  Мы проводим сплавы в любой день при наборе группы от 6
                  человек.
                </p>
                <p>
                  Каждый маршрут доступен новичкам, а после сплава — чай, кофе и
                  печенье.
                </p>
              </div>

              {listSplavy.length > 0 && (
                <div className={styles.listBlock}>
                  <h2 className={styles.listTitle}>Остальные сплавы</h2>
                  <div className={styles.list}>
                    {listSplavy.map((splav) => {
                      const riverImage =
                        riverImageByName[normalizeRiverName(splav.river)];

                      return (
                        <article key={splav.id} className={styles.listItem}>
                          <div className={styles.listItemMain}>
                            <div
                              className={`${styles.listThumbWrap} ${!riverImage ? styles.imageFallback : ""}`}
                              aria-hidden="true"
                            >
                              {riverImage && (
                                <img
                                  src={riverImage}
                                  alt={`Река ${splav.river}`}
                                  className={styles.listThumb}
                                  loading="lazy"
                                />
                              )}
                            </div>
                            <div>
                              <p className={styles.listItemDate}>
                                {humanDate.format(toDateTime(splav))}
                              </p>
                              <h3 className={styles.listItemTitle}>
                                {getSplavCardTitle(splav)}
                              </h3>
                              <p className={styles.listItemMeta}>
                                старт в {splav.startTime}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            className={`${styles.bookButton} ${styles.listBookButton}`}
                            onClick={() => handleBook(splav)}
                          >
                            Записаться
                          </button>
                        </article>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>
      {activeSplav && (
        <BookingModal splav={activeSplav} opened={opened} onClose={close} />
      )}
    </>
  );
}
