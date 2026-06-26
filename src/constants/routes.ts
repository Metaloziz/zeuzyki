export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  CORPORATE: "/corporate",
  FAQ: "/faq",
  SCHEDULE: "/#schedule",
  CONTACTS: "/#contacts",
} as const;

export const NAV_ITEMS = [
  { to: ROUTES.SCHEDULE, label: "Расписание сплавов" },
  { to: ROUTES.CORPORATE, label: "Корпоративные сплавы" },
  { to: ROUTES.FAQ, label: "Популярные вопросы" },
  { to: ROUTES.ABOUT, label: "Про нас" },
  { to: ROUTES.CONTACTS, label: "Контакты" },
] as const;
