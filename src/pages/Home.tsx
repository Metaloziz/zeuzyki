import { useEffect, useMemo, useState } from "react";
import { Alert, Loader, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { BookingModal } from "../components/BookingModal/BookingModal";
import { getRiverImage } from "../lib/riverImages";
import { fetchRivers, fetchSchedule } from "../lib/sheetsApi";
import type { River } from "../types/river";
import type { Splav } from "../types/splav";
import styles from "./Home.module.css";

function toDateTime(splav: Splav) {
  return new Date(`${splav.startDate}T${splav.startTime}`);
}

const humanDate = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
});

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
  const [rivers, setRivers] = useState<River[]>([]);
  const [activeRiver, setActiveRiver] = useState<River | null>(null);
  const [preselectedDateId, setPreselectedDateId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [riversLoading, setRiversLoading] = useState(true);
  const [freshnessStatus, setFreshnessStatus] = useState<
    "idle" | "checking" | "success"
  >("idle");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [riversError, setRiversError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setRiversLoading(true);
      setRiversError(null);

      try {
        const items = await fetchRivers();
        if (!cancelled) setRivers(items);
      } catch (e) {
        if (!cancelled) {
          setRiversError(
            e instanceof Error
              ? e.message
              : "Не удалось загрузить виды сплавов. Попробуйте позже.",
          );
          setRivers([]);
        }
      } finally {
        if (!cancelled) setRiversLoading(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, []);

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
              setPreselectedDateId((current) =>
                current && freshItems.some((item) => item.id === current)
                  ? current
                  : null,
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
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(
            e instanceof Error
              ? e.message
              : "Не удалось загрузить расписание. Попробуйте позже.",
          );
          setSplavy([]);
          setActiveRiver(null);
          setPreselectedDateId(null);
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
    const river = rivers.find((item) =>
      splav.riverId ? item.id === splav.riverId : item.river === splav.river,
    );

    if (!river) {
      window.alert("Не удалось найти тип сплава для выбранной даты.");
      return;
    }

    setActiveRiver(river);
    setPreselectedDateId(splav.id);
    open();
  };

  const handleRiverBook = (river: River) => {
    setActiveRiver(river);
    setPreselectedDateId(null);
    open();
  };

  const activeRiverDates = useMemo(() => {
    if (!activeRiver) return [];

    return splavy
      .filter((splav) =>
        splav.riverId
          ? splav.riverId === activeRiver.id
          : splav.river === activeRiver.river,
      )
      .sort((a, b) => toDateTime(a).getTime() - toDateTime(b).getTime());
  }, [activeRiver, splavy]);

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

          <section
            className={styles.riverTypesBlock}
            aria-labelledby="river-types-title"
          >
            <h2 id="river-types-title" className={styles.subsectionTitle}>
              Виды сплавов
            </h2>

            {riversLoading ? (
              <div className={styles.sectionEmpty}>
                <Stack align="center" gap="xs">
                  <Loader size="sm" />
                  <Text size="sm" c="dimmed">
                    Загружаем виды сплавов…
                  </Text>
                </Stack>
              </div>
            ) : riversError ? (
              <Alert color="red" variant="light" title="Ошибка загрузки">
                {riversError}
              </Alert>
            ) : rivers.length > 0 ? (
              <div className={styles.featuredGrid}>
                {rivers.map((river) => {
                  const riverImage = getRiverImage(river.river);

                  return (
                    <article
                      key={river.id}
                      className={`${styles.featuredCard} ${styles.riverCard}`}
                    >
                      <div
                        className={`${styles.featuredImageWrap} ${!riverImage ? styles.imageFallback : ""}`}
                        aria-hidden="true"
                      >
                        {riverImage && (
                          <img
                            src={riverImage}
                            alt={`Река ${river.river}`}
                            className={styles.featuredImage}
                            loading="lazy"
                          />
                        )}
                      </div>
                      <h3 className={styles.featuredTitle}>{river.river}</h3>
                      {river.description && (
                        <p className={styles.riverDescription}>
                          {river.description}
                        </p>
                      )}
                      <dl className={styles.riverDetails}>
                        <div>
                          <dt>Дистанция</dt>
                          <dd>{river.distance}</dd>
                        </div>
                        <div>
                          <dt>Время</dt>
                          <dd>{river.time}</dd>
                        </div>
                        <div>
                          <dt>Цена</dt>
                          <dd>{river.price}</dd>
                        </div>
                        <div>
                          <dt>Дети до 12 лет</dt>
                          <dd>{river.kidsPrice}</dd>
                        </div>
                      </dl>
                      <button
                        type="button"
                        className={`${styles.bookButton} ${styles.featuredBookButton}`}
                        onClick={() => handleRiverBook(river)}
                      >
                        Забронировать
                      </button>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className={styles.sectionEmpty}>
                <p className={styles.emptyText}>
                  Виды сплавов появятся после заполнения таблицы Rivers.
                </p>
              </div>
            )}
          </section>

          <h2 className={styles.subsectionTitle}>Ближайшие даты</h2>

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
                  const riverImage = getRiverImage(splav.river);

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
                      const riverImage = getRiverImage(splav.river);

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
      {activeRiver && (
        <BookingModal
          river={activeRiver}
          dates={activeRiverDates}
          preselectedDateId={preselectedDateId}
          opened={opened}
          onClose={close}
        />
      )}
    </>
  );
}
