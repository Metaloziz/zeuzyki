import { CORPORATE_RIVER_NAME } from "@/constants/rivers";
import type { River } from "@/types/river";
import type { Splav } from "@/types/splav";

export function toDateTime(splav: Splav): Date {
  return new Date(`${splav.startDate}T${splav.startTime}`);
}

export function isCorporateRiver(river: River): boolean {
  return river.river.trim().toLowerCase() === CORPORATE_RIVER_NAME;
}

export function isCorporateRiverName(name: string): boolean {
  return name.trim().toLowerCase() === CORPORATE_RIVER_NAME;
}

export function getSplavCardTitle(splav: Splav): string {
  const title = splav.title?.trim();
  if (!title) return `Сплав по р. ${splav.river}`;

  const hasRiverInTitle = title
    .toLowerCase()
    .includes(splav.river.toLowerCase());
  return hasRiverInTitle ? title : `${title} · р. ${splav.river}`;
}

export function matchSplavToRiver(splav: Splav, river: River): boolean {
  return splav.riverId
    ? splav.riverId === river.id
    : splav.river === river.river;
}

export function matchSplavs(a: Splav, b: Splav): boolean {
  return a.riverId ? a.riverId === b.riverId : a.river === b.river;
}
