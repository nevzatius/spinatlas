import countriesJson from './countries.json';
import citiesJson from './cities.json';

export interface City {
  id: number;
  name: string;
  lat: number;
  lon: number;
  pop: number;
  tr?: string; // exact Turkish Wikipedia title (via Wikidata)
  en?: string; // exact English Wikipedia title
}

export interface Country {
  iso: string; // ISO 3166-1 alpha-2, uppercase
  name: string;
  bbox: [south: number, west: number, north: number, east: number];
  flag: string;
  cities: City[];
}

const cities = citiesJson as Record<string, City[]>;

export const countries: Country[] = (countriesJson as Omit<Country, 'flag' | 'cities'>[]).map((c) => ({
  ...c,
  flag: `${import.meta.env.BASE_URL}flags/${c.iso.toLowerCase()}.svg`,
  cities: cities[c.iso] ?? [],
}));
