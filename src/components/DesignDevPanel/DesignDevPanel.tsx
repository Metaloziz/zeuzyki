import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDesignVersion } from "@/context/DesignVersionContext";
import styles from "./DesignDevPanel.module.css";

interface DesignDevPanelProps {
  year: number;
  className?: string;
}

export function DesignDevPanel({ year, className }: DesignDevPanelProps) {
  const { isModern, setVersion } = useDesignVersion();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    const next = isModern ? "classic" : "modern";
    setVersion(next);
    navigate(next === "modern" ? "/#hero" : "/", { replace: true });
  };

  return (
    <div className={`${styles.wrap} ${className ?? ""}`}>
      <button
        type="button"
        className={styles.copyright}
        aria-label="Параметры отображения сайта"
        onClick={() => setOpen((value) => !value)}
      >
        © {year} ЖЭЎЖЫКІ
      </button>

      {open && (
        <div className={styles.panel} role="group" aria-label="Переключатель дизайна">
          <span className={styles.label}>Новый дизайн</span>
          <button
            type="button"
            className={styles.switch}
            role="switch"
            aria-checked={isModern}
            aria-label="Включить новый дизайн"
            onClick={handleToggle}
          >
            <span className={styles.thumb} />
          </button>
        </div>
      )}
    </div>
  );
}
