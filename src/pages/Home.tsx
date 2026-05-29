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
          )}
        </section>
      </main>
      {activeSplav && (
        <BookingModal splav={activeSplav} opened={opened} onClose={close} />
      )}
    </>
  );
}
