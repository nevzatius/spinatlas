export const TAU = Math.PI * 2;

/**
 * Wheel geometry: slice i spans [rotation + i*step, rotation + (i+1)*step) measured clockwise from the
 * top, and the pointer is fixed at the top. So slice i is under the pointer when
 * (-rotation) mod TAU lies inside [i*step, (i+1)*step).
 */
export function sliceUnderPointer(rotation: number, count: number): number {
  const step = TAU / count;
  const pos = (((-rotation) % TAU) + TAU) % TAU;
  return Math.min(count - 1, Math.floor(pos / step));
}

/**
 * Final rotation (always > current) that lands the pointer on `index`, after `turns` extra full turns.
 * `offset` in (-0.5, 0.5) shifts the stop point inside the slice (fraction of a slice).
 */
export function targetRotation(current: number, index: number, count: number, turns: number, offset: number): number {
  const step = TAU / count;
  const wanted = -((index + 0.5 + offset) * step); // rotation (mod TAU) that centers the pointer on that spot
  const base = ((((wanted - current) % TAU) + TAU) % TAU);
  return current + base + turns * TAU;
}

export function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}
