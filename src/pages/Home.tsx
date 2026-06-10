import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { Link } from "react-router-dom";
import { Alert, Skeleton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { BookingModal } from "../components/BookingModal/BookingModal";
import {
  corporateHeroPhoto,
  getRoutePhoto,
  getRoutePhotos,
} from "../lib/routePhotos";
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

function isCorporateRiver(river: River): boolean {
  return river.river.trim().toLowerCase() === "корпоративный сплав";
}

function getSplavCardTitle(splav: Splav): string {
  const title = splav.title?.trim();
  if (!title) return `Сплав по р. ${splav.river}`;

  const hasRiverInTitle = title
    .toLowerCase()
    .includes(splav.river.toLowerCase());
  return hasRiverInTitle ? title : `${title} · р. ${splav.river}`;
}

const RIVER_SKELETONS = Array.from({ length: 4 }, (_, index) => index);
const RIVER_DETAIL_SKELETONS = Array.from({ length: 4 }, (_, index) => index);
const SCHEDULE_SKELETONS = Array.from({ length: 5 }, (_, index) => index);
const MIN_SWIPE_DISTANCE = 44;

function getRiverCarouselPhotos(riverName: string): string[] {
  const routePhotos = getRoutePhotos(riverName);

  if (riverName.trim().toLowerCase() !== "корпоративный сплав") {
    return routePhotos;
  }

  if (routePhotos.length === 0) return [corporateHeroPhoto];

  return [corporateHeroPhoto, ...routePhotos.slice(1)];
}

function RiverPhotoCarousel({ riverName }: { riverName: string }) {
  const photos = useMemo(
    () => getRiverCarouselPhotos(riverName),
    [riverName],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragStartX, setDragStartX] = useState<number | null>(null);

  const showSlide = (index: number) => {
    setActiveIndex((index + photos.length) % photos.length);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    setDragStartX(event.clientX);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStartX === null) return;

    const distance = event.clientX - dragStartX;
    setDragStartX(null);

    if (Math.abs(distance) < MIN_SWIPE_DISTANCE) return;
    showSlide(activeIndex + (distance < 0 ? 1 : -1));
  };

  if (photos.length === 0) return null;

  return (
    <div
      className={styles.photoCarousel}
      aria-label={`Фотографии маршрута ${riverName}`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => setDragStartX(null)}
    >
      <div
        className={styles.photoCarouselTrack}
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {photos.map((photo, index) => (
          <div
            key={photo}
            className={styles.photoSlide}
            aria-hidden={activeIndex !== index}
          >
            <img
              src={photo}
              alt={`Пейзаж маршрута ${riverName}, фото ${index + 1}`}
              className={styles.photoSlideImage}
              loading={index === 0 ? "eager" : "lazy"}
              draggable={false}
            />
          </div>
        ))}
      </div>

      {photos.length > 1 && (
        <>
          <button
            type="button"
            className={`${styles.photoCarouselButton} ${styles.photoCarouselButtonPrev}`}
            onClick={() => showSlide(activeIndex - 1)}
            aria-label="Предыдущее фото"
          >
            <IconChevronLeft size={20} stroke={2.4} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`${styles.photoCarouselButton} ${styles.photoCarouselButtonNext}`}
            onClick={() => showSlide(activeIndex + 1)}
            aria-label="Следующее фото"
          >
            <IconChevronRight size={20} stroke={2.4} aria-hidden="true" />
          </button>

          <div className={styles.photoCarouselDots} aria-hidden="true">
            {photos.map((photo, index) => (
              <span
                key={photo}
                className={`${styles.photoCarouselDot} ${
                  activeIndex === index ? styles.photoCarouselDotActive : ""
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
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
  const [, setFreshnessStatus] = useState<"idle" | "checking" | "success">(
    "idle",
  );
  const freshnessStateRef = useRef({ pending: 0, failed: false });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [riversError, setRiversError] = useState<string | null>(null);

  const startFreshnessCheck = () => {
    if (freshnessStateRef.current.pending === 0) {
      freshnessStateRef.current.failed = false;
    }
    freshnessStateRef.current.pending += 1;
    setFreshnessStatus("checking");
  };

  const failFreshnessCheck = () => {
    freshnessStateRef.current.failed = true;
  };

  const completeFreshnessCheck = () => {
    freshnessStateRef.current.pending = Math.max(
      0,
      freshnessStateRef.current.pending - 1,
    );

    if (freshnessStateRef.current.pending === 0) {
      setFreshnessStatus(freshnessStateRef.current.failed ? "idle" : "success");
    }
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setRiversLoading(true);
      setRiversError(null);

      try {
        const items = await fetchRivers({
          onRefreshStart: () => {
            startFreshnessCheck();
          },
          onUpdate: (freshItems) => {
            if (!cancelled) setRivers(freshItems);
          },
          onRefreshError: () => {
            failFreshnessCheck();
          },
          onRefreshComplete: () => {
            completeFreshnessCheck();
          },
        });
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
      setLoading(true);
      setLoadError(null);
      try {
        const items = await fetchSchedule({
          onRefreshStart: () => {
            startFreshnessCheck();
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
            failFreshnessCheck();
          },
          onRefreshComplete: () => {
            completeFreshnessCheck();
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

  const scheduleSplavy = useMemo(
    () =>
      [...splavy].sort(
        (a, b) => toDateTime(a).getTime() - toDateTime(b).getTime(),
      ),
    [splavy],
  );

  return (
    <>
      <main>
        <section id="schedule" className={styles.section}>
          <h1 className={styles.sectionTitle}>Выбрать сплав и записаться</h1>

          <section
            className={styles.riverTypesBlock}
            aria-labelledby="river-types-title"
          >
            <div className={styles.subsectionHead}>
              <h2 id="river-types-title" className={styles.subsectionTitle}>
                Наши маршруты
              </h2>
            </div>

            {riversLoading ? (
              <div className={styles.featuredGrid} aria-hidden="true">
                {RIVER_SKELETONS.map((item) => (
                  <article
                    key={item}
                    className={`${styles.featuredCard} ${styles.riverCard}`}
                  >
                    <Skeleton className={styles.featuredImageWrap} />
                    <Skeleton height={24} width="58%" radius="xl" mb={12} />
                    <Skeleton height={13} radius="xl" mb={8} />
                    <Skeleton height={13} width="84%" radius="xl" mb={14} />
                    <div className={styles.riverDetails}>
                      {RIVER_DETAIL_SKELETONS.map((detail) => (
                        <div key={detail}>
                          <Skeleton
                            height={10}
                            width="54%"
                            radius="xl"
                            mb={6}
                          />
                          <Skeleton height={13} width="76%" radius="xl" />
                        </div>
                      ))}
                    </div>
                    <Skeleton height={40} width={140} radius="xl" mt={14} />
                  </article>
                ))}
              </div>
            ) : riversError ? (
              <Alert color="red" variant="light" title="Ошибка загрузки">
                {riversError}
              </Alert>
            ) : rivers.length > 0 ? (
              <div className={styles.featuredGrid}>
                {rivers.map((river) => (
                  <article
                    key={river.id}
                    className={`${styles.featuredCard} ${styles.riverCard}`}
                  >
                    <RiverPhotoCarousel riverName={river.river} />
                    <h3 className={styles.featuredTitle}>{river.river}</h3>
                    {river.description && (
                      <p className={styles.riverDescription}>
                        {river.description}
                      </p>
                    )}
                    <dl className={styles.riverDetails}>
                      {river.distance?.trim() && (
                        <div>
                          <dt>Дистанция</dt>
                          <dd>{river.distance}</dd>
                        </div>
                      )}
                      {river.time?.trim() && (
                        <div>
                          <dt>Время</dt>
                          <dd>{river.time}</dd>
                        </div>
                      )}
                      {river.price?.trim() && (
                        <div>
                          <dt>Цена</dt>
                          <dd>{river.price}</dd>
                        </div>
                      )}
                      {river.kidsPrice?.trim() && (
                        <div>
                          <dt>Дети до 12 лет</dt>
                          <dd>{river.kidsPrice}</dd>
                        </div>
                      )}
                    </dl>
                    {isCorporateRiver(river) ? (
                      <div className={styles.riverCardActions}>
                        <button
                          type="button"
                          className={styles.bookButton}
                          onClick={() => handleRiverBook(river)}
                        >
                          Забронировать
                        </button>
                        <Link
                          to="/corporate"
                          className={`${styles.bookButton} ${styles.riverCardDetailsButton}`}
                        >
                          Подробнее
                        </Link>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className={`${styles.bookButton} ${styles.featuredBookButton}`}
                        onClick={() => handleRiverBook(river)}
                      >
                        Забронировать
                      </button>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <div className={styles.sectionEmpty}>
                <p className={styles.emptyText}>
                  Виды сплавов появятся после заполнения таблицы Rivers.
                </p>
              </div>
            )}
          </section>

          {loading ? (
            <div className={styles.listBlock} aria-hidden="true">
              <Skeleton height={30} width={170} radius="xl" mb={14} />
              <div className={styles.list}>
                {SCHEDULE_SKELETONS.map((item) => (
                  <article key={item} className={styles.listItem}>
                    <div className={styles.listItemMain}>
                      <Skeleton className={styles.listThumbWrap} />
                      <div className={styles.scheduleSkeletonText}>
                        <Skeleton height={15} width={96} radius="xl" mb={8} />
                        <Skeleton
                          height={20}
                          width="min(320px, 70vw)"
                          radius="xl"
                          mb={8}
                        />
                        <Skeleton height={14} width={112} radius="xl" />
                      </div>
                    </div>
                    <Skeleton height={40} width={126} radius="xl" />
                  </article>
                ))}
              </div>
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

              {scheduleSplavy.length > 0 && (
                <div className={styles.listBlock}>
                  <h2 className={styles.listTitle}>Расписание</h2>
                  <div className={styles.list}>
                    {scheduleSplavy.map((splav) => {
                      const routeImage = getRoutePhoto(splav.river);

                      return (
                        <article key={splav.id} className={styles.listItem}>
                          <div className={styles.listItemMain}>
                            {routeImage && (
                              <div className={styles.listThumbWrap}>
                                <img
                                  src={routeImage}
                                  alt={`Пейзаж маршрута ${splav.title}`}
                                  className={styles.listThumb}
                                  loading="lazy"
                                />
                              </div>
                            )}
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
