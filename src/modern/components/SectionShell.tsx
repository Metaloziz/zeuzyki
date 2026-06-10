import type { ReactNode } from "react";
import type { SectionId } from "@/modern/constants/sections";
import styles from "./SectionShell.module.css";

interface SectionShellProps {
  id: SectionId;
  className?: string;
  children: ReactNode;
  dark?: boolean;
  fullBleed?: boolean;
}

export function SectionShell({
  id,
  className,
  children,
  dark = false,
  fullBleed = false,
}: SectionShellProps) {
  return (
    <section
      id={id}
      className={`${styles.section} ${dark ? styles.dark : ""} ${
        fullBleed ? styles.fullBleed : ""
      } ${className ?? ""}`}
    >
      {children}
    </section>
  );
}
