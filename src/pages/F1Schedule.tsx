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

/* ── Track layout images (kept for future use) ── */
const T = (name: string) =>
  `https://media.formula1.com/image/upload/f_auto/q_auto/v1677245035/content/dam/fom-website/2018-redesign-assets/Track%20702Maps%2016by9/${name}.png`;

/* ── Static enrichment ── */
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
  teamColor?: string;
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

const TEAM_COLORS: Record<string, string> = {
  Mercedes: "#00d2be",
  Ferrari: "#dc0000",
  McLaren: "#ff8700",
  "Red Bull": "#3671c6",
  "Aston Martin": "#006f62",
  Alpine: "#0090ff",
  Williams: "#005aff",
  "RB F1 Team": "#6692ff",
  "Haas F1 Team": "#b6babd",
  Audi: "#ff0000",
  "Cadillac F1 Team": "#1d1d1d",
};

const CIRCUIT_META: Record<string, CircuitMeta> = {
  albert_park: {
    nameRu: "Австралия",
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
      "Быстрая уличная трасса вокруг озера Альберт-Парк в Мельбурне.",
  },
  shanghai: {
    nameRu: "Китай",
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
      "Шанхайская трасса знаменита уникальными поворотами, включая длинный левый вираж.",
  },
  suzuka: {
    nameRu: "Япония",
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
      "Легендарная трасса в форме восьмёрки — единственная в календаре F1.",
  },
  bahrain: {
    nameRu: "Бахрейн",
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
    nameRu: "Саудовская Аравия",
    circuitRu: "Джидда Корниш",
    flag: "🇸🇦",
    trackImage: T("Saudi%20Arabia"),
    trackLength: "6.174",
    laps: 50,
    raceDistance: "308.450",
    firstGP: 2021,
    drsZones: 3,
    lapRecord: { time: "1:30.734", driver: "Л. Хэмилтон", year: 2021 },
    description: "Самая быстрая уличная трасса в мире.",
  },
  miami: {
    nameRu: "Майами",
    circuitRu: "Майами Интернешнл",
    flag: "🇺🇸",
    trackImage: T("Miami"),
    trackLength: "5.412",
    laps: 57,
    raceDistance: "308.326",
    firstGP: 2022,
    drsZones: 3,
    lapRecord: { time: "1:29.708", driver: "М. Ферстаппен", year: 2023 },
    description: "Трасса вокруг стадиона Hard Rock в Майами-Гарденс.",
  },
  villeneuve: {
    nameRu: "Канада",
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
      "Полупостоянная трасса на острове Нотр-Дам. «Стена чемпионов» — ловушка для лидеров.",
  },
  monaco: {
    nameRu: "Монако",
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
      "Жемчужина Формулы 1. Самая узкая и гламурная трасса в календаре.",
  },
  catalunya: {
    nameRu: "Барселона",
    circuitRu: "Каталунья, Монтмело",
    flag: "🇪🇸",
    trackImage: T("Spain"),
    trackLength: "4.657",
    laps: 66,
    raceDistance: "307.236",
    firstGP: 1991,
    drsZones: 2,
    lapRecord: { time: "1:18.149", driver: "М. Ферстаппен", year: 2023 },
    description: "Классическая трасса для тестов и гонок.",
  },
  red_bull_ring: {
    nameRu: "Австрия",
    circuitRu: "Ред Булл Ринг, Шпильберг",
    flag: "🇦🇹",
    trackImage: T("Austria"),
    trackLength: "4.318",
    laps: 71,
    raceDistance: "306.452",
    firstGP: 1970,
    drsZones: 3,
    lapRecord: { time: "1:05.619", driver: "К. Сайнс", year: 2020 },
    description: "Короткая, но зрелищная трасса в Штирийских Альпах.",
  },
  silverstone: {
    nameRu: "Великобритания",
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
      "Родина Формулы 1. Комплекс Маготтс-Бэкеттс-Чэпел — захватывающая связка.",
  },
  spa: {
    nameRu: "Бельгия",
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
      "Легендарная трасса в Арденнских лесах. «О-Руж» — визитная карточка Спа.",
  },
  hungaroring: {
    nameRu: "Венгрия",
    circuitRu: "Хунгароринг, Будапешт",
    flag: "🇭🇺",
    trackImage: T("Hungary"),
    trackLength: "4.381",
    laps: 70,
    raceDistance: "306.630",
    firstGP: 1986,
    drsZones: 2,
    lapRecord: { time: "1:16.627", driver: "Л. Хэмилтон", year: 2020 },
    description: "Извилистая трасса в долине — «Монако без стен».",
  },
  zandvoort: {
    nameRu: "Нидерланды",
    circuitRu: "Зандворт",
    flag: "🇳🇱",
    trackImage: T("Netherlands"),
    trackLength: "4.259",
    laps: 72,
    raceDistance: "306.587",
    firstGP: 1952,
    drsZones: 2,
    lapRecord: { time: "1:11.097", driver: "Л. Хэмилтон", year: 2024 },
    description: "Классическая трасса в дюнах с уникальным банкингом 18°.",
  },
  monza: {
    nameRu: "Италия",
    circuitRu: "Монца",
    flag: "🇮🇹",
    trackImage: T("Italy"),
    trackLength: "5.793",
    laps: 53,
    raceDistance: "306.720",
    firstGP: 1950,
    drsZones: 2,
    lapRecord: { time: "1:21.046", driver: "Р. Баррикелло", year: 2004 },
    description: "«Храм скорости» — самая быстрая трасса в календаре F1.",
  },
  madring: {
    nameRu: "Испания (Мадрид)",
    circuitRu: "Мадрид IFEMA",
    flag: "🇪🇸",
    trackImage: T("Spain"),
    trackLength: "5.473",
    laps: 56,
    raceDistance: "306.488",
    firstGP: 2026,
    drsZones: 3,
    description: "Новая трасса в Мадриде! Дебют в F1 в 2026 году.",
  },
  baku: {
    nameRu: "Азербайджан",
    circuitRu: "Баку Сити",
    flag: "🇦🇿",
    trackImage: T("Azerbaijan"),
    trackLength: "6.003",
    laps: 51,
    raceDistance: "306.049",
    firstGP: 2016,
    drsZones: 2,
    lapRecord: { time: "1:43.009", driver: "Ш. Леклер", year: 2019 },
    description: "Уличная трасса с самой длинной прямой в F1 (2.2 км).",
  },
  marina_bay: {
    nameRu: "Сингапур",
    circuitRu: "Марина Бэй",
    flag: "🇸🇬",
    trackImage: T("Singapore"),
    trackLength: "4.940",
    laps: 62,
    raceDistance: "306.143",
    firstGP: 2008,
    drsZones: 3,
    lapRecord: { time: "1:35.867", driver: "Л. Хэмилтон", year: 2023 },
    description: "Первая ночная гонка F1 — при свете прожекторов Сингапура.",
  },
  americas: {
    nameRu: "США",
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
      "Circuit of the Americas — первая трасса F1, построенная специально в США.",
  },
  rodriguez: {
    nameRu: "Мексика",
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
      "Самая высокогорная трасса в календаре — 2240 м над уровнем моря.",
  },
  interlagos: {
    nameRu: "Бразилия",
    circuitRu: "Интерлагос, Сан-Паулу",
    flag: "🇧🇷",
    trackImage: T("Brazil"),
    trackLength: "4.309",
    laps: 71,
    raceDistance: "305.879",
    firstGP: 1973,
    drsZones: 2,
    lapRecord: { time: "1:10.540", driver: "В. Боттас", year: 2018 },
    description: "Легендарная контрчасовая трасса Интерлагос.",
  },
  vegas: {
    nameRu: "Лас-Вегас",
    circuitRu: "Лас-Вегас Стрип",
    flag: "🇺🇸",
    trackImage: T("Las%20Vegas"),
    trackLength: "6.201",
    laps: 50,
    raceDistance: "310.050",
    firstGP: 2023,
    drsZones: 2,
    lapRecord: { time: "1:35.490", driver: "О. Пиастри", year: 2024 },
    description: "Ночная гонка по знаменитому Стрипу Лас-Вегаса.",
  },
  losail: {
    nameRu: "Катар",
    circuitRu: "Лусаил",
    flag: "🇶🇦",
    trackImage: T("Qatar"),
    trackLength: "5.380",
    laps: 57,
    raceDistance: "306.660",
    firstGP: 2021,
    drsZones: 2,
    lapRecord: { time: "1:24.319", driver: "М. Ферстаппен", year: 2023 },
    description: "Скоростная трасса в пустыне Катара.",
  },
  yas_marina: {
    nameRu: "Абу-Даби",
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
      "Финал сезона! Гонка на закате — стартует при свете и заканчивается под звёздами.",
  },
};

