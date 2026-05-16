import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { SplavCard } from "../components/SplavCard/SplavCard";
import { BookingModal } from "../components/BookingModal/BookingModal";
import { splavy } from "../mocks/splavy";
import type { Splav } from "../types/splav";
import styles from "./Home.module.css";

export function Home() {
  const [opened, { open, close }] = useDisclosure(false);
  const [activeSplav, setActiveSplav] = useState<Splav | null>(
    splavy[0] ?? null,
  );

  const handleBook = (splav: Splav) => {
    setActiveSplav(splav);
    open();
  };

  if (splavy.length === 0) {
    return (
      <main className={styles.empty}>
        <div>
          <h2 className={styles.emptyTitle}>Сезон закрыт</h2>
          <p className={styles.emptyText}>
            Новые даты появятся, как только их добавят в форму записи.
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <main>
        <section className={styles.section}>
          <h1 className={styles.sectionTitle}>Выбери свой вариант маршрута</h1>
          <div className={styles.grid}>
            {splavy.map((splav, idx) => (
              <SplavCard
                key={splav.id}
                splav={splav}
                index={idx}
                onBook={() => handleBook(splav)}
              />
            ))}
          </div>
        </section>
      </main>
      {activeSplav && (
        <BookingModal splav={activeSplav} opened={opened} onClose={close} />
      )}
    </>
  );
}
