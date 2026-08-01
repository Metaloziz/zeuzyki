import {
  SITE_DEFAULT_DESCRIPTION,
  SITE_DEFAULT_TITLE,
  SITE_NAME,
  absoluteUrl,
} from "@/constants/site";
import { ROUTES } from "@/constants/routes";

export type PageSeo = {
  title: string;
  description: string;
  path: string;
};

export const HOME_SEO: PageSeo = {
  title: SITE_DEFAULT_TITLE,
  description: SITE_DEFAULT_DESCRIPTION,
  path: ROUTES.HOME,
};

export const ABOUT_SEO: PageSeo = {
  title: `Про нас — ${SITE_NAME} | байдарки недалеко от Минска`,
  description:
    "ЖЭЎЖЫКІ — сплавы на байдарках недалеко от Минска: база на р. Илия (60 км), маршруты для новичков и семей. Более 10 лет опыта.",
  path: ROUTES.ABOUT,
};

export const CORPORATE_SEO: PageSeo = {
  title: `Корпоративные байдарки Минск — сплавы под ключ | ${SITE_NAME}`,
  description:
    "Корпоративные сплавы на байдарках из Минска: трансфер, питание, база на р. Илия. Тимбилдинг на воде для команд любого уровня.",
  path: ROUTES.CORPORATE,
};

export const FAQ_SEO: PageSeo = {
  title: `Вопросы о сплавах — ${SITE_NAME} | байдарки Минск`,
  description:
    "Что взять на сплав, подойдёт ли новичкам и семьям с детьми, какие байдарки и как проходит маршрут — ответы ЖЭЎЖЫКІ.",
  path: ROUTES.FAQ,
};

export const NOT_FOUND_SEO: PageSeo = {
  title: `Страница не найдена — ${SITE_NAME}`,
  description: SITE_DEFAULT_DESCRIPTION,
  path: "/404",
};

export function pageCanonical(path: string): string {
  return absoluteUrl(path);
}
