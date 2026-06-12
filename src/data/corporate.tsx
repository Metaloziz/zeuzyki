import belarusbankLogo from "@/assets/company-logos/belarusbank.jpg";
import belgosstrakhLogo from "@/assets/company-logos/belgosstrakh.svg";
import gazpromLogo from "@/assets/company-logos/gazprom.svg";
import mtsLogo from "@/assets/company-logos/mts.svg";
import kvalitetLogo from "@/assets/company-logos/kvalitet.png";
import omaLogo from "@/assets/company-logos/oma.png";
import { CORPORATE_RIVER_ID } from "@/constants/rivers";
import { getRoutePhotosByRiverId } from "@/utils/routePhotos";

export const CORPORATE_FEATURES = [
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22,4 12,14.01 9,11.01" />
      </svg>
    ),
    title: "Аккредитация",
    description:
      "Наша деятельность подтверждена государственной аккредитацией.",
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
    title: "Сплав под ключ",
    description:
      "Организуем трансфер, питание, лагерь, баню и развлечения — от вас только заявка.",
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Командный дух",
    description:
      "Укрепите отношения в коллективе и узнайте коллег с новой стороны в неформальной обстановке.",
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Безопасность",
    description:
      "Все маршруты рассчитаны на новичков. Инструктаж, спасательные жилеты и страховка включены.",
  },
];

export const CORPORATE_OPTIONS = [
  {
    id: 1,
    title: "Первый вариант",
    price: 70,
    includes: ["Трёхчасовой сплав по реке"],
  },
  {
    id: 2,
    title: "Второй вариант",
    price: 100,
    includes: [
      "Трёхчасовой сплав по реке",
      "Установка шатра, мебели, мангала и др.",
    ],
  },
  {
    id: 3,
    title: "Третий вариант",
    price: 130,
    includes: [
      "Трёхчасовой сплав по реке",
      "Установка шатра, мебели, мангала и др.",
      "Помощь в организации питания",
    ],
  },
  {
    id: 4,
    title: "Четвёртый вариант",
    price: 240,
    includes: [
      "Однодневный сплав по реке",
      "Установка шатра, мебели, мангала и др.",
      "Помощь в организации питания (обед и ужин)",
    ],
  },
  {
    id: 5,
    title: "Пятый вариант",
    price: 320,
    includes: [
      "Однодневный сплав по реке",
      "Палаточный лагерь и организация ночёвки",
      "Установка шатра, мебели, мангала и др.",
      "Помощь в организации питания (обед, ужин и завтрак)",
    ],
  },
];

const CORPORATE_GALLERY_META = [
  { alt: "Команда на корпоративном сплаве", layout: "wide" as const },
  { alt: "Участники корпоративного сплава на реке", layout: "default" as const },
  { alt: "Корпоративный выезд на байдарках", layout: "tall" as const },
  { alt: "Отдых команды после сплава", layout: "default" as const },
  { alt: "Корпоративный сплав на реке", layout: "default" as const },
  { alt: "Корпоративная команда на байдарках", layout: "default" as const },
];

export const CORPORATE_GALLERY = getRoutePhotosByRiverId(
  CORPORATE_RIVER_ID,
  "Корпоративный сплав",
).map(
  (src, index) => ({
    src,
    alt:
      CORPORATE_GALLERY_META[index]?.alt ??
      `Корпоративный сплав, фото ${index + 1}`,
    layout: CORPORATE_GALLERY_META[index]?.layout ?? ("default" as const),
  }),
);

export const TRUSTED_COMPANIES = [
  { name: "ОМА", logo: omaLogo, variant: "blue" as const },
  { name: "Беларусбанк", logo: belarusbankLogo, variant: "light" as const },
  { name: "Белгосстрах", logo: belgosstrakhLogo, variant: "light" as const },
  { name: "МТС", logo: mtsLogo, variant: "light" as const },
  { name: "Газпром", logo: gazpromLogo, variant: "light" as const },
  { name: "Квалитет", logo: kvalitetLogo, variant: "light" as const },
];
