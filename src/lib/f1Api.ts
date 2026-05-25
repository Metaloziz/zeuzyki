const API_BASE = "https://api.jolpi.ca/ergast/f1";

/* ── Raw API response types ── */

interface ApiLocation {
  locality: string;
  country: string;
}

interface ApiCircuit {
  circuitId: string;
  circuitName: string;
  Location: ApiLocation;
}

interface ApiTime {
  millis?: string;
  time: string;
}

interface ApiDriver {
  driverId: string;
  code: string;
  givenName: string;
  familyName: string;
}

interface ApiConstructor {
  constructorId: string;
  name: string;
}

interface ApiResult {
  position: string;
  Driver: ApiDriver;
  Constructor: ApiConstructor;
  Time?: ApiTime;
  FastestLap?: { Time: { time: string } };
  status: string;
}

interface ApiRaceRaw {
  season: string;
  round: string;
  raceName: string;
  Circuit: ApiCircuit;
  date: string;
  time?: string;
  Sprint?: unknown;
  SprintQualifying?: unknown;
  Results?: ApiResult[];
}

/* ── Public types ── */

export type RaceStatus = "completed" | "canceled" | "next" | "upcoming";

export interface PodiumEntry {
  driver: string;
  team: string;
  time?: string;
}

export interface ApiRace {
  round: number;
  raceName: string;
  circuitId: string;
  circuitName: string;
  locality: string;
  country: string;
  date: string;       // ISO date e.g. "2026-03-08"
  time?: string;      // e.g. "04:00:00Z"
  isSprint: boolean;
  status: RaceStatus;
  podium?: [PodiumEntry, PodiumEntry, PodiumEntry];
  totalResults: number;
}

/* ── Helpers ── */

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`F1 API error: ${res.status}`);
  return res.json() as Promise<T>;
}

interface MRData<Table extends string, T> {
  MRData: { [K in Table]: { Races: T[] } } & { total: string };
}

type ScheduleResponse = MRData<"RaceTable", ApiRaceRaw>;
type ResultsResponse = MRData<"RaceTable", ApiRaceRaw>;

function driverName(d: ApiDriver): string {
  const first = d.givenName.charAt(0) + ".";
  return `${first} ${d.familyName}`;
}

/* ── Main fetch ── */

export async function fetchF1Schedule(): Promise<ApiRace[]> {
  // Fetch schedule and results in parallel
  const [scheduleData, resultsPage1, resultsPage2] = await Promise.all([
    fetchJson<ScheduleResponse>(`${API_BASE}/2026.json?limit=30`),
    fetchJson<ResultsResponse>(`${API_BASE}/2026/results.json?limit=100`),
    fetchJson<ResultsResponse>(`${API_BASE}/2026/results.json?limit=100&offset=100`),
  ]);

  const scheduleRaces = scheduleData.MRData.RaceTable.Races;
  const resultRaces = [
    ...resultsPage1.MRData.RaceTable.Races,
    ...resultsPage2.MRData.RaceTable.Races,
  ];

  // Build a map of round -> results
  const resultsMap = new Map<string, ApiResult[]>();
  for (const r of resultRaces) {
    if (r.Results && r.Results.length > 0) {
      resultsMap.set(r.round, r.Results);
    }
  }

  const now = new Date();
  let foundNext = false;

  const races: ApiRace[] = scheduleRaces.map((raw) => {
    const results = resultsMap.get(raw.round);
    const raceDate = new Date(raw.date + "T" + (raw.time ?? "00:00:00Z"));
    const hasResults = results && results.length > 0;
    const isSprint = !!(raw.Sprint || raw.SprintQualifying);

    let status: RaceStatus;
    if (hasResults) {
      status = "completed";
    } else if (!foundNext && raceDate > now) {
      status = "next";
      foundNext = true;
    } else if (raceDate <= now && !hasResults) {
      // Race date passed but no results — likely just happened or canceled
      // Treat as upcoming if within a week, otherwise completed with no data
      status = "upcoming";
    } else {
      status = "upcoming";
    }

    // Build podium from top 3 finishers
    let podium: [PodiumEntry, PodiumEntry, PodiumEntry] | undefined;
    if (hasResults) {
      const top3 = results
        .filter((r) => r.status === "Finished" || r.status === "Lapped")
        .slice(0, 3);
      if (top3.length === 3) {
        podium = top3.map((r) => ({
          driver: driverName(r.Driver),
          team: r.Constructor.name,
          time: r.Time?.time,
        })) as [PodiumEntry, PodiumEntry, PodiumEntry];
      }
    }

    return {
      round: parseInt(raw.round, 10),
      raceName: raw.raceName,
      circuitId: raw.Circuit.circuitId,
      circuitName: raw.Circuit.circuitName,
      locality: raw.Circuit.Location.locality,
      country: raw.Circuit.Location.country,
      date: raw.date,
      time: raw.time,
      isSprint,
      status,
      podium,
      totalResults: results?.length ?? 0,
    };
  });

  return races;
}
