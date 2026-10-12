import { afterEach, describe, expect, it, vi } from 'vitest';
import { distanceKm, fetchCityInfo, isTrustedSummary } from '../src/lib/wikipedia';
import type { City } from '../src/data';

const krakow: City = { id: 3094802, name: 'Kraków', lat: 50.06143, lon: 19.93658, pop: 816614, tr: 'Kraków', en: 'Kraków' };

describe('isTrustedSummary', () => {
  it('accepts a nearby article', () => {
    expect(isTrustedSummary({ extract: 'x', coordinates: { lat: 50.06, lon: 19.94 } }, krakow)).toBe(true);
  });
  it('rejects disambiguation pages, empty extracts and far-away places', () => {
    expect(isTrustedSummary({ extract: 'x', type: 'disambiguation' }, krakow)).toBe(false);
    expect(isTrustedSummary({ extract: '' }, krakow)).toBe(false);
    expect(isTrustedSummary({ extract: 'x', coordinates: { lat: 38.9, lon: -77.0 } }, krakow)).toBe(false);
  });
});

describe('distanceKm', () => {
  it('is roughly right for Warsaw–Kraków (~250 km)', () => {
    expect(distanceKm(52.23, 21.01, 50.06, 19.94)).toBeGreaterThan(240);
    expect(distanceKm(52.23, 21.01, 50.06, 19.94)).toBeLessThan(260);
  });
});

describe('fetchCityInfo', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('falls back to English when the Turkish article is untrustworthy', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      const ok = (body: unknown) => ({ ok: true, json: async () => body });
      if (url.includes('tr.wikipedia')) return ok({ type: 'disambiguation', extract: 'x' });
      return ok({ extract: 'Kraków is a city.', content_urls: { desktop: { page: 'https://en.wikipedia.org/wiki/Krak%C3%B3w' } } });
    });
    vi.stubGlobal('fetch', fetchMock);
    const city = { ...krakow, id: 1 };
    const info = await fetchCityInfo(city);
    expect(info?.lang).toBe('en');
    expect(info?.extract).toBe('Kraków is a city.');
  });

  it('returns null instead of inventing text when nothing is found', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, json: async () => ({}) })));
    expect(await fetchCityInfo({ ...krakow, id: 2, tr: undefined, en: undefined })).toBeNull();
  });
});
