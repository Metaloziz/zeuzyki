import { useCallback, useEffect, useState } from "react";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import {
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  PHONE_DISPLAY,
  TELEGRAM_HANDLE,
  TELEGRAM_URL,
} from "@/constants/contacts";
import styles from "./ContactInfoRow.module.css";

const COPY_RESET_MS = 2000;

async function writeClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

interface ContactInfoRowProps {
  label: string;
  value: string;
  copyText: string;
  href?: string;
  linkClassName?: string;
}

function ContactInfoRow({
  label,
  value,
  copyText,
  href,
  linkClassName,
}: ContactInfoRowProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await writeClipboard(copyText);
      setCopied(true);
    } catch {
      // ignore clipboard errors
    }
  }, [copyText]);

  useEffect(() => {
    if (!copied) return;

    const timer = window.setTimeout(() => setCopied(false), COPY_RESET_MS);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const labelLower = label.toLowerCase();

  return (
    <div className={styles.row}>
      {href ? (
        <a href={href} className={[styles.text, linkClassName].filter(Boolean).join(" ")}>
          {label}: {value}
        </a>
      ) : (
        <span
          className={[styles.text, styles.plainText, linkClassName]
            .filter(Boolean)
            .join(" ")}
        >
          {label}: {value}
        </span>
      )}
      <button
        type="button"
        className={styles.copyButton}
        onClick={handleCopy}
        aria-label={
          copied ? `${label} скопирован` : `Скопировать ${labelLower}`
        }
      >
        {copied ? (
          <IconCheck size={16} stroke={2.2} aria-hidden="true" />
        ) : (
          <IconCopy size={16} stroke={2.2} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

interface FooterContactsProps {
  linkClassName?: string;
}

export function FooterContacts({ linkClassName }: FooterContactsProps) {
  return (
    <div className={styles.list}>
      <ContactInfoRow
        label="Телефон"
        value={PHONE_DISPLAY}
        copyText={PHONE_DISPLAY}
        linkClassName={linkClassName}
      />
      <ContactInfoRow
        label="Telegram"
        value={TELEGRAM_HANDLE}
        copyText={TELEGRAM_HANDLE}
        href={TELEGRAM_URL}
        linkClassName={linkClassName}
      />
      <ContactInfoRow
        label="Instagram"
        value={INSTAGRAM_HANDLE}
        copyText={INSTAGRAM_HANDLE}
        href={INSTAGRAM_URL}
        linkClassName={linkClassName}
      />
    </div>
  );
}
