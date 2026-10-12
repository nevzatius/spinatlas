import './styles/main.css';
import { countries, type City, type Country } from './data';
import { ensureWinner, pickWinner, sampleSlices, shuffle } from './lib/random';
import { fetchCityInfo } from './lib/wikipedia';
import { isSpinning, next, type Action, type Phase } from './state';
import { InfoCard } from './ui/card';
import { AtlasMap } from './ui/map';
import { Wheel } from './ui/wheel';

const MAX_SLICES = 12;
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const countryWheel = new Wheel($('country-wheel'));
const cityWheel = new Wheel($('city-wheel'));
const map = new AtlasMap($('map'));
const card = new InfoCard($('card'));
const countryBtn = $<HTMLButtonElement>('country-btn');
const cityBtn = $<HTMLButtonElement>('city-btn');
const resetBtn = $<HTMLButtonElement>('reset-btn');
const cityPanel = $('city-panel');

let phase: Phase = 'idle';
let country: Country | null = null;
let countrySlices: Country[] = [];
let citySlices: City[] = [];
let infoRequest: AbortController | null = null;

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
  const winner = pickWinner(countries);
  const shown = countrySlices.length ? ensureWinner(countrySlices, winner) : sampleSlices(countries, winner, MAX_SLICES);
  countrySlices = shown.slices;
  countryWheel.setSlices(countrySlices.map(countrySlice));
  citySlices = [];
  cityWheel.setSlices([]);
  await countryWheel.spin(shown.winnerIndex);

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

countryBtn.addEventListener('click', spinCountry);
cityBtn.addEventListener('click', spinCity);
resetBtn.addEventListener('click', reset);

// Show the full set of options before the first spin so the wheel isn't empty.
countrySlices = shuffle(countries).slice(0, MAX_SLICES);
countryWheel.setSlices(countrySlices.map(countrySlice));
card.clear('Çarkı çevirerek başla.');
render();
