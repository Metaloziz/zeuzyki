import { useState } from "react";
import { Modal, Title } from "@mantine/core";
import type { RaceDetail } from "../../pages/F1Schedule";
import styles from "./RaceDetailModal.module.css";

interface RaceDetailModalProps {
  race: RaceDetail | null;
  opened: boolean;
  onClose: () => void;
}

const statusLabel: Record<string, string> = {
  completed: "Завершён",
  canceled: "Отменён",
  next: "Следующий",
  upcoming: "Предстоит",
};

const statusClass: Record<string, string> = {
  completed: styles.statusCompleted,
  canceled: styles.statusCanceled,
  next: styles.statusNext,
  upcoming: styles.statusUpcoming,
};

const medals = ["🥇", "🥈", "🥉"];

function TrackImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div className={styles.trackFallback}>
        <span className={styles.trackFallbackIcon}>🏎️</span>
        <span>Схема трассы недоступна</span>
      </div>
    );
  }

  return (
    <img
      className={styles.trackImage}
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export function RaceDetailModal({
  race,
  opened,
  onClose,
}: RaceDetailModalProps) {
  if (!race) return null;

  const isCanceled = race.status === "canceled";

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Title order={3} style={{ fontSize: 18, fontWeight: 700 }}>
          {race.flag} {race.name}
        </Title>
      }
      centered
      size="lg"
      radius="md"
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
    >
      <div className={styles.modalBody}>
        {/* Track layout */}
        <div className={styles.trackImageWrap}>
          <TrackImage
            src={race.trackImage}
            alt={`Схема трассы — ${race.circuit}`}
          />
          <span className={styles.trackLabel}>{race.circuit}</span>
        </div>

        {/* Header */}
        <div className={styles.header}>
          <span className={styles.headerFlag}>{race.flag}</span>
          <div className={styles.headerInfo}>
            <h2 className={styles.raceName}>{race.name}</h2>
            <p className={styles.circuitName}>{race.circuit}</p>
            <span
              className={`${styles.statusBadge} ${statusClass[race.status]}`}
            >
              {statusLabel[race.status]}
            </span>
            {race.isSprint && (
              <span className={styles.sprintBadge}>⚡ Спринт</span>
            )}
          </div>
        </div>

        {/* Canceled state */}
        {isCanceled && (
          <div className={styles.canceledNotice}>
            <div className={styles.canceledIcon}>🚫</div>
            <p className={styles.canceledText}>Гонка отменена</p>
            <p className={styles.canceledSub}>
              Этот этап был исключён из календаря 2026 года
            </p>
          </div>
        )}

        {/* Stats */}
        {!isCanceled && (
          <>
            <div className={styles.statsGrid}>
              <div className={styles.statCell}>
                <span className={styles.statLabel}>Дата</span>
                <span className={styles.statValue}>{race.date}</span>
              </div>
              <div className={styles.statCell}>
                <span className={styles.statLabel}>Круг</span>
                <span className={styles.statValue}>
                  {race.trackLength} км
                </span>
              </div>
              <div className={styles.statCell}>
                <span className={styles.statLabel}>Кругов</span>
                <span className={styles.statValue}>{race.laps}</span>
              </div>
              <div className={styles.statCell}>
                <span className={styles.statLabel}>Дистанция</span>
                <span className={styles.statValue}>
                  {race.raceDistance} км
                </span>
              </div>
              <div className={styles.statCell}>
                <span className={styles.statLabel}>Первый ГП</span>
                <span className={styles.statValue}>{race.firstGP}</span>
              </div>
              <div className={styles.statCell}>
                <span className={styles.statLabel}>Зоны DRS</span>
                <span className={styles.statValue}>{race.drsZones}</span>
              </div>
            </div>

            {/* Lap record */}
            {race.lapRecord && (
              <div className={styles.lapRecord}>
                <span className={styles.lapRecordIcon}>⏱️</span>
                <div className={styles.lapRecordInfo}>
                  <span className={styles.lapRecordLabel}>Рекорд круга</span>
                  <span className={styles.lapRecordValue}>
                    {race.lapRecord.time}
                  </span>
                  <span className={styles.lapRecordDriver}>
                    {race.lapRecord.driver} ({race.lapRecord.year})
                  </span>
                </div>
              </div>
            )}

            {/* Description */}
            {race.description && (
              <p className={styles.description}>{race.description}</p>
            )}

            {/* Podium */}
            {race.podium && (
              <div className={styles.podiumSection}>
                <h4 className={styles.sectionTitle}>Результаты гонки</h4>
                <ul className={styles.podiumList}>
                  {race.podium.map((entry, i) => (
                    <li key={i} className={styles.podiumItem}>
                      <span className={styles.podiumMedal}>{medals[i]}</span>
                      <div className={styles.podiumDriverInfo}>
                        <div className={styles.podiumDriverName}>
                          {entry.driver}
                        </div>
                        <div className={styles.podiumTeam}>{entry.team}</div>
                      </div>
                      {entry.time && (
                        <span className={styles.podiumTime}>{entry.time}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
