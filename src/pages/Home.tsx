import { useEffect, useMemo, useState } from "react";
import { Alert, Loader, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { BookingModal } from "../components/BookingModal/BookingModal";
import { fetchSchedule } from "../lib/sheetsApi";
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
  нарочанка: new URL("../../assets/Нарочанка.jpg", import.meta.url).href,
  узлянка: new URL("../../assets/Узлянка.jpg", import.meta.url).href,
};

function normalizeRiverName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/^р\.\s*/, "");
}

function getSplavCardTitle(splav: Splav): string {
  const title = splav.title?.trim();
  if (!title) return `Сплав по р. ${splav.river}`;

  const hasRiverInTitle = title
    .toLowerCase()
    .includes(splav.river.toLowerCase());
  return hasRiverInTitle ? title : `${title} · р. ${splav.river}`;
}

export function Home() {
  const [opened, { open, close }] = useDisclosure(false);
  const [splavy, setSplavy] = useState<Splav[]>([]);
  const [activeSplav, setActiveSplav] = useState<Splav | null>(null);
  const [loading, setLoading] = useState(true);
  const [freshnessStatus, setFreshnessStatus] = useState<
    "idle" | "checking" | "success"
  >("idle");
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      let refreshFailed = false;

      setLoading(true);
      setFreshnessStatus("idle");
      setLoadError(null);
      try {
        const items = await fetchSchedule({
          onRefreshStart: () => {
            refreshFailed = false;
            if (!cancelled) setFreshnessStatus("checking");
          },
          onUpdate: (freshItems) => {
            if (!cancelled) {
              setSplavy(freshItems);
              setActiveSplav((current) =>
                current
                  ? (freshItems.find((item) => item.id === current.id) ??
                    current)
                  : (freshItems[0] ?? null),
              );
            }
          },
          onRefreshError: () => {
            refreshFailed = true;
            if (!cancelled) setFreshnessStatus("idle");
          },
          onRefreshComplete: () => {
            if (!cancelled && !refreshFailed) setFreshnessStatus("success");
          },
        });
        if (!cancelled) {
          setSplavy(items);
          setActiveSplav(items[0] ?? null);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(
            e instanceof Error
              ? e.message
              : "Не удалось загрузить расписание. Попробуйте позже.",
          );
          setSplavy([]);
          setActiveSplav(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleBook = (splav: Splav) => {
    setActiveSplav(splav);
    open();
  };

  const { featuredSplavy, listSplavy } = useMemo(() => {
    const sortedSplavy = [...splavy].sort(
      (a, b) => toDateTime(a).getTime() - toDateTime(b).getTime(),
    );

    const now = new Date();
    const upcoming = sortedSplavy.filter((s) => toDateTime(s) >= now);
    const nearestSource = upcoming.length > 0 ? upcoming : sortedSplavy;
    const featured = nearestSource.slice(0, 2);
    const featuredIds = new Set(featured.map((s) => s.id));
    const list = sortedSplavy.filter((s) => !featuredIds.has(s.id));

    return { featuredSplavy: featured, listSplavy: list };
  }, [splavy]);

  return (
    <>
      <main>
        <section id="schedule" className={styles.section}>
          <h1 className={styles.sectionTitle}>Расписание сплавов</h1>

          {loading ? (
            <div className={styles.sectionEmpty}>
              <Stack align="center" gap="xs">
                <Loader size="sm" />
                <Text size="sm" c="dimmed">
                  Загружаем расписание…
                </Text>
              </Stack>
            </div>
          ) : loadError ? (
            <Alert color="red" variant="light" title="Ошибка загрузки">
              {loadError}
            </Alert>
          ) : splavy.length === 0 ? (
            <div className={styles.sectionEmpty}>
              <h2 className={styles.emptyTitle}>Сезон закрыт</h2>
              <p className={styles.emptyText}>
                Новые даты появятся, как только их добавят в расписание.
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

              {freshnessStatus !== "idle" && (
                <div
                  className={styles.refreshNotice}
                  role="status"
                  aria-live="polite"
                >
                  {freshnessStatus === "checking" ? (
                    <Loader size="xs" />
                  ) : (
                    <span
                      className={styles.refreshSuccessIcon}
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                  )}
                  <span>
                    {freshnessStatus === "checking"
                      ? "Проверка актуальности"
                      : "Данные актуальны"}
                  </span>
                </div>
              )}

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
