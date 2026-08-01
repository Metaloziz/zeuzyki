import { useEffect, useMemo, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { BookingModal } from "@/components/BookingModal";
import { useFreshnessTracker } from "@/hooks/useFreshnessTracker";
import { useRivers } from "@/hooks/useRivers";
import { useSchedule } from "@/hooks/useSchedule";
import type { River } from "@/types/river";
import type { Splav } from "@/types/splav";
import { matchSplavToRiver, toDateTime } from "@/utils/splav";
import { SectionNavProvider } from "@/modern/hooks/useSectionNav";
import { ModernHeader } from "@/modern/layout/ModernHeader";
import { ModernFooter } from "@/modern/layout/ModernFooter";
import { HeroSection } from "@/modern/sections/HeroSection";
import { RoutesSection } from "@/modern/sections/RoutesSection";
import { ScheduleSection } from "@/modern/sections/ScheduleSection";
import { CorporateSection } from "@/modern/sections/CorporateSection";
import { AboutSection } from "@/modern/sections/AboutSection";
import { FaqSection } from "@/modern/sections/FaqSection";
import { PageMeta } from "@/seo/PageMeta";
import { buildHomeJsonLd } from "@/seo/jsonLd";
import { HOME_SEO } from "@/seo/pages";
import "./modern.css";

const homeJsonLd = buildHomeJsonLd();

export function ModernApp() {
  const [opened, { open, close }] = useDisclosure(false);
  const [activeRiver, setActiveRiver] = useState<River | null>(null);
  const [preselectedDateId, setPreselectedDateId] = useState<string | null>(
    null,
  );
  const { startCheck, failCheck, completeCheck } = useFreshnessTracker();

  const freshnessOptions = useMemo(
    () => ({
      onRefreshStart: startCheck,
      onRefreshError: failCheck,
      onRefreshComplete: completeCheck,
    }),
    [startCheck, failCheck, completeCheck],
  );

  const {
    rivers,
    loading: riversLoading,
    error: riversError,
  } = useRivers(freshnessOptions);

  const {
    splavy,
    loading: scheduleLoading,
    error: scheduleError,
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

  return (
    <SectionNavProvider>
      <PageMeta seo={HOME_SEO} jsonLd={homeJsonLd} />
      <div className="modernRoot">
        <ModernHeader />
        <main>
          <HeroSection />
          <RoutesSection
            rivers={rivers}
            loading={riversLoading}
            error={riversError}
            onRiverBook={handleRiverBook}
          />
          <ScheduleSection
            splavy={splavy}
            loading={scheduleLoading}
            error={scheduleError}
            onBook={handleBook}
          />
          <CorporateSection />
          <AboutSection />
          <FaqSection />
        </main>
        <ModernFooter />
      </div>

      {activeRiver && (
        <BookingModal
          variant="modern"
          river={activeRiver}
          dates={activeRiverDates}
          preselectedDateId={preselectedDateId}
          opened={opened}
          onClose={close}
        />
      )}
    </SectionNavProvider>
  );
}
