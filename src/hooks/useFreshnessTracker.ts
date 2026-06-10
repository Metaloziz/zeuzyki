import { useCallback, useRef, useState } from "react";

export type FreshnessStatus = "idle" | "checking" | "success";

export function useFreshnessTracker() {
  const stateRef = useRef({ pending: 0, failed: false });
  const [status, setStatus] = useState<FreshnessStatus>("idle");

  const startCheck = useCallback(() => {
    if (stateRef.current.pending === 0) {
      stateRef.current.failed = false;
    }
    stateRef.current.pending += 1;
    setStatus("checking");
  }, []);

  const failCheck = useCallback(() => {
    stateRef.current.failed = true;
  }, []);

  const completeCheck = useCallback(() => {
    stateRef.current.pending = Math.max(0, stateRef.current.pending - 1);

    if (stateRef.current.pending === 0) {
      setStatus(stateRef.current.failed ? "idle" : "success");
    }
  }, []);

  return { status, startCheck, failCheck, completeCheck };
}
