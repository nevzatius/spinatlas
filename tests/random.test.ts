import { describe, expect, it } from 'vitest';
import { pickWinner, randomInt, sampleSlices, shuffle } from '../src/lib/random';
import { easeOutQuart, sliceUnderPointer, targetRotation, TAU } from '../src/lib/wheelMath';

describe('randomInt', () => {
  it('stays in range and is roughly uniform', () => {
    const n = 7;
    const counts = new Array(n).fill(0);
    const draws = 70000;
    for (let i = 0; i < draws; i++) counts[randomInt(n)]++;
    for (const c of counts) expect(Math.abs(c - draws / n)).toBeLessThan((draws / n) * 0.06);
  });
  it('rejects invalid n', () => {
    expect(() => randomInt(0)).toThrow();
    expect(() => randomInt(1.5)).toThrow();
  });
});

describe('shuffle / pickWinner', () => {
  it('shuffle keeps every element', () => {
    const src = [1, 2, 3, 4, 5, 6];
    expect(shuffle(src).sort()).toEqual(src);
  });
  it('pickWinner covers the whole list, not just a visible subset', () => {
    const items = Array.from({ length: 40 }, (_, i) => i);
    const seen = new Set<number>();
    for (let i = 0; i < 4000; i++) seen.add(pickWinner(items));
    expect(seen.size).toBe(40);
  });
});

describe('sampleSlices', () => {
  const items = Array.from({ length: 33 }, (_, i) => `c${i}`);
  it('always contains the winner exactly once, never exceeds max, no duplicates', () => {
    for (let i = 0; i < 300; i++) {
      const winner = pickWinner(items);
      const { slices, winnerIndex } = sampleSlices(items, winner, 12);
      expect(slices).toHaveLength(12);
      expect(new Set(slices).size).toBe(12);
      expect(slices[winnerIndex]).toBe(winner);
    }
  });
  it('shows everything when the list is shorter than max', () => {
    const { slices } = sampleSlices(['a', 'b', 'c'], 'b', 12);
    expect(slices.sort()).toEqual(['a', 'b', 'c']);
  });
  it('winner position is uniform across slices', () => {
    const counts = new Array(12).fill(0);
    for (let i = 0; i < 12000; i++) counts[sampleSlices(items, items[0], 12).winnerIndex]++;
    for (const c of counts) expect(Math.abs(c - 1000)).toBeLessThan(200);
  });
});

describe('wheel geometry', () => {
  it('targetRotation lands the pointer on the requested slice', () => {
    for (const count of [1, 2, 5, 12]) {
      for (let index = 0; index < count; index++) {
        for (const offset of [-0.4, 0, 0.4]) {
          const current = Math.random() * 20;
          const r = targetRotation(current, index, count, 5, offset);
          expect(r).toBeGreaterThan(current + 4 * TAU);
          expect(sliceUnderPointer(r, count)).toBe(index);
        }
      }
    }
  });
  it('easeOutQuart is monotonic from 0 to 1', () => {
    expect(easeOutQuart(0)).toBe(0);
    expect(easeOutQuart(1)).toBe(1);
    expect(easeOutQuart(0.5)).toBeGreaterThan(0.5);
  });
});
