import type { City } from '../data';

export interface CityInfo {
  extract: string;
  thumbnail?: string;
  url: string;
  lang: 'tr' | 'en';
}

interface Summary {
  type?: string;
  title?: string;
  extract?: string;
  thumbnail?: { source: string };
  content_urls?: { desktop?: { page?: string } };
  coordinates?: { lat: number; lon: number };
}

const MAX_KM = 50;

export function distanceKm(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const rad = Math.PI / 180;
  const dLat = (bLat - aLat) * rad;
  const dLon = (bLon - aLon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLon / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

/** A summary is only trusted if it is a real article about a place near the city. */
export function isTrustedSummary(s: Summary, city: City): boolean {
  if (!s.extract || s.type === 'disambiguation') return false;
  if (s.coordinates && distanceKm(s.coordinates.lat, s.coordinates.lon, city.lat, city.lon) > MAX_KM) return false;
  return true;
}

const norm = (t: string) =>
  t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/ı/g, 'i').replace(/ł/g, 'l').replace(/ø/g, 'o');

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T | null> {
  try {
    const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
    return res.ok ? ((await res.json()) as T) : null;
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e;
    return null;
  }
}

async function summary(lang: 'tr' | 'en', title: string, signal?: AbortSignal): Promise<Summary | null> {
  const t = encodeURIComponent(title.replace(/ /g, '_'));
  return getJson<Summary>(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${t}`, signal);
}

/** No exact title known: look for an article about a place at these coordinates. */
async function titleByLocation(lang: 'tr' | 'en', city: City, signal?: AbortSignal): Promise<string | null> {
  const url =
    `https://${lang}.wikipedia.org/w/api.php?action=query&list=geosearch&format=json&origin=*` +
    `&gscoord=${city.lat}|${city.lon}&gsradius=10000&gslimit=20`;
  const data = await getJson<{ query?: { geosearch?: { title: string }[] } }>(url, signal);
  const wanted = norm(city.name);
  const hit = data?.query?.geosearch?.find((g) => {
    const t = norm(g.title);
    return t === wanted || t.startsWith(`${wanted},`) || t.startsWith(`${wanted} (`);
  });
  return hit?.title ?? null;
}

async function tryLang(lang: 'tr' | 'en', city: City, signal?: AbortSignal): Promise<CityInfo | null> {
  const title = city[lang] ?? (await titleByLocation(lang, city, signal));
  if (!title) return null;
  const s = await summary(lang, title, signal);
  if (!s || !isTrustedSummary(s, city)) return null;
  return {
    extract: s.extract!,
    thumbnail: s.thumbnail?.source,
    url: s.content_urls?.desktop?.page ?? `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title)}`,
    lang,
  };
}

const cacheKey = (city: City) => `spinatlas:city:${city.id}`;

/** Turkish Wikipedia first, English as fallback, `null` when nothing trustworthy exists. */
export async function fetchCityInfo(city: City, signal?: AbortSignal): Promise<CityInfo | null> {
  try {
    const cached = sessionStorage.getItem(cacheKey(city));
    if (cached) return JSON.parse(cached) as CityInfo;
  } catch {
    /* storage unavailable */
  }
  const info = (await tryLang('tr', city, signal)) ?? (await tryLang('en', city, signal));
  if (info) {
    try {
      sessionStorage.setItem(cacheKey(city), JSON.stringify(info));
    } catch {
      /* ignore */
    }
  }
  return info;
}
