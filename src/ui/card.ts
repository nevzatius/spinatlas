import { REGIONS, type City, type Country } from '../data';
import type { FateEvent, Mood } from '../data/fate';
import { drawEvent, drawProphecy, type Prophecy } from '../lib/fate';
import { randomInt } from '../lib/random';
import type { CityInfo } from '../lib/wikipedia';

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text !== undefined) e.textContent = text;
  return e;
}

const nf = new Intl.NumberFormat('tr-TR');

const MOODS: Record<Mood, string> = { good: '🍀 Şanslı', neutral: '🎲 Sürpriz', bad: '⛈️ Zorluk' };

function formatCoords(lat: number, lon: number): string {
  const f = (v: number, pos: string, neg: string) => `${Math.abs(v).toFixed(3)}° ${v >= 0 ? pos : neg}`;
  return `${f(lat, 'K', 'G')}, ${f(lon, 'D', 'B')}`;
}

/** Renders the info card. Every value is inserted as text; nothing external is parsed as HTML. */
export class InfoCard {
  private factIndex = 0;
  private prophecy: Prophecy | null = null;
  private event: FateEvent | null = null;

  constructor(private root: HTMLElement) {}

  clear(message: string): void {
    this.root.replaceChildren(el('p', 'card-empty', message));
  }

  showCountry(country: Country): void {
    this.factIndex = randomInt(Math.max(1, country.facts.length));
    this.root.replaceChildren(
      this.head(country),
      el('p', 'card-empty', `${country.name} seçildi. Şimdi şehir çarkını çevir!`),
      this.factBlock(country),
    );
  }

  /** Shows verified basics immediately; `showInfo` adds Wikipedia content when it arrives. */
  showCity(city: City, country: Country): void {
    this.prophecy = drawProphecy(city, country);
    this.event = drawEvent(city, country);

    const facts = el('dl', 'facts');
    const add = (k: string, v: string) => facts.append(el('dt', undefined, k), el('dd', undefined, v));
    add('Konum', formatCoords(city.lat, city.lon));
    if (city.pop > 0) add('Nüfus', nf.format(city.pop));
    const body = el('div', 'card-body');
    body.append(el('p', 'card-loading', 'Şehir bilgisi yükleniyor…'));

    this.factIndex = randomInt(Math.max(1, country.facts.length));
    this.root.replaceChildren(this.head(country, city.name), body, facts, this.factBlock(country), this.fateBlock(city, country));
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
    const meta = el('p', 'card-country');
    meta.append(
      document.createTextNode(country.name),
      el('span', `badge ${country.program ? 'badge-program' : 'badge-partner'}`, country.program ? 'Erasmus+ program ülkesi' : 'Erasmus+ partner ülke'),
      el('span', 'badge badge-region', `${REGIONS[country.region].emoji} ${REGIONS[country.region].label}`),
    );
    titles.append(meta);
    if (city) titles.append(el('h2', 'card-city', city));
    head.append(flag, titles);
    return head;
  }

  /** Hand-written, verifiable fact about the country; the button cycles through them. */
  private factBlock(country: Country): HTMLElement {
    const block = el('section', 'block block-fact');
    if (country.facts.length === 0) return block;
    block.append(el('h3', undefined, `💡 İlginç bilgi · ${country.name}`));
    const text = el('p', undefined, country.facts[this.factIndex % country.facts.length]);
    block.append(text);
    if (country.facts.length > 1) {
      const btn = el('button', 'link-btn', 'Başka bir bilgi');
      btn.type = 'button';
      btn.addEventListener('click', () => {
        this.factIndex = (this.factIndex + 1) % country.facts.length;
        text.textContent = country.facts[this.factIndex];
      });
      block.append(btn);
    }
    return block;
  }

  /** Clearly labelled fiction: a prophecy and a random "destiny event". */
  private fateBlock(city: City, country: Country): HTMLElement {
    const block = el('section', 'block block-fate');
    block.append(el('h3', undefined, '🔮 Kahinin Kehaneti'));
    const prophecy = el('p', 'fate-prophecy', this.prophecy!.text);
    const eventHead = el('h3', 'fate-event-head', '🎲 Kader Olayı');
    const eventBox = el('div', 'fate-event');
    const fillEvent = () => {
      const e = this.event!;
      eventBox.className = `fate-event mood-${e.mood}`;
      eventBox.replaceChildren(
        el('span', 'fate-emoji', e.emoji),
        (() => {
          const d = el('div');
          d.append(el('strong', undefined, e.title), el('span', 'badge', MOODS[e.mood]), el('p', undefined, e.text));
          return d;
        })(),
      );
    };
    fillEvent();

    const btn = el('button', 'link-btn', '🎲 Kaderi yeniden çek');
    btn.type = 'button';
    btn.addEventListener('click', () => {
      this.prophecy = drawProphecy(city, country, this.prophecy?.id);
      this.event = drawEvent(city, country, this.event?.id);
      prophecy.textContent = this.prophecy.text;
      fillEvent();
    });

    block.append(prophecy, eventHead, eventBox, el('p', 'fate-note', 'Eğlence amaçlı kurgu: gerçek bir tahmin veya bilgi değildir.'), btn);
    return block;
  }
}
