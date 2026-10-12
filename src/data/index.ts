import countriesJson from './countries.json';
import citiesJson from './cities.json';
import { FACTS } from './facts';

export interface City {
  id: number;
  name: string;
  lat: number;
  lon: number;
  pop: number;
  tr?: string; // exact Turkish Wikipedia title (via Wikidata)
  en?: string; // exact English Wikipedia title
}

export type RegionId = 'bati' | 'orta' | 'guney' | 'kuzey' | 'balkan' | 'mikro' | 'kafkas' | 'akdeniz';

export const REGIONS: Record<RegionId, { label: string; emoji: string }> = {
  bati: { label: 'Batı', emoji: '🏰' },
  orta: { label: 'Orta', emoji: '🌍' },
  guney: { label: 'Güney', emoji: '🏖️' },
  kuzey: { label: 'Kuzey', emoji: '❄️' },
  balkan: { label: 'Balkan & Doğu', emoji: '⛰️' },
  mikro: { label: 'Mikro', emoji: '💎' },
  kafkas: { label: 'Kafkasya & Orta Asya', emoji: '🐪' },
  akdeniz: { label: 'Güney Akdeniz', emoji: '🌴' },
};

export interface Country {
  iso: string; // ISO 3166-1 alpha-2, uppercase
  name: string;
  region: RegionId;
  program: boolean; // Erasmus+ programme country (true) or partner country (false)
  bbox: [south: number, west: number, north: number, east: number];
  flag: string;
  facts: string[]; // hand-written, verifiable fun facts about the country
  cities: City[];
}

const cities = citiesJson as Record<string, City[]>;

export const countries: Country[] = (countriesJson as Omit<Country, 'flag' | 'cities' | 'facts'>[]).map((c) => ({
  ...c,
  flag: `${import.meta.env.BASE_URL}flags/${c.iso.toLowerCase()}.svg`,
  facts: FACTS[c.iso] ?? [],
  cities: cities[c.iso] ?? [],
}));
