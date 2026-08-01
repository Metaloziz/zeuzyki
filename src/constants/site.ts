export const SITE_URL = (
  import.meta.env.VITE_SITE_URL ?? "https://zeuzyki.by"
).replace(/\/$/, "");

export const SITE_NAME = "ЖЭЎЖЫКІ";

export const SITE_DEFAULT_TITLE =
  "Байдарки Минск — сплавы ЖЭЎЖЫКІ | аренда и маршруты";

export const SITE_DEFAULT_DESCRIPTION =
  "Сплавы на байдарках из Минска: сборные и корпоративные маршруты на р. Илия (60 км). Новичкам и семьям, инструктаж, жилеты, чай на финише. Запись онлайн.";

export const SITE_OG_IMAGE_PATH = "/og-image.jpg";

export const SITE_LOCALE = "ru_BY";

export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized === "/" ? "/" : normalized}`;
}