/* ── Merge helpers ── */

function formatDateShort(iso: string): string {
  const d = new Date(iso + "T12:00:00Z");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const mon = d.toLocaleDateString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
  return `${day} ${mon}`;
}

function formatDateRu(iso: string): string {
  const d = new Date(iso + "T12:00:00Z");
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
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

/* Enriched row type for rendering table */
interface TableRow {
  race: RaceDetail;
  dateShort: string;
  winnerName: string | null;
  winnerInitial: string;
  teamName: string | null;
  teamColor: string;
  time: string | null;
}

function buildRows(apiRaces: ApiRace[], races: RaceDetail[]): TableRow[] {
  return races.map((race, i) => {
    const api = apiRaces[i];
    const winner = race.podium?.[0];
    const teamColor = winner ? (TEAM_COLORS[winner.team] ?? "#888") : "#888";
    const winnerInitial = winner
      ? winner.driver.replace(/^.+\.\s*/, "").charAt(0)
      : "";
    return {
      race,
      dateShort: formatDateShort(api?.date ?? ""),
      winnerName: winner?.driver ?? null,
      winnerInitial,
      teamName: winner?.team ?? null,
      teamColor,
      time: winner?.time ?? null,
    };
  });
}

/* ── Tab type ── */
type Tab = "results" | "schedule";

/* ── Component ── */

export function F1Schedule() {
  const [opened, { open, close }] = useDisclosure(false);
  const [activeRace, setActiveRace] = useState<RaceDetail | null>(null);
  const [races, setRaces] = useState<RaceDetail[]>([]);
  const [apiRaces, setApiRaces] = useState<ApiRace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("results");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchF1Schedule();
        if (!cancelled) {
          setApiRaces(data);
          setRaces(mergeRaces(data));
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

  const completedRaces = races.filter((r) => r.status === "completed");
  const upcomingRaces = races.filter((r) => r.status !== "completed");

  const completedRows = buildRows(
    apiRaces.filter((a) => completedRaces.some((r) => r.round === a.round)),
    completedRaces,
  );
  const upcomingRows = buildRows(
    apiRaces.filter((a) => upcomingRaces.some((r) => r.round === a.round)),
    upcomingRaces,
  );

  const handleClick = (race: RaceDetail) => {
    setActiveRace(race);
    open();
  };

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          <span className={styles.heroAccent}>F1</span> 2026
        </h1>
        <p className={styles.heroSub}>
          {loading
            ? "Загрузка актуальных данных…"
            : `${completedRaces.length} из ${races.length} гонок завершено`}
        </p>
      </section>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === "results" ? styles.tabActive : ""}`}
          onClick={() => setTab("results")}
        >
          Результаты
        </button>
        <button
          className={`${styles.tab} ${tab === "schedule" ? styles.tabActive : ""}`}
          onClick={() => setTab("schedule")}
        >
          Расписание
        </button>
      </div>

      {/* Content */}
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

        {!loading && !error && tab === "results" && (
          <>
            <h2 className={styles.sectionTitle}>2026 Race Results</h2>
            <ResultsTable rows={completedRows} onClick={handleClick} />
            <MobileList rows={completedRows} onClick={handleClick} />
          </>
        )}

        {!loading && !error && tab === "schedule" && (
          <>
            <h2 className={styles.sectionTitle}>2026 Schedule</h2>
            <ScheduleTable rows={upcomingRows} onClick={handleClick} />
            <MobileScheduleList rows={upcomingRows} onClick={handleClick} />
          </>
        )}
      </section>

      <RaceDetailModal race={activeRace} opened={opened} onClose={close} />
    </div>
  );
}

/* ═══ Desktop: Results Table ═══ */

function ResultsTable({
  rows,
  onClick,
}: {
  rows: TableRow[];
  onClick: (r: RaceDetail) => void;
}) {
  if (rows.length === 0) {
    return (
      <p style={{ color: "rgba(255,255,255,0.4)" }}>
        Пока нет завершённых гонок.
      </p>
    );
  }
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th>Grand Prix</th>
            <th>Date</th>
            <th>Winner</th>
            <th>Team</th>
            <th style={{ textAlign: "center" }}>Laps</th>
            <th style={{ textAlign: "right" }}>Time</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.race.round}
              className={styles.row}
              onClick={() => onClick(row.race)}
            >
              <td>
                <span className={styles.gpCell}>
                  <span className={styles.gpFlag}>{row.race.flag}</span>
                  {row.race.name}
                  {row.race.isSprint && (
                    <span className={styles.sprintTag}>Sprint</span>
                  )}
                </span>
              </td>
              <td className={styles.dateCell}>{row.dateShort}</td>
              <td>
                <span className={styles.winnerCell}>
                  <span
                    className={styles.driverDot}
                    style={{ background: row.teamColor }}
                  >
                    {row.winnerInitial}
                  </span>
                  {row.winnerName}
                </span>
              </td>
              <td>
                <span className={styles.teamCell}>
                  <span
                    className={styles.teamDot}
                    style={{ background: row.teamColor }}
                  />
                  {row.teamName}
                </span>
              </td>
              <td className={styles.lapsCell}>{row.race.laps}</td>
              <td className={styles.timeCell}>{row.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ═══ Desktop: Schedule Table ═══ */

function ScheduleTable({
  rows,
  onClick,
}: {
  rows: TableRow[];
  onClick: (r: RaceDetail) => void;
}) {
  if (rows.length === 0) {
    return (
      <p style={{ color: "rgba(255,255,255,0.4)" }}>Все гонки завершены!</p>
    );
  }
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th>Round</th>
            <th>Grand Prix</th>
            <th>Circuit</th>
            <th>Date</th>
            <th style={{ textAlign: "center" }}>Laps</th>
            <th style={{ textAlign: "right" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.race.round}
              className={styles.row}
              onClick={() => onClick(row.race)}
            >
              <td style={{ color: "rgba(255,255,255,0.35)", fontWeight: 700 }}>
                {String(row.race.round).padStart(2, "0")}
              </td>
              <td>
                <span className={styles.gpCell}>
                  <span className={styles.gpFlag}>{row.race.flag}</span>
                  {row.race.name}
                  {row.race.isSprint && (
                    <span className={styles.sprintTag}>Sprint</span>
                  )}
                </span>
              </td>
              <td style={{ color: "rgba(255,255,255,0.5)" }}>
                {row.race.circuit}
              </td>
              <td className={styles.dateCell}>{row.dateShort}</td>
              <td className={styles.lapsCell}>{row.race.laps || "—"}</td>
              <td style={{ textAlign: "right" }}>
                <span
                  className={`${styles.statusBadge} ${
                    row.race.status === "next"
                      ? styles.statusNext
                      : row.race.status === "canceled"
                        ? styles.statusCanceled
                        : styles.statusUpcoming
                  }`}
                >
                  {row.race.status === "next"
                    ? "Next"
                    : row.race.status === "canceled"
                      ? "Cancelled"
                      : "Upcoming"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ═══ Mobile: Results Cards ═══ */

function MobileList({
  rows,
  onClick,
}: {
  rows: TableRow[];
  onClick: (r: RaceDetail) => void;
}) {
  if (rows.length === 0) {
    return (
      <p
        className={styles.mobileList}
        style={{ display: "flex", color: "rgba(255,255,255,0.4)", padding: 20 }}
      >
        Пока нет завершённых гонок.
      </p>
    );
  }
  return (
    <div className={styles.mobileList}>
      {rows.map((row) => (
        <div
          key={row.race.round}
          className={styles.mobileCard}
          onClick={() => onClick(row.race)}
        >
          <div className={styles.mobileCardHeader}>
            <div className={styles.mobileGp}>
              <span className={styles.mobileGpFlag}>{row.race.flag}</span>
              <span className={styles.mobileGpName}>
                {row.race.name}
                {row.race.isSprint && (
                  <span className={styles.sprintTag}>Sprint</span>
                )}
              </span>
            </div>
            <span className={styles.mobileRound}>R{row.race.round}</span>
          </div>
          <div className={styles.mobileDate}>{row.dateShort}</div>
          <div className={styles.mobileDivider} />
          <div className={styles.mobileResult}>
            <span
              className={styles.mobileWinnerDot}
              style={{ background: row.teamColor }}
            >
              {row.winnerInitial}
            </span>
            <div className={styles.mobileWinnerInfo}>
              <div className={styles.mobileWinnerName}>{row.winnerName}</div>
              <div className={styles.mobileWinnerTeam}>
                <span
                  className={styles.mobileTeamDot}
                  style={{ background: row.teamColor }}
                />
                {row.teamName}
              </div>
            </div>
            <span className={styles.mobileTime}>{row.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══ Mobile: Schedule Cards ═══ */

function MobileScheduleList({
  rows,
  onClick,
}: {
  rows: TableRow[];
  onClick: (r: RaceDetail) => void;
}) {
  if (rows.length === 0) return null;
  return (
    <div className={styles.mobileList}>
      {rows.map((row) => (
        <div
          key={row.race.round}
          className={styles.mobileCard}
          onClick={() => onClick(row.race)}
        >
          <div className={styles.mobileCardHeader}>
            <div className={styles.mobileGp}>
              <span className={styles.mobileGpFlag}>{row.race.flag}</span>
              <span className={styles.mobileGpName}>
                {row.race.name}
                {row.race.isSprint && (
                  <span className={styles.sprintTag}>Sprint</span>
                )}
              </span>
            </div>
            <span className={styles.mobileRound}>R{row.race.round}</span>
          </div>
          <div className={styles.mobileDate}>
            {row.dateShort} · {row.race.circuit}
          </div>
          <div className={styles.mobileDivider} />
          <div className={styles.mobileStatusRow}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
              {row.race.laps ? `${row.race.laps} кругов` : "—"}
            </span>
            <span
              className={`${styles.statusBadge} ${
                row.race.status === "next"
                  ? styles.statusNext
                  : row.race.status === "canceled"
                    ? styles.statusCanceled
                    : styles.statusUpcoming
              }`}
            >
              {row.race.status === "next"
                ? "Следующий"
                : row.race.status === "canceled"
                  ? "Отменён"
                  : "Предстоит"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
