import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type DesignVersion = "classic" | "modern";

const STORAGE_KEY = "zeuzyki:design-version";

interface DesignVersionContextValue {
  version: DesignVersion;
  setVersion: (version: DesignVersion) => void;
  toggleVersion: () => void;
  isModern: boolean;
}

const DesignVersionContext = createContext<DesignVersionContextValue | null>(
  null,
);

function readStoredVersion(): DesignVersion {
  if (typeof window === "undefined") return "modern";

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "classic" ? "classic" : "modern";
  } catch {
    return "modern";
  }
}

export function DesignVersionProvider({ children }: { children: ReactNode }) {
  const [version, setVersionState] = useState<DesignVersion>(readStoredVersion);

  const setVersion = useCallback((next: DesignVersion) => {
    setVersionState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggleVersion = useCallback(() => {
    setVersion(version === "modern" ? "classic" : "modern");
  }, [setVersion, version]);

  useEffect(() => {
    document.documentElement.dataset.designVersion = version;
  }, [version]);

  return (
    <DesignVersionContext.Provider
      value={{
        version,
        setVersion,
        toggleVersion,
        isModern: version === "modern",
      }}
    >
      {children}
    </DesignVersionContext.Provider>
  );
}

export function useDesignVersion(): DesignVersionContextValue {
  const ctx = useContext(DesignVersionContext);
  if (!ctx) {
    throw new Error("useDesignVersion must be used within DesignVersionProvider");
  }
  return ctx;
}
