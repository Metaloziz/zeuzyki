import { useEffect, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { Loader } from "@mantine/core";
import { RaceDetailModal } from "../components/RaceDetailModal/RaceDetailModal";
import { fetchF1Schedule, type ApiRace } from "../lib/f1Api";
import styles from "./F1Schedule.module.css";

type RaceStatus = "completed" | "canceled" | "next" | "upcoming";

interface PodiumEntry {
  driver: string;
  team: string;
  time?: string;
}

export interface RaceDetail {
  round: number;
  name: string;
  circuit: string;
  country: string;
  flag: string;
  date: string;
  status: RaceStatus;
  trackImage: string;
  trackLength: string;
  laps: number;
  raceDistance: string;
  firstGP: number;
  drsZones: number;
  isSprint?: boolean;
  lapRecord?: { time: string; driver: string; year: number };
  description?: string;
  podium?: [PodiumEntry, PodiumEntry, PodiumEntry];
}

/* ────────────────────────────────────────────
 *  Track layout images — F1 media CDN
 * ──────────────────────────────────────────── */
const T = (name: string) =>
  `https://media.formula1.com/image/upload/f_auto/q_auto/v1677245035/content/dam/fom-website/2018-redesign-assets/Track%20702Maps%2016by9/${name}.png`;

/* ────────────────────────────────────────────
 *  Static enrichment data keyed by circuitId
 *  (descriptions, lap records, track stats,
 *   images, flags — stuff the API doesn't have)
 * ──────────────────────────────────────────── */
interface CircuitMeta {
  nameRu: string;
  circuitRu: string;
  flag: string;
  trackImage: string;
  trackLength: string;
  laps: number;
  raceDistance: string;
  firstGP: number;
  drsZones: number;
  lapRecord?: { time: string; driver: string; year: number };
  description?: string;
}

const COUNTRY_FLAGS: Record<string, string> = {
  Australia: "🇦🇺",
  China: "🇨🇳",
  Japan: "🇯🇵",
  Bahrain: "🇧🇭",
  "Saudi Arabia": "🇸🇦",
  USA: "🇺🇸",
  Canada: "🇨🇦",
  Monaco: "🇲🇨",
  Spain: "🇪🇸",
  Austria: "🇦🇹",
  UK: "🇬🇧",
  Belgium: "🇧🇪",
  Hungary: "🇭🇺",
  Netherlands: "🇳🇱",
  Italy: "🇮🇹",
  Azerbaijan: "🇦🇿",
  Singapore: "🇸🇬",
  Mexico: "🇲🇽",
  Brazil: "🇧🇷",
  Qatar: "🇶🇦",
  UAE: "🇦🇪",
};

const CIRCUIT_META: Record<string, CircuitMeta> = {
  albert_park: {
    nameRu: "Гран-при Австралии",
    circuitRu: "Альберт-Парк, Мельбурн",
    flag: "🇦🇺",
    trackImage: T("Australia"),
    trackLength: "5.278",
    laps: 58,
    raceDistance: "306.124",
    firstGP: 1996,
    drsZones: 4,
    lapRecord: { time: "1:20.235", driver: "Ш. Леклер", year: 2024 },
    description:
      "Быстрая уличная трасса вокруг озера Альберт-Парк в Мельбурне. После реконструкции 2022 года стала ещё быстрее с обновлёнными поребриками и расширенными зонами обгона.",
  },
  shanghai: {
    nameRu: "Гран-при Китая",
    circuitRu: "Шанхай Интернешнл",
    flag: "🇨🇳",
    trackImage: T("China"),
    trackLength: "5.451",
    laps: 56,
    raceDistance: "305.066",
    firstGP: 2004,
    drsZones: 2,
    lapRecord: { time: "1:32.238", driver: "М. Шумахер", year: 2004 },
    description:
      "Шанхайская трасса знаменита уникальными поворотами, включая длинный левый вираж в первом секторе. Один из немногих контуров с прямой длиной более 1 км.",
  },
  suzuka: {
    nameRu: "Гран-при Японии",
    circuitRu: "Сузука",
    flag: "🇯🇵",
    trackImage: T("Japan"),
    trackLength: "5.807",
    laps: 53,
    raceDistance: "307.471",
    firstGP: 1987,
    drsZones: 2,
    lapRecord: { time: "1:30.983", driver: "Л. Хэмилтон", year: 2019 },
    description:
      "Легендарная трасса в форме восьмёрки — единственная в календаре F1. «Эски» Сузуки считаются одной из самых сложных серий поворотов в автоспорте.",
  },
  bahrain: {
    nameRu: "Гран-при Бахрейна",
    circuitRu: "Сахир",
    flag: "🇧🇭",
    trackImage: T("Bahrain"),
    trackLength: "5.412",
    laps: 57,
    raceDistance: "308.238",
    firstGP: 2004,
    drsZones: 3,
    lapRecord: { time: "1:31.447", driver: "П. де ла Роса", year: 2005 },
    description: "Ночная гонка в пустыне Сахир.",
  },
  jeddah: {
    nameRu: "Гран-при Саудовской Аравии",
    circuitRu: "Джидда Корниш",
    flag: "🇸🇦",
    trackImage: T("Saudi%20Arabia"),
    trackLength: "6.174",
    laps: 50,
    raceDistance: "308.450",
    firstGP: 2021,
    drsZones: 3,
    lapRecord: { time: "1:30.734", driver: "Л. Хэмилтон", year: 2021 },
    description:
      "Самая быстрая уличная трасса в мире — средняя скорость свыше 250 км/ч.",
  },
  miami: {
    nameRu: "Гран-при Майами",
    circuitRu: "Майами Интернешнл",
    flag: "🇺🇸",
    trackImage: T("Miami"),
    trackLength: "5.412",
    laps: 57,
    raceDistance: "308.326",
    firstGP: 2022,
    drsZones: 3,
    lapRecord: { time: "1:29.708", driver: "М. Ферстаппен", year: 2023 },
    description:
      "Трасса вокруг стадиона Hard Rock в Майами-Гарденс. Яркое шоу под солнцем Флориды с длинной прямой и техничным вторым сектором.",
  },
  villeneuve: {
    nameRu: "Гран-при Канады",
    circuitRu: "Жиль Вильнёв, Монреаль",
    flag: "🇨🇦",
    trackImage: T("Canada"),
    trackLength: "4.361",
    laps: 70,
    raceDistance: "305.270",
    firstGP: 1978,
    drsZones: 2,
    lapRecord: { time: "1:13.078", driver: "В. Боттас", year: 2019 },
    description:
      "Полупостоянная трасса на острове Нотр-Дам в Монреале. Знаменитая «Стена чемпионов» в последнем повороте стала ловушкой для многих лидеров.",
  },
  monaco: {
    nameRu: "Гран-при Монако",
    circuitRu: "Монте-Карло",
    flag: "🇲🇨",
    trackImage: T("Monaco"),
    trackLength: "3.337",
    laps: 78,
    raceDistance: "260.286",
    firstGP: 1950,
    drsZones: 1,
    lapRecord: { time: "1:12.909", driver: "Л. Хэмилтон", year: 2021 },
    description:
      "Жемчужина Формулы 1. Самая узкая, медленная и гламурная трасса в календаре. Обгоны практически невозможны — всё решает квалификация и стратегия.",
  },
  catalunya: {
    nameRu: "Гран-при Барселона-Каталунья",
    circuitRu: "Каталунья, Монтмело",
    flag: "🇪🇸",
    trackImage: T("Spain"),
    trackLength: "4.657",
    laps: 66,
    raceDistance: "307.236",
    firstGP: 1991,
    drsZones: 2,
    lapRecord: { time: "1:18.149", driver: "М. Ферстаппен", year: 2023 },
    description:
      "Классическая трасса для тестов и гонок. Требует идеального баланса болида из-за разнообразия поворотов.",
  },
  red_bull_ring: {
    nameRu: "Гран-при Австрии",
    circuitRu: "Ред Булл Ринг, Шпильберг",
    flag: "🇦🇹",
    trackImage: T("Austria"),
    trackLength: "4.318",
    laps: 71,
    raceDistance: "306.452",
    firstGP: 1970,
    drsZones: 3,
    lapRecord: { time: "1:05.619", driver: "К. Сайнс", year: 2020 },
    description:
      "Короткая, но зрелищная трасса в Штирийских Альпах. Перепады высот и длинные прямые создают отличные условия для обгонов.",
  },
  silverstone: {
    nameRu: "Гран-при Великобритании",
    circuitRu: "Сильверстоун",
    flag: "🇬🇧",
    trackImage: T("Great%20Britain"),
    trackLength: "5.891",
    laps: 52,
    raceDistance: "306.198",
    firstGP: 1950,
    drsZones: 2,
    lapRecord: { time: "1:27.097", driver: "М. Ферстаппен", year: 2020 },
    description:
      "Родина Формулы 1 — именно здесь прошла первая гонка чемпионата мира в 1950 году. Комплекс Маготтс-Бэкеттс-Чэпел — одна из самых захватывающих связок.",
  },
  spa: {
    nameRu: "Гран-при Бельгии",
    circuitRu: "Спа-Франкоршам",
    flag: "🇧🇪",
    trackImage: T("Belgium"),
    trackLength: "7.004",
    laps: 44,
    raceDistance: "308.052",
    firstGP: 1950,
    drsZones: 2,
    lapRecord: { time: "1:46.286", driver: "В. Боттас", year: 2018 },
    description:
      "Легендарная трасса в Арденнских лесах. «О-Руж» и «Радийон» — визитная карточка Спа. Самый длинный контур в календаре.",
  },
  hungaroring: {
    nameRu: "Гран-при Венгрии",
    circuitRu: "Хунгароринг, Будапешт",
    flag: "🇭🇺",
    trackImage: T("Hungary"),
    trackLength: "4.381",
    laps: 70,
    raceDistance: "306.630",
    firstGP: 1986,
    drsZones: 2,
    lapRecord: { time: "1:16.627", driver: "Л. Хэмилтон", year: 2020 },
    description:
      "Извилистая трасса в долине, напоминающая «Монако без стен». Обгоны крайне сложны, а жара Будапешта изнуряет пилотов и шины.",
  },
  zandvoort: {
    nameRu: "Гран-при Нидерландов",
    circuitRu: "Зандворт",
    flag: "🇳🇱",
    trackImage: T("Netherlands"),
    trackLength: "4.259",
    laps: 72,
    raceDistance: "306.587",
    firstGP: 1952,
    drsZones: 2,
    lapRecord: { time: "1:11.097", driver: "Л. Хэмилтон", year: 2024 },
    description:
      "Классическая трасса в дюнах Северного моря. Уникальные профилированные повороты с банкингом 18° делают Зандворт непохожим ни на что другое.",
  },
  monza: {
    nameRu: "Гран-при Италии",
    circuitRu: "Монца",
    flag: "🇮🇹",
    trackImage: T("Italy"),
    trackLength: "5.793",
    laps: 53,
    raceDistance: "306.720",
    firstGP: 1950,
    drsZones: 2,
    lapRecord: { time: "1:21.046", driver: "Р. Баррикелло", year: 2004 },
    description:
      "«Храм скорости» — самая быстрая трасса в календаре F1. Тифози Ferrari создают незабываемую атмосферу.",
  },
  madring: {
    nameRu: "Гран-при Испании (Мадрид)",
    circuitRu: "Мадрид IFEMA",
    flag: "🇪🇸",
    trackImage: T("Spain"),
    trackLength: "5.473",
    laps: 56,
    raceDistance: "306.488",
    firstGP: 2026,
    drsZones: 3,
    description:
      "Совершенно новая трасса в Мадриде! Построена рядом с выставочным комплексом IFEMA. Дебютирует в календаре Формулы 1 в 2026 году.",
  },
  baku: {
    nameRu: "Гран-при Азербайджана",
    circuitRu: "Баку Сити",
    flag: "🇦🇿",
    trackImage: T("Azerbaijan"),
    trackLength: "6.003",
    laps: 51,
    raceDistance: "306.049",
    firstGP: 2016,
    drsZones: 2,
    lapRecord: { time: "1:43.009", driver: "Ш. Леклер", year: 2019 },
    description:
      "Уличная трасса вдоль набережной Каспия со знаменитым узким проездом через Старый город. Самая длинная прямая в F1 (2.2 км).",
  },
  marina_bay: {
    nameRu: "Гран-при Сингапура",
    circuitRu: "Марина Бэй",
    flag: "🇸🇬",
    trackImage: T("Singapore"),
    trackLength: "4.940",
    laps: 62,
    raceDistance: "306.143",
    firstGP: 2008,
    drsZones: 3,
    lapRecord: { time: "1:35.867", driver: "Л. Хэмилтон", year: 2023 },
    description:
      "Первая ночная гонка в истории F1. Уличная трасса в сердце Сингапура при свете прожекторов.",
  },
  americas: {
    nameRu: "Гран-при США",
    circuitRu: "COTA, Остин",
    flag: "🇺🇸",
    trackImage: T("USA"),
    trackLength: "5.513",
    laps: 56,
    raceDistance: "308.405",
    firstGP: 2012,
    drsZones: 2,
    lapRecord: { time: "1:36.169", driver: "Ш. Леклер", year: 2019 },
    description:
      "Circuit of the Americas — первая специально построенная трасса F1 в США. Подъём на 40 метров в первом повороте.",
  },
  rodriguez: {
    nameRu: "Гран-при Мексики",
    circuitRu: "Автодром Эрманос Родригес",
    flag: "🇲🇽",
    trackImage: T("Mexico"),
    trackLength: "4.304",
    laps: 71,
    raceDistance: "305.354",
    firstGP: 1963,
    drsZones: 3,
    lapRecord: { time: "1:17.774", driver: "В. Боттас", year: 2021 },
    description:
      "Трасса на высоте 2240 метров — самая высокогорная в календаре. Стадион в последнем секторе — невероятная атмосфера!",
  },
  interlagos: {
    nameRu: "Гран-при Бразилии",
    circuitRu: "Интерлагос, Сан-Паулу",
    flag: "🇧🇷",
    trackImage: T("Brazil"),
    trackLength: "4.309",
    laps: 71,
    raceDistance: "305.879",
    firstGP: 1973,
    drsZones: 2,
    lapRecord: { time: "1:10.540", driver: "В. Боттас", year: 2018 },
    description:
      "Легендарная контрчасовая трасса Интерлагос. Перепады высот, непредсказуемая погода и бразильские болельщики делают каждую гонку незабываемой.",
  },
  vegas: {
    nameRu: "Гран-при Лас-Вегаса",
    circuitRu: "Лас-Вегас Стрип",
    flag: "🇺🇸",
    trackImage: T("Las%20Vegas"),
    trackLength: "6.201",
    laps: 50,
    raceDistance: "310.050",
    firstGP: 2023,
    drsZones: 2,
    lapRecord: { time: "1:35.490", driver: "О. Пиастри", year: 2024 },
    description:
      "Ночная гонка по знаменитому Стрипу Лас-Вегаса! Неоновые огни, казино и болиды F1 мчатся мимо.",
  },
  losail: {
    nameRu: "Гран-при Катара",
    circuitRu: "Лусаил",
    flag: "🇶🇦",
    trackImage: T("Qatar"),
    trackLength: "5.380",
    laps: 57,
    raceDistance: "306.660",
    firstGP: 2021,
    drsZones: 2,
    lapRecord: { time: "1:24.319", driver: "М. Ферстаппен", year: 2023 },
    description:
      "Скоростная трасса в пустыне Катара. Ночное освещение создаёт атмосферу ближневосточной роскоши.",
  },
  yas_marina: {
    nameRu: "Гран-при Абу-Даби",
    circuitRu: "Яс Марина",
    flag: "🇦🇪",
    trackImage: T("Abu%20Dhabi"),
    trackLength: "5.281",
    laps: 58,
    raceDistance: "306.183",
    firstGP: 2009,
    drsZones: 2,
    lapRecord: { time: "1:26.103", driver: "М. Ферстаппен", year: 2021 },
    description:
      "Финал сезона! Гонка на закате — стартует при дневном свете и заканчивается под звёздами.",
  },
};

/* ────────────────────────────────────────────
 *  Merge API data with static enrichment
 * ──────────────────────────────────────────── */

function formatDateRu(iso: string): string {
  const d = new Date(iso + "T12:00:00Z");
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

function mergeRaces(apiRaces: ApiRace[]): RaceDetail[] {
  return apiRaces.map((api) => {
    const meta = CIRCUIT_META[api.circuitId];
    const flag = meta?.flag ?? COUNTRY_FLAGS[api.country] ?? "🏁";

    return {
      round: api.round,
      name: meta?.nameRu ?? api.raceName,
      circuit: meta?.circuitRu ?? api.circuitName,
      country: api.country,
      flag,
      date: formatDateRu(api.date),
      status: api.status,
      trackImage: meta?.trackImage ?? "",
      trackLength: meta?.trackLength ?? "—",
      laps: meta?.laps ?? 0,
      raceDistance: meta?.raceDistance ?? "—",
      firstGP: meta?.firstGP ?? 0,
      drsZones: meta?.drsZones ?? 0,
      isSprint: api.isSprint,
      lapRecord: meta?.lapRecord,
      description: meta?.description,
      podium: api.podium,
    };
  });
}

/* ────────────────────────────────────────────
 *  UI Components
 * ──────────────────────────────────────────── */

const statusLabel: Record<RaceStatus, string> = {
  completed: "Завершён",
  canceled: "Отменён",
  next: "Следующий",
  upcoming: "Предстоит",
};

const statusClass: Record<RaceStatus, string> = {
  completed: styles.completed,
  canceled: styles.canceledStatus,
  next: styles.next,
  upcoming: styles.upcoming,
};

const positionMedals = ["🥇", "🥈", "🥉"];

function RaceCard({
  race,
  onClick,
}: {
  race: RaceDetail;
  onClick: () => void;
}) {
  const isCanceled = race.status === "canceled";

  return (
    <article
      className={styles.card}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div
        className={`${styles.cardStripe}${isCanceled ? ` ${styles.canceled}` : ""}`}
      />
      <div className={styles.cardBody}>
        <div className={styles.cardHeader}>
          <span
            className={`${styles.roundBadge}${isCanceled ? ` ${styles.canceledBadge}` : ""}`}
          >
            {race.round}
          </span>
          <div className={styles.cardTitleWrap}>
            <h3 className={styles.raceName}>{race.name}</h3>
            <p className={styles.circuit}>{race.circuit}</p>
          </div>
          <span className={styles.flag} role="img" aria-label={race.country}>
            {race.flag}
          </span>
        </div>

        <div className={styles.cardMeta}>
          <span className={styles.date}>{race.date}</span>
          <span className={`${styles.statusBadge} ${statusClass[race.status]}`}>
            {statusLabel[race.status]}
          </span>
        </div>

        {race.podium && (
          <div className={styles.podium}>
            <p className={styles.podiumTitle}>Подиум</p>
            <ul className={styles.podiumList}>
              {race.podium.map((entry, i) => (
                <li key={i} className={styles.podiumItem}>
                  <span>{positionMedals[i]}</span>
                  <span className={styles.podiumDriver}>{entry.driver}</span>
                  <span className={styles.podiumTeam}>({entry.team})</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}

/* ────────────────────────────────────────────
 *  Page component
 * ──────────────────────────────────────────── */

export function F1Schedule() {
  const [opened, { open, close }] = useDisclosure(false);
  const [activeRace, setActiveRace] = useState<RaceDetail | null>(null);
  const [races, setRaces] = useState<RaceDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const apiRaces = await fetchF1Schedule();
        if (!cancelled) {
          setRaces(mergeRaces(apiRaces));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Не удалось загрузить данные",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const completedCount = races.filter((r) => r.status === "completed").length;
  const totalActive = races.filter((r) => r.status !== "canceled").length;

  const handleCardClick = (race: RaceDetail) => {
    setActiveRace(race);
    open();
  };

  return (
    <>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Расписание <span className={styles.heroAccent}>F1</span> 2026
        </h1>
        <p className={styles.heroSub}>
          {loading
            ? "Загрузка актуальных данных…"
            : `${completedCount} из ${totalActive} гонок завершено · ${totalActive} Гран-при`}
        </p>
      </section>

      <section className={styles.section}>
        {loading && (
          <div className={styles.loaderWrap}>
            <Loader color="#e10600" size="lg" />
          </div>
        )}

        {error && (
          <div className={styles.errorWrap}>
            <p className={styles.errorText}>⚠️ {error}</p>
            <button
              className={styles.retryBtn}
              onClick={() => window.location.reload()}
            >
              Попробовать снова
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className={styles.grid}>
            {races.map((race) => (
              <RaceCard
                key={race.round}
                race={race}
                onClick={() => handleCardClick(race)}
              />
            ))}
          </div>
        )}
      </section>

      <RaceDetailModal race={activeRace} opened={opened} onClose={close} />
    </>
  );
}
