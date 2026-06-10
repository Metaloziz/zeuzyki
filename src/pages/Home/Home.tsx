import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Skeleton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { BookingModal } from "@/components/BookingModal";
import { RiverPhotoCarousel } from "@/components/RiverPhotoCarousel";
import { ROUTES } from "@/constants/routes";
import { useFreshnessTracker } from "@/hooks/useFreshnessTracker";
import { useRivers } from "@/hooks/useRivers";
import { useSchedule } from "@/hooks/useSchedule";
import type { River } from "@/types/river";
import type { Splav } from "@/types/splav";
import { formatHumanDate } from "@/utils/format";
import { getRoutePhoto } from "@/utils/routePhotos";
import {
  getSplavCardTitle,
  isCorporateRiver,
  matchSplavToRiver,
  toDateTime,
} from "@/utils/splav";
import styles from "./Home.module.css";

const RIVER_SKELETONS = Array.from({ length: 4 }, (_, index) => index);
const RIVER_DETAIL_SKELETONS = Array.from({ length: 4 }, (_, index) => index);
const SCHEDULE_SKELETONS = Array.from({ length: 5 }, (_, index) => index);

export function Home() {
  const [opened, { open, close }] = useDisclosure(false);
  const [activeRiver, setActiveRiver] = useState<River | null>(null);
  const [preselectedDateId, setPreselectedDateId] = useState<string | null>(
    null,
  );
  const { startCheck, failCheck, completeCheck } = useFreshnessTracker();

  const freshnessOptions = {
    onRefreshStart: startCheck,
    onRefreshError: failCheck,
    onRefreshComplete: completeCheck,
  };

  const {
    rivers,
    loading: riversLoading,
    error: riversError,
  } = useRivers(freshnessOptions);

  const {
    splavy,
    loading,
    error: loadError,
  } = useSchedule(freshnessOptions);

  useEffect(() => {
    setPreselectedDateId((current) =>
      current && splavy.some((item) => item.id === current) ? current : null,
    );
  }, [splavy]);

  const handleBook = (splav: Splav) => {
    const river = rivers.find((item) => matchSplavToRiver(splav, item));

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
      .filter((splav) => matchSplavToRiver(splav, activeRiver))
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
                    <RiverPhotoCarousel
                      riverName={river.river}
                      variant="riverCard"
                    />
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
                          Занять место
                        </button>
                        <Link
                          to={ROUTES.CORPORATE}
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
                        Занять место
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
                                {formatHumanDate(toDateTime(splav))}
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
