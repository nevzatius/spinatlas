/** Uniform integer in [0, n) using crypto randomness; rejection sampling avoids modulo bias. */
export function randomInt(n: number): number {
  if (!Number.isInteger(n) || n <= 0 || n > 0xffffffff) throw new RangeError(`randomInt: invalid n=${n}`);
  const limit = Math.floor(0x100000000 / n) * n;
  const buf = new Uint32Array(1);
  do {
    crypto.getRandomValues(buf);
  } while (buf[0] >= limit);
  return buf[0] % n;
}

/** Uniform float in [0, 1). */
export function randomFloat(): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] / 0x100000000;
}

/** Fisher–Yates shuffle, returns a new array. */
export function shuffle<T>(items: readonly T[]): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** The real draw: one uniform pick from the full list, independent of what the wheel shows. */
export function pickWinner<T>(items: readonly T[]): T {
  if (items.length === 0) throw new RangeError('pickWinner: empty list');
  return items[randomInt(items.length)];
}

/**
 * Keeps an already-shown set of slices when possible: if the drawn winner is not on the wheel,
 * it replaces a random slice. Returns a new array and the winner's index.
 */
export function ensureWinner<T>(slices: readonly T[], winner: T): { slices: T[]; winnerIndex: number } {
  const next = slices.slice();
  let winnerIndex = next.indexOf(winner);
  if (winnerIndex === -1) {
    winnerIndex = randomInt(next.length);
    next[winnerIndex] = winner;
  }
  return { slices: next, winnerIndex };
}

/**
 * Chooses which items the wheel draws: the winner plus up to `max - 1` random others,
 * shuffled. The winner is already decided, so the slice count never affects fairness.
 */
export function sampleSlices<T>(items: readonly T[], winner: T, max: number): { slices: T[]; winnerIndex: number } {
  const others = shuffle(items.filter((x) => x !== winner)).slice(0, Math.max(0, max - 1));
  const slices = shuffle([winner, ...others]);
  return { slices, winnerIndex: slices.indexOf(winner) };
}
