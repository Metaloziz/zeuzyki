import { useEffect, useState } from "react";
import type { River } from "@/types/river";
import { fetchRivers } from "@/utils/sheetsApi";

interface UseRiversOptions {
  onRefreshStart?: () => void;
  onRefreshComplete?: () => void;
  onRefreshError?: () => void;
  onUpdate?: (items: River[]) => void;
}

export function useRivers(options: UseRiversOptions = {}) {
  const [rivers, setRivers] = useState<River[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const items = await fetchRivers({
          onRefreshStart: options.onRefreshStart,
          onUpdate: (freshItems) => {
            if (!cancelled) {
              setRivers(freshItems);
              options.onUpdate?.(freshItems);
            }
          },
          onRefreshError: options.onRefreshError,
          onRefreshComplete: options.onRefreshComplete,
        });
        if (!cancelled) setRivers(items);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "Не удалось загрузить виды сплавов. Попробуйте позже.",
          );
          setRivers([]);
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

  return { rivers, loading, error };
}
