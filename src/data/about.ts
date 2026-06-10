import {
  IconCampfire,
  IconShieldCheck,
  IconTent,
  IconUsersGroup,
} from "@tabler/icons-react";
import { createElement } from "react";

export const ABOUT_FEATURES = [
  {
    icon: createElement(IconUsersGroup, { size: 28, stroke: 1.7 }),
    title: "Опытная команда",
    description:
      "Более 10 лет организации походов и сплавов. Инструктора с опытом работы с группами любого уровня подготовки.",
  },
  {
    icon: createElement(IconTent, { size: 28, stroke: 1.7 }),
    title: "Собственная база",
    description:
      "На реке Илия расположена наша база с оборудованными стоянками, шатрами, мангалы, WC и волейбольной площадкой.",
  },
  {
    icon: createElement(IconShieldCheck, { size: 28, stroke: 1.7 }),
    title: "Безопасность",
    description:
      "Все маршруты рассчитаны на новичков и семьи с детьми. Спасательные жилеты, страховка и инструктаж включены.",
  },
  {
    icon: createElement(IconCampfire, { size: 28, stroke: 1.7 }),
    title: "Комфорт на природе",
    description:
      "Уютные костровые зоны, мебель, мангалы, горячий чай и питание на берегу. Всё для приятного отдыха.",
  },
];

export const ABOUT_ROUTES = [
  { name: "р. Илия", distance: "60 км от Минска, 30 км от Молодечно" },
  { name: "р. Вилия", distance: "живописные виды и спокойное течение" },
  { name: "р. Рыбчанка", distance: "тихие воды и лесные пейзажи" },
  { name: "р. Нарочанка", distance: "маршруты выходного дня" },
];
