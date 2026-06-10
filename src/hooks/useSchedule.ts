import { useEffect, useState } from "react";
import type { Splav } from "@/types/splav";
import { fetchSchedule } from "@/utils/sheetsApi";

interface UseScheduleOptions {
  onRefreshStart?: () => void;
  onRefreshComplete?: () => void;
  onRefreshError?: () => void;
  onUpdate?: (items: Splav[]) => void;
}

export function useSchedule(options: UseScheduleOptions = {}) {
  const [splavy, setSplavy] = useState<Splav[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const items = await fetchSchedule({
          onRefreshStart: options.onRefreshStart,
          onUpdate: (freshItems) => {
            if (!cancelled) {
              setSplavy(freshItems);
              options.onUpdate?.(freshItems);
            }
          },
          onRefreshError: options.onRefreshError,
          onRefreshComplete: options.onRefreshComplete,
        });
        if (!cancelled) setSplavy(items);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "Не удалось загрузить расписание. Попробуйте позже.",
          );
          setSplavy([]);
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

  return { splavy, setSplavy, loading, error };
}
