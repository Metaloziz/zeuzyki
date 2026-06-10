import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./V2Button.module.css";

type V2ButtonVariant = "primary" | "secondary";

interface V2ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: V2ButtonVariant;
  onDark?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

export function V2Button({
  variant = "primary",
  onDark = false,
  fullWidth = false,
  children,
  className,
  type = "button",
  ...props
}: V2ButtonProps) {
  return (
    <button
      type={type}
      className={[
        styles.root,
        styles[variant],
        onDark ? styles.onDark : "",
        fullWidth ? styles.fullWidth : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
