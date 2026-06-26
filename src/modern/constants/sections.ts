export const SECTION_IDS = {
  hero: "hero",
  routes: "routes",
  schedule: "schedule",
  corporate: "corporate",
  about: "about",
  faq: "faq",
  contacts: "contacts",
} as const;

export type SectionId = (typeof SECTION_IDS)[keyof typeof SECTION_IDS];

export const MODERN_NAV_ITEMS: { id: SectionId; label: string }[] = [
  { id: SECTION_IDS.routes, label: "Маршруты" },
  { id: SECTION_IDS.schedule, label: "Расписание" },
  { id: SECTION_IDS.corporate, label: "Корпоратив" },
  { id: SECTION_IDS.about, label: "О нас" },
  { id: SECTION_IDS.faq, label: "Вопросы" },
  { id: SECTION_IDS.contacts, label: "Контакты" },
];
