import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { REGIONS, countries } from '../src/data';
import { EVENTS, PROPHECIES } from '../src/data/fate';
import { drawEvent, drawProphecy } from '../src/lib/fate';

describe('country data', () => {
  it('covers 60 countries: 33 programme + partners, with unique ISO codes', () => {
    expect(countries).toHaveLength(60);
    expect(countries.filter((c) => c.program)).toHaveLength(33);
    expect(new Set(countries.map((c) => c.iso)).size).toBe(60);
  });

  it.each(countries.map((c) => [c.iso, c] as const))('%s is complete', (_iso, c) => {
    expect(c.cities.length).toBeGreaterThanOrEqual(1);
    expect(c.facts.length).toBeGreaterThanOrEqual(2);
    expect(c.region in REGIONS).toBe(true);
    expect(existsSync(`public/flags/${c.iso.toLowerCase()}.svg`)).toBe(true);
    const [s, w, n, e] = c.bbox;
    expect(s).toBeLessThan(n);
    expect(w).toBeLessThan(e);
    for (const city of c.cities) {
      expect(city.lat).toBeGreaterThanOrEqual(-90);
      expect(city.lat).toBeLessThanOrEqual(90);
      expect(Math.abs(city.lon)).toBeLessThanOrEqual(180);
    }
  });

  it('every region has at least one country', () => {
    for (const r of Object.keys(REGIONS)) expect(countries.some((c) => c.region === r)).toBe(true);
  });
});

describe('fate content', () => {
  const city = countries[0].cities[0];
  const country = countries[0];

  it('never glues a Turkish suffix onto a placeholder', () => {
    const all = [...PROPHECIES, ...EVENTS.map((e) => e.text)];
    for (const t of all) expect(t).not.toMatch(/\{(city|country)\}['’]/);
  });

  it('fills every placeholder', () => {
    for (let i = 0; i < 100; i++) {
      expect(drawProphecy(city, country).text).not.toMatch(/[{}]/);
      expect(drawEvent(city, country).text).not.toMatch(/[{}]/);
    }
  });

  it('does not repeat the previous prophecy or event immediately', () => {
    for (let i = 0; i < 200; i++) {
      const p = drawProphecy(city, country, 3);
      expect(p.id).not.toBe(3);
      const prev = drawEvent(city, country);
      expect(drawEvent(city, country, prev.id).id).not.toBe(prev.id);
    }
  });

  it('region-tagged events only appear in their regions', () => {
    const north = countries.find((c) => c.region === 'kuzey')!;
    const south = countries.find((c) => c.region === 'guney')!;
    for (let i = 0; i < 400; i++) {
      expect(drawEvent(south.cities[0], south).id).not.toBe('snow');
      expect(drawEvent(north.cities[0], north).id).not.toBe('sun');
    }
  });
});
