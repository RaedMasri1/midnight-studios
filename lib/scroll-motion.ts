/** Scroll position is the clock. These functions have no DOM or time dependence. */
export const clamp = (value: number) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
export function chapterProgress(top: number, height: number, viewport: number, inset: number) {
  return clamp((inset - top) / Math.max(1, height - (viewport - inset)));
}
export function chapterFrame(progress: number) {
  const p = clamp(progress);
  const ease = (n: number) => { const x = clamp(n); return x * x * (3 - 2 * x); };
  const open = ease((p - .04) / .62);
  const arrive = ease(p / .24);
  return {
    spread: open,
    sideOpacity: .18 + .82 * open,
    centerScale: 1.14 - .14 * open,
    screenLift: 46 * (1 - arrive),
    textLift: 28 * (1 - arrive),
    logoScale: .82 + .18 * open,
    journalScale: 1.16 - .16 * open,
    secondWordLift: 110 * (1 - ease((p - .03) / .28)),
    thirdWordLift: 110 * (1 - ease((p - .2) / .32)),
    progress: p,
  };
}
