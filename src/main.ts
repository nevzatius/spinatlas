import './styles/main.css';
import { REGIONS, countries, type City, type Country, type RegionId } from './data';
import { ensureWinner, pickWinner, sampleSlices, shuffle } from './lib/random';
import { sound } from './lib/sound';
import { fetchCityInfo } from './lib/wikipedia';
import { isSpinning, next, type Action, type Phase } from './state';
import { InfoCard } from './ui/card';
import { AtlasMap } from './ui/map';
import { Wheel } from './ui/wheel';

// Show every option on the wheel (60 countries, 40 cities per country at most); sampling only kicks in beyond this.
const MAX_SLICES = 60;
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const countryWheel = new Wheel($('country-wheel'));
const cityWheel = new Wheel($('city-wheel'));
const map = new AtlasMap($('map'));
const card = new InfoCard($('card'));
const countryBtn = $<HTMLButtonElement>('country-btn');
const cityBtn = $<HTMLButtonElement>('city-btn');
const resetBtn = $<HTMLButtonElement>('reset-btn');
const soundBtn = $<HTMLButtonElement>('sound-btn');
const cityPanel = $('city-panel');
const chipsEl = $('region-chips');

type Filter = 'all' | 'program' | RegionId;
const FILTERS: { id: Filter; label: string; test: (c: Country) => boolean }[] = [
  { id: 'all', label: 'Tümü', test: () => true },
  { id: 'program', label: '✅ Program ülkeleri', test: (c) => c.program },
  ...(Object.entries(REGIONS) as [RegionId, { label: string; emoji: string }][]).map(([id, r]) => ({
    id: id as Filter,
    label: `${r.emoji} ${r.label}`,
    test: (c: Country) => c.region === id,
  })),
];

let filter: Filter = 'all';
let phase: Phase = 'idle';
let country: Country | null = null;
let countrySlices: Country[] = [];
let citySlices: City[] = [];
let infoRequest: AbortController | null = null;

const pool = (): Country[] => countries.filter(FILTERS.find((f) => f.id === filter)!.test);

const go = (action: Action) => (phase = next(phase, action));

const countrySlice = (c: Country) => ({ label: c.name, flag: c.flag });
const citySlice = (c: City) => ({ label: c.name });

function render(): void {
  const busy = isSpinning(phase);
  countryBtn.disabled = busy;
  countryBtn.textContent = phase === 'idle' ? 'Çarkı Çevir' : 'Yeniden Çevir';
  const cityReady = phase === 'countrySelected' || phase === 'citySelected' || phase === 'spinningCity';
  cityPanel.classList.toggle('is-disabled', !cityReady);
  cityBtn.disabled = busy || !cityReady;
  cityBtn.textContent = phase === 'citySelected' ? 'Başka Şehir' : 'Şehir Çarkını Çevir';
  resetBtn.hidden = phase === 'idle' || phase === 'spinningCountry';
  resetBtn.disabled = busy;
  for (const chip of chipsEl.querySelectorAll('button')) chip.disabled = busy;
}

function renderChips(): void {
  chipsEl.replaceChildren(
    ...FILTERS.map((f) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.textContent = `${f.label} (${countries.filter(f.test).length})`;
      b.setAttribute('aria-pressed', String(f.id === filter));
      b.addEventListener('click', () => setFilter(f.id));
      return b;
    }),
  );
  render();
}

function setFilter(id: Filter): void {
  if (isSpinning(phase) || id === filter) return;
  filter = id;
  countrySlices = shuffle(pool()).slice(0, MAX_SLICES);
  countryWheel.setSlices(countrySlices.map(countrySlice));
  renderChips();
}

function previewCities(c: Country): void {
  citySlices = shuffle(c.cities).slice(0, MAX_SLICES);
  cityWheel.setSlices(citySlices.map(citySlice));
}

function scrollTo(el: HTMLElement): void {
  if (window.matchMedia('(max-width: 880px)').matches) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function spinCountry(): Promise<void> {
  if (isSpinning(phase)) return;
  infoRequest?.abort();
  go('spinCountry');
  render();
  map.showWorld();
  card.clear('Çark dönüyor…');

  // The winner is drawn from every country; the wheel just shows a sample that contains it.
  const winner = pickWinner(pool());
  const shown = countrySlices.length ? ensureWinner(countrySlices, winner) : sampleSlices(pool(), winner, MAX_SLICES);
  countrySlices = shown.slices;
  countryWheel.setSlices(countrySlices.map(countrySlice));
  citySlices = [];
  cityWheel.setSlices([]);
  await countryWheel.spin(shown.winnerIndex);
  sound.win();

  country = winner;
  go('countryDone');
  previewCities(winner);
  card.showCountry(winner);
  map.focusCountry(winner);
  render();
  scrollTo(cityPanel);
}

async function spinCity(): Promise<void> {
  if (!country || isSpinning(phase)) return;
  infoRequest?.abort();
  const chosen = country;
  go('spinCity');
  render();

  const winner = pickWinner(chosen.cities);
  const shown = ensureWinner(citySlices, winner);
  citySlices = shown.slices;
  cityWheel.setSlices(citySlices.map(citySlice));
  await cityWheel.spin(shown.winnerIndex);
  sound.win();

  go('cityDone');
  render();
  card.showCity(winner, chosen);
  map.focusCity(winner, chosen);
  scrollTo($('card'));

  const request = (infoRequest = new AbortController());
  try {
    const info = await fetchCityInfo(winner, request.signal);
    if (!request.signal.aborted) card.showInfo(info);
  } catch {
    /* aborted by a newer spin */
  }
}

function reset(): void {
  if (isSpinning(phase)) return;
  infoRequest?.abort();
  go('reset');
  country = null;
  countrySlices = [];
  citySlices = [];
  countryWheel.setSlices([]);
  cityWheel.setSlices([]);
  card.clear('Çarkı çevirerek başla.');
  map.showWorld();
  render();
}

countryBtn.addEventListener('click', () => {
  sound.unlock();
  void spinCountry();
});
cityBtn.addEventListener('click', () => {
  sound.unlock();
  void spinCity();
});
resetBtn.addEventListener('click', reset);

function renderSound(): void {
  soundBtn.setAttribute('aria-pressed', String(sound.enabled));
  soundBtn.textContent = sound.enabled ? '🔊 Ses açık' : '🔇 Ses kapalı';
}
soundBtn.addEventListener('click', () => {
  sound.set(!sound.enabled);
  renderSound();
});
renderSound();

// Show the full set of options before the first spin so the wheel isn't empty.
countrySlices = shuffle(pool()).slice(0, MAX_SLICES);
countryWheel.setSlices(countrySlices.map(countrySlice));
card.clear('Çarkı çevirerek başla.');
renderChips();
