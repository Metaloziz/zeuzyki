import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import { BookingModal } from '../components/BookingModal/BookingModal';
import { formatDateRangeFull } from '../lib/format';
import { getSplavById } from '../mocks/splavy';
import styles from './SplavDetails.module.css';

export function SplavDetails() {
  const { id } = useParams<{ id: string }>();
  const splav = id ? getSplavById(Number(id)) : undefined;
  const [opened, { open, close }] = useDisclosure(false);
  const [stickyVisible, setStickyVisible] = useState(true);

  if (!splav) {
    return <Navigate to="/" replace />;
  }

  const paragraphs = splav.longDescription.split('\n\n');

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

            <p className={styles.eyebrow}>
              {formatDateRangeFull(splav.startDate, splav.endDate)} · {splav.durationDays} дня
            </p>
            <h1 className={styles.title}>{splav.title}</h1>
            <p className={styles.subtitle}>{splav.shortDescription}</p>

            <div className={styles.heroMeta}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Цена</span>
                <span className={styles.metaValue}>{splav.price} BYN</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Свободно</span>
                <span className={styles.metaValue}>
                  {splav.seatsLeft} <span className={styles.metaTotal}>/ {splav.seatsTotal}</span>
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
                    <p className={styles.programDayDescription}>{day.description}</p>
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
              Места уходят быстро. Сейчас свободно {splav.seatsLeft} из {splav.seatsTotal}.
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
            <span className={styles.stickyPrice}>{splav.price} BYN</span>
            <span className={styles.stickySeats}>осталось {splav.seatsLeft} мест</span>
          </div>
          <button type="button" className={styles.stickyButton} onClick={open}>
            Записаться
          </button>
        </div>
      )}

      <BookingModal
        splav={splav}
        opened={opened}
        onClose={() => {
          close();
          setStickyVisible(true);
        }}
      />
    </>
  );
}
