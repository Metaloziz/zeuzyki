const routePhotoModules = import.meta.glob(
  [
    "../../assets/routes/*/*.{jpg,jpeg,png}",
    "../../assets/corporate/0*.jpg",
  ],
  {
    eager: true,
    import: "default",
  },
) as Record<string, string>;

const routePhotosByGroup = new Map<string, { name: string; url: string }[]>();

for (const [path, url] of Object.entries(routePhotoModules)) {
  const segments = path.split("/");
  const fileName = segments.at(-1) ?? "";
  const folder = (segments.at(-2) ?? "").toLowerCase();

  if (!folder) continue;

  const items = routePhotosByGroup.get(folder) ?? [];
  items.push({ name: fileName, url });
  routePhotosByGroup.set(folder, items);
}

for (const [group, items] of routePhotosByGroup) {
  items.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  routePhotosByGroup.set(group, items);
}

export const corporateHeroPhoto = new URL(
  "../../assets/corporate/hero.jpg",
  import.meta.url,
).href;

function normalizeRouteName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/^р\.\s*/, "")
    .replace(/№\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function routeNameToGroupSlug(name: string): string | null {
  const normalized = normalizeRouteName(name);

  if (normalized === "вилия") return "viliya";

  if (normalized === "корпоративный сплав") return "corporate";

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
