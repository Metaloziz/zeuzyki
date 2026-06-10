export const GAS_API_URL =
  "https://script.google.com/macros/s/AKfycbxccist5FQVr6JcHbmKlCIsvIgFmidHLM1qDq3I6QdNVVN4N611qpFlRLERANoVtoCC/exec";

export const SCHEDULE_CACHE_VERSION = 1;
export const RIVERS_CACHE_VERSION = 1;

export function getScheduleCacheKey(apiUrl: string, apiKey: string): string {
  return `zeuzyki:schedule:v${SCHEDULE_CACHE_VERSION}:${apiUrl}:${apiKey}`;
}

export function getRiversCacheKey(apiUrl: string, apiKey: string): string {
  return `zeuzyki:rivers:v${RIVERS_CACHE_VERSION}:${apiUrl}:${apiKey}`;
}
