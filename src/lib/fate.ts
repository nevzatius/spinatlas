import type { City, Country } from '../data';
import { EVENTS, PROPHECIES, type FateEvent } from '../data/fate';
import { randomInt } from './random';

const fill = (text: string, city: City, country: Country) =>
  text.replaceAll('{city}', city.name).replaceAll('{country}', country.name);

export interface Prophecy {
  id: number; // index into PROPHECIES, used to avoid immediate repeats
  text: string;
}

export function drawProphecy(city: City, country: Country, previousId?: number): Prophecy {
  const ids = PROPHECIES.map((_, i) => i).filter((i) => i !== previousId);
  const id = ids[randomInt(ids.length)];
  return { id, text: fill(PROPHECIES[id], city, country) };
}

/** Random event for this place. Region-tagged events only appear in their regions; no immediate repeats. */
export function drawEvent(city: City, country: Country, previousId?: string): FateEvent {
  const eligible = EVENTS.filter((e) => !e.regions || e.regions.includes(country.region));
  const options = eligible.length > 1 ? eligible.filter((e) => e.id !== previousId) : eligible;
  const picked = options[randomInt(options.length)];
  return { ...picked, text: fill(picked.text, city, country) };
}
