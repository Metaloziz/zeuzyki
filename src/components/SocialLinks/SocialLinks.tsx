import {
  INSTAGRAM_URL,
  TELEGRAM_URL,
} from "@/constants/contacts";
import instagramIcon from "@/assets/instagramm-icon.png";
import telegramIcon from "@/assets/telegram-icon.svg";

interface SocialLinksProps {
  className?: string;
  linkClassName?: string;
  iconClassName?: string;
}

export function SocialLinks({
  className,
  linkClassName,
  iconClassName,
}: SocialLinksProps) {
  return (
    <div className={className} aria-label="Социальные сети">
      <a
        href={TELEGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClassName}
        aria-label="ЖЭЎЖЫКІ в Telegram"
        title="@zeuzyki_admin"
      >
        <img
          src={telegramIcon}
          alt=""
          aria-hidden="true"
          className={iconClassName}
        />
      </a>
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClassName}
        aria-label="ЖЭЎЖЫКІ в Instagram"
        title="Мы в Instagram"
      >
        <img
          src={instagramIcon}
          alt=""
          aria-hidden="true"
          className={iconClassName}
        />
      </a>
    </div>
  );
}
