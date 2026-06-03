import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Alert, Loader, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { BookingModal } from "../components/BookingModal/BookingModal";
import { formatDateRangeFull } from "../lib/format";
import { fetchSchedule } from "../lib/sheetsApi";
import type { River } from "../types/river";
import type { Splav } from "../types/splav";
import styles from "./SplavDetails.module.css";

export function SplavDetails() {
  const { id } = useParams<{ id: string }>();
  const [splav, setSplav] = useState<Splav | null>(null);
  const [splavy, setSplavy] = useState<Splav[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingFreshness, setCheckingFreshness] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [stickyVisible, setStickyVisible] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadError(null);

      try {
        const items = await fetchSchedule({
          onRefreshStart: () => {
            if (!cancelled) setCheckingFreshness(true);
          },
          onUpdate: (freshItems) => {
            if (!cancelled) {
              setSplavy(freshItems);
              setSplav(freshItems.find((item) => item.id === id) ?? null);
            }
          },
          onRefreshComplete: () => {
            if (!cancelled) setCheckingFreshness(false);
          },
        });
        const found = items.find((item) => item.id === id) ?? null;
        if (!cancelled) {
          setSplavy(items);
          setSplav(found);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(
            e instanceof Error
              ? e.message
              : "Не удалось загрузить данные сплава",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <Stack align="center" gap="xs">
            <Loader size="sm" />
            <Text size="sm" c="dimmed">
              Загружаем сплав…
            </Text>
          </Stack>
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <Alert color="red" variant="light" title="Ошибка загрузки">
            {loadError}
          </Alert>
        </div>
      </main>
    );
  }

  if (!splav) {
    return <Navigate to="/" replace />;
  }

  const paragraphs = splav.longDescription.split("\n\n");
  const bookingRiver: River = {
    id: splav.riverId,
    river: splav.river,
    distance: "",
    time: "",
    price: `${splav.price} рублей`,
    kidsPrice: "",
    description: "",
  };
  const bookingDates = splavy.filter((item) =>
    splav.riverId ? item.riverId === splav.riverId : item.river === splav.river,
  );

  return (
    <>
      <article className={styles.page}>
        {/* HERO */}
        <header className={styles.hero}>
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={styles.heroInner}>
            <Link to="/" className={styles.back}>
              <span aria-hidden="true">‹</span> Все сплавы
            </Link>

            {checkingFreshness && (
              <div
                className={styles.refreshNotice}
                role="status"
                aria-live="polite"
              >
                <Loader size="xs" color="cyan" />
                <span>Проверка актуальности</span>
              </div>
            )}

            <p className={styles.eyebrow}>
              {formatDateRangeFull(splav.startDate, splav.endDate)} ·{" "}
              {splav.durationDays} дня
            </p>
            <h1 className={styles.title}>{splav.title}</h1>
            <p className={styles.subtitle}>{splav.shortDescription}</p>

            <div className={styles.heroMeta}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Цена</span>
                <span className={styles.metaValue}>{splav.price} рублей</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Свободно</span>
                <span className={styles.metaValue}>
                  {splav.seatsLeft}{" "}
                  <span className={styles.metaTotal}>/ {splav.seatsTotal}</span>
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Сложность</span>
                <span className={styles.metaValue}>{splav.difficulty}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Река</span>
                <span className={styles.metaValue}>{splav.river}</span>
              </div>
            </div>

            <button type="button" className={styles.heroCta} onClick={open}>
              Записаться на сплав
            </button>
          </div>
        </header>

        {/* ABOUT */}
        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Подробно</h2>
            <div className={styles.prose}>
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </section>

        {/* ROUTE */}
        <section className={`${styles.section} ${styles.sectionDark}`}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Маршрут</h2>
            <p className={styles.routeText}>{splav.route}</p>
          </div>
        </section>

        {/* PROGRAM */}
        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Программа по дням</h2>
            <ol className={styles.program}>
              {splav.program.map((day) => (
                <li key={day.day} className={styles.programDay}>
                  <div className={styles.programDayBadge}>День {day.day}</div>
                  <div className={styles.programDayContent}>
                    <h3 className={styles.programDayTitle}>{day.title}</h3>
                    <p className={styles.programDayDescription}>
                      {day.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* INCLUDES */}
        <section className={`${styles.section} ${styles.sectionDark}`}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Что входит в стоимость</h2>
            <ul className={styles.includes}>
              {splav.includes.map((item, i) => (
                <li key={i} className={styles.includeItem}>
                  <span className={styles.includeCheck} aria-hidden="true">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className={styles.finalCta}>
          <div className={styles.container}>
            <h2 className={styles.finalCtaTitle}>Готовы в путь?</h2>
            <p className={styles.finalCtaText}>
              Места уходят быстро. Сейчас свободно {splav.seatsLeft} из{" "}
              {splav.seatsTotal}.
            </p>
            <button
              type="button"
              className={styles.finalCtaButton}
              onClick={() => {
                setStickyVisible(false);
                open();
              }}
            >
              Записаться
            </button>
          </div>
        </section>
      </article>

      {/* STICKY BAR (mobile) */}
      {stickyVisible && (
        <div className={styles.sticky}>
          <div className={styles.stickyInfo}>
            <span className={styles.stickyPrice}>{splav.price} рублей</span>
            <span className={styles.stickySeats}>
              осталось {splav.seatsLeft} мест
            </span>
          </div>
          <button type="button" className={styles.stickyButton} onClick={open}>
            Записаться
          </button>
        </div>
      )}

      <BookingModal
        river={bookingRiver}
        dates={bookingDates}
        preselectedDateId={splav.id}
        opened={opened}
        onClose={() => {
          close();
          setStickyVisible(true);
        }}
      />
    </>
  );
}
