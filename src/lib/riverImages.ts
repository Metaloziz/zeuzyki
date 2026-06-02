export const riverImageByName: Record<string, string> = {
  вилия: new URL("../../assets/Вилия.jpg", import.meta.url).href,
  илия: new URL("../../assets/Илия.jpg", import.meta.url).href,
  нарочанка: new URL("../../assets/Нарочанка.jpg", import.meta.url).href,
  нарочь: new URL("../../assets/Нарочь.jpg", import.meta.url).href,
  узлянка: new URL("../../assets/Узлянка.jpg", import.meta.url).href,
};

export function getRiverImageKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/^р\.\s*/, "")
    .split(/\s+/)[0];
}

export function getRiverImage(name: string): string | undefined {
  return riverImageByName[getRiverImageKey(name)];
}
