const STORAGE_KEY = 'spinatlas:sound';
const MIN_TICK_GAP = 0.03; // seconds; keeps fast spins from turning into a buzz

let ctx: AudioContext | null = null;
let enabled = readPreference();
let lastTick = 0;

function readPreference(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'off';
  } catch {
    return true;
  }
}

function audio(): AudioContext | null {
  if (!enabled) return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function beep(c: AudioContext, freq: number, start: number, length: number, peak: number, type: OscillatorType): void {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  osc.connect(gain).connect(c.destination);
  osc.start(start);
  osc.stop(start + length + 0.02);
}

export const sound = {
  get enabled(): boolean {
    return enabled;
  },

  set(on: boolean): void {
    enabled = on;
    try {
      localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off');
    } catch {
      /* preference just won't persist */
    }
    if (on) this.unlock();
  },

  /** Call from a user gesture so browsers allow audio playback. */
  unlock(): void {
    audio();
  },

  /** Short click as the pointer passes a slice edge. */
  tick(): void {
    const c = audio();
    if (!c || c.currentTime - lastTick < MIN_TICK_GAP) return;
    lastTick = c.currentTime;
    beep(c, 1200 + Math.random() * 120, c.currentTime, 0.05, 0.12, 'triangle');
  },

  /** Rising arpeggio when the wheel stops. */
  win(): void {
    const c = audio();
    if (!c) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => beep(c, f, c.currentTime + i * 0.09, 0.35, 0.16, 'sine'));
  },
};
