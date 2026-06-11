import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./V2Button.module.css";

type V2ButtonVariant = "primary" | "secondary";

interface V2ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: V2ButtonVariant;
  onDark?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  loadingLabel?: ReactNode;
  /** Постоянная «водная» анимация как при hover */
  waterAlways?: boolean;
  children: ReactNode;
}

export function V2Button({
  variant = "primary",
  onDark = false,
  fullWidth = false,
  loading = false,
  loadingLabel = "Отправляем…",
  waterAlways = false,
  children,
  className,
  type = "button",
  disabled,
  ...props
}: V2ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={[
        styles.root,
        styles[variant],
        onDark ? styles.onDark : "",
        fullWidth ? styles.fullWidth : "",
        loading ? styles.loading : "",
        waterAlways ? styles.waterAlways : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <span className={styles.water} aria-hidden="true" />
      <span className={styles.label}>{loading ? loadingLabel : children}</span>
    </button>
  );
}
