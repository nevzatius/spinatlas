import { easeOutQuart, sliceUnderPointer, TAU, targetRotation } from '../lib/wheelMath';
import { randomFloat } from '../lib/random';

export interface Slice {
  label: string;
  flag?: string; // image URL drawn next to the label
}

const PALETTE = ['#2f6f8f', '#7a4fa3', '#b0563b', '#3e8a5d', '#a8802c', '#4a5fb3'];
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Canvas fortune wheel. The result is decided by the caller; this only animates to it. */
export class Wheel {
  private canvas = document.createElement('canvas');
  private pointer = document.createElement('div');
  private ctx = this.canvas.getContext('2d')!;
  private slices: Slice[] = [];
  private flags = new Map<string, HTMLImageElement>();
  private rotation = Math.random() * TAU;
  private spinning = false;
  private lastTick = -1;
  private size = 0;

  constructor(private host: HTMLElement) {
    this.canvas.className = 'wheel-canvas';
    this.pointer.className = 'wheel-pointer';
    this.pointer.setAttribute('aria-hidden', 'true');
    host.append(this.canvas, this.pointer);
    new ResizeObserver(() => this.resize()).observe(host);
    this.resize();
  }

  get isSpinning(): boolean {
    return this.spinning;
  }

  setSlices(slices: Slice[]): void {
    this.slices = slices;
    for (const s of slices) {
      if (s.flag && !this.flags.has(s.flag)) {
        const img = new Image();
        img.onload = () => this.draw();
        img.src = s.flag;
        this.flags.set(s.flag, img);
      }
    }
    this.draw();
  }

  /** Animates until the pointer rests on `index` (a slice currently shown). Resolves when stopped. */
  spin(index: number): Promise<void> {
    if (this.spinning || index < 0 || index >= this.slices.length) return Promise.resolve();
    this.spinning = true;
    const count = this.slices.length;
    const quick = reducedMotion();
    const from = this.rotation;
    const turns = quick ? 1 : 4 + Math.floor(randomFloat() * 3);
    const offset = (randomFloat() - 0.5) * 0.7; // stay clear of the slice edges
    const to = targetRotation(from, index, count, turns, offset);
    const duration = quick ? 900 : 4200 + randomFloat() * 800;
    const start = performance.now();
    this.lastTick = sliceUnderPointer(from, count);

    return new Promise((resolve) => {
      const frame = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        this.rotation = from + (to - from) * easeOutQuart(t);
        const under = sliceUnderPointer(this.rotation, count);
        if (under !== this.lastTick) {
          this.lastTick = under;
          this.tick();
        }
        this.draw();
        if (t < 1) requestAnimationFrame(frame);
        else {
          this.spinning = false;
          resolve();
        }
      };
      requestAnimationFrame(frame);
    });
  }

  private tick(): void {
    this.pointer.classList.remove('tick');
    void this.pointer.offsetWidth; // restart the CSS animation
    this.pointer.classList.add('tick');
  }

  private resize(): void {
    const w = Math.round(this.host.clientWidth);
    if (!w || w === this.size) return;
    this.size = w;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.height = Math.round(w * dpr);
    this.canvas.style.width = this.canvas.style.height = `${w}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.draw();
  }

  private draw(): void {
    const { ctx, size, slices } = this;
    if (!size) return;
    const r = size / 2 - 6;
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(size / 2, size / 2);

    if (slices.length === 0) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, TAU);
      ctx.fillStyle = '#1b2230';
      ctx.fill();
      ctx.strokeStyle = '#2a3447';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = '#44506a';
      ctx.font = `700 ${r * 0.5}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', 0, 0);
      ctx.restore();
      return;
    }

    const n = slices.length;
    const step = TAU / n;
    for (let i = 0; i < n; i++) {
      const a0 = this.rotation + i * step - Math.PI / 2;
      let color = PALETTE[i % PALETTE.length];
      if (i === n - 1 && n > 1 && i % PALETTE.length === 0) color = PALETTE[3]; // never match slice 0 at the seam
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, a0, a0 + step);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(10,14,22,.65)';
      ctx.lineWidth = 2;
      ctx.stroke();
      this.drawLabel(slices[i], a0 + step / 2, r, step);
    }

    // hub + rim
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.strokeStyle = '#e8ecf5';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.11, 0, TAU);
    ctx.fillStyle = '#0e131c';
    ctx.fill();
    ctx.strokeStyle = '#e8ecf5';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }

  private drawLabel(slice: Slice, angle: number, r: number, step: number): void {
    const { ctx } = this;
    ctx.save();
    ctx.rotate(angle);
    const flagH = Math.min(r * 0.12, 2 * r * Math.sin(step / 2) * 0.32);
    const flagW = flagH * 4 / 3;
    const font = Math.max(10, Math.min(r * 0.075, 16));
    let x = r * 0.93;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.font = `600 ${font}px system-ui, sans-serif`;
    ctx.fillStyle = '#fff';

    const maxText = r * (slice.flag ? 0.5 : 0.62);
    let text = slice.label;
    while (text.length > 1 && ctx.measureText(text).width > maxText) text = text.slice(0, -1);
    if (text !== slice.label) text = text.trimEnd() + '…';
    ctx.fillText(text, x, 0);

    if (slice.flag) {
      const img = this.flags.get(slice.flag);
      if (img?.complete && img.naturalWidth) {
        x -= ctx.measureText(text).width + 8;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x - flagW, -flagH / 2, flagW, flagH, 3);
        ctx.clip();
        ctx.drawImage(img, x - flagW, -flagH / 2, flagW, flagH);
        ctx.restore();
      }
    }
    ctx.restore();
  }
}
