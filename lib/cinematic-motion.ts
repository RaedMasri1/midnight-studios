import { worldPose } from './world-motion.ts';
/** Pure, reversible scroll poses. Positions depend only on normalized progress. */
export const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
export const segment = (p: number, start: number, end: number) => clamp((p - start) / (end - start));
export const smooth = (p: number) => { const n = clamp(p); return n * n * (3 - 2 * n); };
export type Chapter = 'hero' | 'jump' | 'dream' | 'craft' | 'journal' | 'footer' | 'heel' | 'trivia' | 'chaos';
export function chapterProgress(top: number, height: number, viewport: number, pinned: boolean) {
  // A pinned chapter starts only once its stage has arrived, not during entry.
  return pinned ? clamp(-top / Math.max(1, height - viewport)) : clamp((viewport * .85 - top) / Math.max(1, height + viewport * .35));
}
/** Start a game while its artwork enters, rather than waiting for the whole stage. */
export function gameProgress(top: number, height: number, viewport: number) {
  const entry = viewport * .2;
  return clamp((entry - top) / Math.max(1, height - viewport + entry));
}
export function craftStage(progress: number) { return progress < .34 ? 0 : progress < .7 ? 1 : 2; }
export function jumpProgress(top: number, height: number, viewport: number, pinned = false) {
  // Start gently on entry and keep most travel for the fully visible stage.
  if (pinned) return top >= 0 ? .12 * clamp((viewport - top) / viewport) : .12 + .88 * clamp(-top / Math.max(1, height - viewport));
  return clamp((viewport - top) / Math.max(1, height + viewport * .35));
}
/** One monotonic timeline spans both the pin and the native section exit. */
export function heroProgress(top: number, height: number) {
  const u = clamp(-top / Math.max(1, height));
  return clamp(u + .2 * Math.sin(Math.PI * u));
}
/** Counter only the stage's native upward exit, inside its existing clip. */
export function heroFollow(top: number, height: number, stageHeight: number) {
  return clamp(stageHeight - (top + height), 0, stageHeight);
}
export function cinematicPose(kind: Chapter, progress: number): Record<string, string> {
  const p = clamp(progress), f = (n: number) => n.toFixed(5);
  if (kind === 'heel' || kind === 'trivia' || kind === 'chaos') return worldPose(kind, p);
  if (kind === 'hero') {
    const travel = smooth(p);
    // Stagger the original layers on this same eased timeline. No completed
    // camera pose waits for a second, independently timed departure fade.
    return {
      '--portal-scale': f(1 + travel * .12),
      '--portal-y': `${f(-travel * 3)}%`,
      '--portal-turn': `${f(-travel * 1.1)}deg`,
      '--mark-opacity': f(1 - smooth(segment(p, .24, .65))),
      '--mark-y': `${f(-travel * 22)}%`,
      '--copy-opacity': f(1 - smooth(segment(p, .28, .76))),
      '--copy-y': `${f(-travel * 80)}px`,
      '--puppy-x': `${f(travel * 24)}%`,
      '--puppy-y': `${f(-Math.sin(travel * Math.PI * .85) * 55 - travel * 25 + smooth(segment(p, .5, .95)) * 36)}px`,
      '--puppy-turn': `${f(-travel * 18)}deg`,
      '--puppy-scale': f(1 + travel * .12),
      '--puppy-opacity': f(1 - smooth(segment(p, .62, .86))),
      '--whiteout': f(smooth(segment(p, .54, 1))),
      '--progress': f(p),
    };
  }
  if (kind === 'jump') {
    const spread = 1 - (1 - p) ** 2;
    return {
      '--front-x': `${f(-spread * 8)}%`, '--rear-x': `${f(spread * 8)}%`,
      '--front-angle': `${f(-4 - spread * 6)}deg`, '--rear-angle': `${f(5 + spread * 7)}deg`,
      '--device-rise': `${f(-Math.sin(spread * Math.PI) * 18)}px`,
      '--platform-turn': `${f(4 - spread * 8)}deg`, '--progress': f(p),
    };
  }
  if (kind === 'dream') {
    const opening = smooth(segment(p, .12, .48));
    return {
      '--cover-angle': `${f(180 * (1 - opening))}deg`,
      '--book-open': f(opening),
      '--cover-lift': `${f(18 * (1 - opening))}px`,
      '--book-x': `${f(-25 * (1 - opening))}%`,
      '--book-tilt': `${f(38 + 10 * (1 - opening))}deg`,
      '--book-turn': `${f(-5 + opening * 5)}deg`,
      '--book-scale': f(.94 + opening * .06),
      // One flattened illustration stack prevents independently rotated planes
      // from cutting through each other. Each whole silhouette unfolds in order.
      '--paper-back': `${f(76 * (1 - smooth(segment(p, .5, .7))))}deg`,
      '--paper-castle': `${f(76 * (1 - smooth(segment(p, .6, .8))))}deg`,
      '--paper-front': `${f(76 * (1 - smooth(segment(p, .69, .89))))}deg`,
      '--paper-cloud': `${f(76 * (1 - smooth(segment(p, .77, .96))))}deg`,
      '--paper-back-opacity': f(smooth(segment(p, .5, .58))),
      '--paper-castle-opacity': f(smooth(segment(p, .6, .68))),
      '--paper-front-opacity': f(smooth(segment(p, .69, .77))),
      '--paper-cloud-opacity': f(smooth(segment(p, .77, .85))),
      '--fold-shade': f(.32 * (1 - opening)),
      '--progress': f(p),
    };
  }
  if (kind === 'journal') {
    const arrive = smooth(segment(p, .04, .46));
    const card = smooth(segment(p, .16, .48));
    return {
      '--progress': f(p), '--journal-opacity': f(arrive),
      '--journal-heading-y': `${f((1 - arrive) * 26)}px`,
      '--journal-image-y': `${f((1 - arrive) * 16)}px`,
      '--journal-image-scale': f(1.025 - arrive * .025),
      '--journal-card-y': `${f((1 - card) * 18)}px`,
      '--journal-card-opacity': f(card),
    };
  }
  if (kind === 'footer') {
    const arrive = smooth(segment(p, .04, .7));
    const moon = smooth(segment(p, .45, 1));
    return {
      '--progress': f(p), '--footer-opacity': f(arrive),
      '--footer-copy-y': `${f((1 - arrive) * 30)}px`,
      '--footer-name-y': `${f((1 - arrive) * 45)}px`,
      '--footer-moon-y': `${f((1 - moon) * 34)}px`,
      '--footer-moon-x': `${f((1 - moon) * -60)}px`,
      '--footer-moon-turn': `${f((1 - moon) * -2)}deg`,
      '--footer-moon-scale': f(1.16 - moon * .1),
    };
  }
  const create = smooth(segment(p, .34, .47));
  const refine = smooth(segment(p, .7, .83));
  return {
    '--progress': f(p), '--timeline-progress': f(smooth(segment(p, .18, .85))),
    '--line-one': f(smooth(segment(p, .16, .34))),
    '--line-two': f(smooth(segment(p, .5, .7))),
    '--studio-create': f(create), '--studio-refine': f(refine),
    '--studio-dog-y': '0px',
    '--studio-dog-turn': '0deg',
    '--studio-cat-x': '0px',
    '--studio-cat-y': '0px',
    '--studio-sketch-x': '0px',
    '--studio-sketch-turn': '0deg',
    '--studio-tools-x': '0px',
    '--studio-tools-turn': '0deg',
    '--studio-floor-y': '0px',
  };
}
export function bookMilestone(p: number) { return p < .32 ? 'A closed chapter' : p < .52 ? 'The pages unfold' : p < .78 ? 'A world takes shape' : 'An adventure in the making'; }
