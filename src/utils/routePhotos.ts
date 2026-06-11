import {
  CORPORATE_RIVER_NAME,
  RIVER_ID_TO_PHOTO_GROUP,
} from "@/constants/rivers";

const routePhotoModules = import.meta.glob(
  ["../assets/routes/*/*.{jpg,jpeg,png}", "../assets/corporate/0*.jpg"],
  {
    eager: true,
    import: "default",
  },
) as Record<string, string>;

const routePhotosByGroup = new Map<string, { name: string; url: string }[]>();

for (const [path, url] of Object.entries(routePhotoModules)) {
  const segments = path.split(/[/\\]/);
  const fileName = segments.at(-1) ?? "";
  const folder = (segments.at(-2) ?? "").toLowerCase();

  if (!folder) continue;

  const items = routePhotosByGroup.get(folder) ?? [];
  items.push({ name: fileName, url });
  routePhotosByGroup.set(folder, items);
}

for (const [group, items] of routePhotosByGroup) {
  items.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true }),
  );
  routePhotosByGroup.set(group, items);
}

export const corporateHeroPhoto = new URL(
  "../assets/corporate/hero.jpg",
  import.meta.url,
).href;

function normalizeRiverId(riverId?: string | number | null): string {
  if (riverId == null) return "";
  return String(riverId).trim();
}

function routeIdToGroupSlug(riverId: string): string | null {
  const id = normalizeRiverId(riverId);
  if (!id) return null;
  return RIVER_ID_TO_PHOTO_GROUP[id] ?? null;
}

function normalizeRouteName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/^р\.\s*/, "")
    .replace(/маршрут\s*[^\d\s]+\s*(?=\d)/g, "маршрут ")
    .replace(/(?:№|#)\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function routeNameToGroupSlug(name: string): string | null {
  const normalized = normalizeRouteName(name);

  if (normalized === "вилия") return "viliya";

  if (normalized === CORPORATE_RIVER_NAME) return "corporate";

  if (/^илия маршрут\s*1(?:\s|$)/.test(normalized)) return "ilia-1-chast";
  if (/^илия маршрут\s*2(?:\s|$)/.test(normalized)) return "ilia-2-chast";

  const iliaPart1 = normalized.match(/^илия 1 (?:часть|этап)(?:\s*(\d+))?$/);
  if (iliaPart1) return "ilia-1-chast";

  const iliaPart2 = normalized.match(/^илия 2 (?:часть|этап)(?:\s*(\d+))?$/);
  if (iliaPart2) return "ilia-2-chast";

  return null;
}

function routeNameToPhotoIndex(name: string): number | null {
  const normalized = normalizeRouteName(name);

  const iliaPart1 = normalized.match(/^илия 1 (?:часть|этап)\s*(\d+)$/);
  if (iliaPart1) return Number(iliaPart1[1]);

  const iliaPart2 = normalized.match(/^илия 2 (?:часть|этап)\s*(\d+)$/);
  if (iliaPart2) return Number(iliaPart2[1]);

  const viliya = normalized.match(/^вилия\s*(\d+)$/);
  if (viliya) return Number(viliya[1]);

  return null;
}

function getGroupPhotos(group: string, photoIndex: number | null): string[] {
  const items = routePhotosByGroup.get(group);
  if (!items?.length) return [];

  if (photoIndex !== null) {
    const photo = items[photoIndex - 1]?.url;
    return photo ? [photo] : [];
  }

  return items.map((item) => item.url);
}

const SCHEDULE_PHOTO_INDEX: Record<string, number> = {
  "ilia-1-chast": 1,
  "ilia-2-chast": 3,
};

function resolveGroup(
  riverId?: string | number | null,
  riverName?: string,
): string | null {
  const id = normalizeRiverId(riverId);
  if (id) {
    const byId = routeIdToGroupSlug(id);
    if (byId) return byId;
  }
  if (riverName) return routeNameToGroupSlug(riverName);
  return null;
}

export function getRoutePhotosByRiverId(
  riverId?: string | number | null,
  ...fallbackNames: string[]
): string[] {
  const id = normalizeRiverId(riverId);
  if (id) {
    const group = routeIdToGroupSlug(id);
    if (group) {
      for (const name of fallbackNames) {
        const photos = getGroupPhotos(group, routeNameToPhotoIndex(name));
        if (photos.length > 0) return photos;
      }

      const allPhotos = getGroupPhotos(group, null);
      if (allPhotos.length > 0) return allPhotos;
    }
  }

  return getRoutePhotos(...fallbackNames);
}

export function getRoutePhotoByRiverId(
  riverId?: string | number | null,
  ...fallbackNames: string[]
): string | undefined {
  return getRoutePhotosByRiverId(riverId, ...fallbackNames)[0];
}

export function getScheduleRowPhoto(
  riverId?: string | number | null,
  riverName?: string,
): string | undefined {
  const group = resolveGroup(riverId, riverName);
  if (group && SCHEDULE_PHOTO_INDEX[group] !== undefined) {
    const photo = getGroupPhotos(group, SCHEDULE_PHOTO_INDEX[group])[0];
    if (photo) return photo;
  }

  return getRoutePhotoByRiverId(
    riverId,
    ...(riverName ? [riverName] : []),
  );
}

export function getRoutePhoto(...names: string[]): string | undefined {
  return getRoutePhotos(...names)[0];
}

export function getRoutePhotos(...names: string[]): string[] {
  for (const name of names) {
    const group = routeNameToGroupSlug(name);
    if (!group) continue;

    const photos = getGroupPhotos(group, routeNameToPhotoIndex(name));
    if (photos.length > 0) return photos;
  }

  return [];
}
