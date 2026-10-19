/** Authored, reversible motion. Each pose is a function of document scroll only. */
export type WorldKind = 'heel' | 'trivia' | 'chaos';
/** Scene units are percentages of art width, keeping the avatar row below every card pose. */
export const triviaLayout = { aspect: 1.16, anchorY: 32, orbitRadiusY: 18, playersTop: 70, playerHeight: 14, playerRise: 2 } as const;
export const bounded = (p: number) => Number.isFinite(p) ? Math.max(0, Math.min(1, p)) : 0;
const range = (p: number, a: number, b: number) => bounded((p - a) / (b - a));
const ease = (p: number) => p * p * (3 - 2 * p);
const phase = (p: number, a: number, b: number) => ease(range(p, a, b));
const n = (v: number) => v.toFixed(5);
export function worldPose(kind: WorldKind, progress: number): Record<string, string> {
  const p = bounded(progress);
  const common = { '--world-progress': n(p), '--world-enter': n(phase(p, 0, .12)) };
  if (kind === 'heel') {
    const approach = phase(p, .06, .3), drop = phase(p, .3, .8);
    return { ...common,
      '--heel-y': `${n(-10 + approach * 8 + drop * 22.5)}cqw`,
      '--heel-turn': `${n(-4 + approach * 4)}deg`,
      '--heel-shadow': n(.28 + approach * .28),
      '--break-a': n(phase(p, .3, .58)), '--break-b': n(phase(p, .46, .76)),
      '--break-c': n(phase(p, .63, .92)),
      '--district-rise': `${n((1 - phase(p, .42, .96)) * 5)}%`,
      '--district-scale': n(1.035 - phase(p, .1, .96) * .035),
    };
  }
  if (kind === 'trivia') {
    return { ...common, '--question-y': `${n(-phase(p, .63, .94) * 12)}cqw`,
      '--question-turn': `${n(-8 + phase(p, .08, .6) * 14)}deg`,
      '--ring-turn': `${n(phase(p, .08, .7) * 82)}deg`,
      '--ring-opacity': n(1 - phase(p, .68, .94) * .75),
      '--answer-phase': n(phase(p, .66, .93)),
      // Finish the illustrated category fade before the face becomes a short answer card.
      '--topic-icon-opacity': n(1 - phase(p, .57, .67)),
      '--answer-label-opacity': n(phase(p, .74, .93)),
      '--player-phase': n(phase(p, .35, .72)),
      '--tile-reveal': n(phase(p, .02, .13)),
    };
  }
  return { ...common, '--chaos-frame': n(phase(p, .06, .94)),
    '--chaos-glow': n(phase(p, .43, .96)),
    '--chaos-caption': n(p < .35 ? 0 : p < .7 ? 1 : 2),
  };
}
export function triviaTilePose(index: number, progress: number) {
  const p = bounded(progress), orbit = phase(p, .08, .62), gather = phase(p, .64, .94);
  const angle = [-2.4, -.76, 2.4, .76][index] + orbit * .85;
  const x = Math.cos(angle) * 29, y = Math.sin(angle) * triviaLayout.orbitRadiusY;
  const endX = index % 2 ? 17 : -17, endY = index < 2 ? 10 : 23;
  return { x: x + (endX - x) * gather, y: y + (endY - y) * gather,
    z: Math.sin(angle) * 25 * (1 - gather),
    turn: (Math.cos(angle) * 12 - 4) * (1 - gather),
    yaw: Math.sin(angle) * 17 * (1 - gather),
  };
}
export function sequenceFrame(progress: number, count: number) {
  return Math.round(bounded(progress) * Math.max(0, Math.floor(count) - 1));
}
/** Closest ready frame prevents a flash during fast seeks or a slow connection. */
export function closestFrame(target: number, available: Iterable<number>) {
  let best: number | undefined, distance = Infinity;
  for (const frame of available) if (Math.abs(frame - target) < distance) { best = frame; distance = Math.abs(frame - target); }
  return best;
}
export function frameWindow(target: number, count: number, direction = 1, lookahead = 5) {
  const offsets = direction < 0 ? [0, -1, -2, 1, -3, 2, -4, -5] : [0, 1, 2, -1, 3, -2, 4, 5];
  for (let i = 6; i <= Math.min(16, lookahead); i++) offsets.push(i * direction);
  return offsets.map(i => target + i).filter(i => i >= 0 && i < count);
}
export class DecodedFrameCache<T extends { close?: () => void }> {
  private frames = new Map<number, T>();
  readonly limit: number;
  readonly protectedFrames: ReadonlySet<number>;
  constructor(limit = 12, protectedFrames: ReadonlySet<number> = new Set()) {
    if (!Number.isInteger(limit) || limit < 1 || protectedFrames.size >= limit) throw new Error('Frame cache needs room for a moving frame');
    this.limit = limit; this.protectedFrames = protectedFrames;
  }
  get size() { return this.frames.size; }
  has(index: number) { return this.frames.has(index); }
  get(index: number) { return this.frames.get(index); }
  keys() { return this.frames.keys(); }
  set(index: number, frame: T, target: number) {
    const old = this.frames.get(index); if (old && old !== frame) old.close?.();
    this.frames.set(index, frame);
    while (this.frames.size > this.limit) {
      let farthest = index, distance = -1;
      for (const candidate of this.frames.keys()) if (candidate !== target && !this.protectedFrames.has(candidate) && Math.abs(candidate - target) > distance) { farthest = candidate; distance = Math.abs(candidate - target); }
      this.frames.get(farthest)?.close?.(); this.frames.delete(farthest);
    }
  }
  clear() { this.frames.forEach(frame => frame.close?.()); this.frames.clear(); }
}
