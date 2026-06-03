const routePhotoSets = [
  [
    new URL("../../assets/route-photos/river-01.jpg", import.meta.url).href,
    new URL("../../assets/route-photos/river-02.jpg", import.meta.url).href,
    new URL("../../assets/route-photos/river-03.jpg", import.meta.url).href,
  ],
  [
    new URL("../../assets/route-photos/river-05.jpg", import.meta.url).href,
    new URL("../../assets/route-photos/river-12.jpg", import.meta.url).href,
    new URL("../../assets/route-photos/river-06.jpg", import.meta.url).href,
  ],
  [
    new URL("../../assets/route-photos/river-12.jpg", import.meta.url).href,
    new URL("../../assets/route-photos/river-11.jpg", import.meta.url).href,
    new URL("../../assets/route-photos/river-09.jpg", import.meta.url).href,
  ],
];

function getStableIndex(value: string, modulo: number): number {
  const normalized = value.trim().toLowerCase();
  let hash = 0;

  for (const char of normalized) {
    hash = (hash * 31 + char.charCodeAt(0)) % modulo;
  }

  return hash;
}

export function getRoutePhotos(riverName: string): string[] {
  return routePhotoSets[getStableIndex(riverName, routePhotoSets.length)];
}

export function getRoutePhoto(riverName: string, offset = 0): string {
  const photos = getRoutePhotos(riverName);
  return photos[getStableIndex(`${riverName}:${offset}`, photos.length)];
}
