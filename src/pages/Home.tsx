import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { Banner, type BannerMode } from '../components/Banner/Banner';
import { BookingModal } from '../components/BookingModal/BookingModal';
import { splavy } from '../mocks/splavy';
import type { Splav } from '../types/splav';

export function Home() {
  const [opened, { open, close }] = useDisclosure(false);
  const [activeSplav, setActiveSplav] = useState<Splav>(splavy[0]);

  const handleBook = (splav: Splav) => {
    setActiveSplav(splav);
    open();
  };

  return (
    <>
      <main id="splavs">
        {splavy.map((splav, idx) => {
          const mode: BannerMode = idx % 2 === 0 ? 'light' : 'dark';
          return (
            <Banner
              key={splav.id}
              splav={splav}
              mode={mode}
              onBook={() => handleBook(splav)}
            />
          );
        })}
      </main>
      <BookingModal splav={activeSplav} opened={opened} onClose={close} />
    </>
  );
}
