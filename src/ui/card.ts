import type { City, Country } from '../data';
import type { CityInfo } from '../lib/wikipedia';

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text !== undefined) e.textContent = text;
  return e;
}

const nf = new Intl.NumberFormat('tr-TR');

function formatCoords(lat: number, lon: number): string {
  const f = (v: number, pos: string, neg: string) => `${Math.abs(v).toFixed(3)}° ${v >= 0 ? pos : neg}`;
  return `${f(lat, 'K', 'G')}, ${f(lon, 'D', 'B')}`;
}

/** Renders the info card. Every value is inserted as text; nothing external is parsed as HTML. */
export class InfoCard {
  constructor(private root: HTMLElement) {}

  clear(message: string): void {
    this.root.replaceChildren(el('p', 'card-empty', message));
  }

  showCountry(country: Country): void {
    const head = this.head(country);
    this.root.replaceChildren(head, el('p', 'card-empty', `${country.name} seçildi. Şimdi şehir çarkını çevir!`));
  }

  /** Shows verified basics immediately; `showInfo` adds Wikipedia content when it arrives. */
  showCity(city: City, country: Country): void {
    const facts = el('dl', 'facts');
    const add = (k: string, v: string) => facts.append(el('dt', undefined, k), el('dd', undefined, v));
    add('Konum', formatCoords(city.lat, city.lon));
    if (city.pop > 0) add('Nüfus', nf.format(city.pop));
    const body = el('div', 'card-body');
    body.append(el('p', 'card-loading', 'Şehir bilgisi yükleniyor…'));
    this.root.replaceChildren(this.head(country, city.name), body, facts);
  }

  showInfo(info: CityInfo | null): void {
    const body = this.root.querySelector('.card-body');
    if (!body) return;
    if (!info) {
      body.replaceChildren(el('p', 'card-empty', 'Bu şehir için güvenilir bir açıklama bulunamadı.'));
      return;
    }
    const nodes: Node[] = [];
    if (info.thumbnail) {
      const img = el('img', 'card-photo');
      img.src = info.thumbnail;
      img.alt = '';
      img.loading = 'lazy';
      img.referrerPolicy = 'no-referrer';
      nodes.push(img);
    }
    nodes.push(el('p', 'card-text', info.extract));
    const src = el('a', 'card-source');
    src.href = info.url;
    src.target = '_blank';
    src.rel = 'noopener noreferrer';
    src.textContent = `Kaynak: ${info.lang === 'tr' ? 'Vikipedi' : 'Wikipedia (EN)'} · CC BY-SA`;
    nodes.push(src);
    body.replaceChildren(...nodes);
  }

  private head(country: Country, city?: string): HTMLElement {
    const head = el('header', 'card-head');
    const flag = el('img', 'card-flag');
    flag.src = country.flag;
    flag.alt = `${country.name} bayrağı`;
    const titles = el('div');
    titles.append(el('p', 'card-country', country.name));
    if (city) titles.append(el('h2', 'card-city', city));
    head.append(flag, titles);
    return head;
  }
}
