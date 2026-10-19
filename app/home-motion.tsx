'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useInnerMotion } from './inner-motion';
import { chapterProgress, gameProgress, cinematicPose, craftStage, clamp, jumpProgress, heroProgress, heroFollow, type Chapter } from '@/lib/cinematic-motion';
import { triviaTilePose } from '@/lib/world-motion';

/** Native scroll, batched DOM reads/writes and an on-demand interpolation loop. */
export function HomeMotion() {
  useInnerMotion();
  const pathname = usePathname();
  useEffect(() => {
    const sections = [...document.querySelectorAll<HTMLElement>('[data-cinematic]')];
    const lightSections = [...document.querySelectorAll<HTMLElement>('[data-theme=light]')];
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const coarse = matchMedia('(pointer: coarse)');
    const header = document.querySelector<HTMLElement>('.site-header');
    header?.classList.add('home-masthead');
    let enabled = false, raf = 0, resizeRaf = 0, previousTime = 0, disposed = false;
    let observer: IntersectionObserver | undefined;
    const visible = new Set<HTMLElement>();
    const current = new Map<HTMLElement, number>();
    const written = new Map<HTMLElement, Set<string>>();
    const originals = new Map<HTMLElement, Map<string, string>>();
    const lastValues = new Map<HTMLElement, Map<string, string>>();
    let measuredWidth = innerWidth, measuredHeight = innerHeight;
    let pointer = { x: 0, y: 0 };
    const hero = sections.find(s => s.dataset.cinematic === 'hero');
    const heel = sections.find(s => s.dataset.cinematic === 'heel');
    // Read the authored fragment vectors once. A transform on the fragment does
    // not make all six faces recalculate inherited CSS variables on every tick.
    const fragments = [...(heel?.querySelectorAll<HTMLElement>('[data-heel-fragment]') ?? [])].map(el => ({
      el, level: Number(el.dataset.heelFragment),
      vector: ['--px', '--py', '--pz', '--dx', '--dy', '--dz', '--spin'].map(key => parseFloat(el.style.getPropertyValue(key))),
    }));
    const scopedTargets = new Map<HTMLElement, Map<string, HTMLElement[]>>();
    const triviaTargets: Record<string, string> = {
      '--question-y': '[data-trivia-question]', '--question-turn': '[data-trivia-question]',
      '--ring-turn': '[data-trivia-rings]', '--ring-opacity': '[data-trivia-rings]',
      '--answer-phase': '[data-trivia-tile]', '--tile-reveal': '[data-trivia-tile]',
      '--topic-icon-opacity': '[data-trivia-icon]', '--answer-label-opacity': '[data-trivia-answer]',
      '--player-phase': '[data-player-avatar], [data-trivia-spark]',
    };
    function targets(el: HTMLElement, key: string, selector: string) {
      if (!scopedTargets.has(el)) scopedTargets.set(el, new Map());
      const cache = scopedTargets.get(el)!;
      if (!cache.has(key)) cache.set(key, [...el.querySelectorAll<HTMLElement>(selector)]);
      return cache.get(key)!;
    }
    let heroStageHeight = 0;
    function write(el: HTMLElement, key: string, value: string) {
      if (lastValues.get(el)?.get(key) === value) return;
      if (!lastValues.has(el)) lastValues.set(el, new Map());
      lastValues.get(el)!.set(key, value);
      if (!originals.has(el)) originals.set(el, new Map());
      if (!originals.get(el)!.has(key)) originals.get(el)!.set(key, el.style.getPropertyValue(key));
      el.style.setProperty(key, value);
      if (!written.has(el)) written.set(el, new Set());
      written.get(el)!.add(key);
    }
    function restore() {
      originals.forEach((values, el) => values.forEach((value, key) => { if (value) el.style.setProperty(key, value); else el.style.removeProperty(key); }));
      originals.clear(); written.clear(); lastValues.clear();
    }
    function progress(el: HTMLElement, rect: DOMRect) {
      if (el.dataset.cinematic === 'jump') return jumpProgress(rect.top, rect.height, innerHeight, el.dataset.pinned === 'true');
      if (el.dataset.cinematic === 'footer') return clamp((innerHeight - rect.top) / Math.max(1, Math.min(rect.height, innerHeight * .85)));
      if (el === hero) return heroProgress(rect.top, rect.height);
      if (el.dataset.pinned === 'true' && ['dream', 'heel', 'trivia', 'chaos'].includes(el.dataset.cinematic!)) return gameProgress(rect.top, rect.height, innerHeight);
      // Short-window fallbacks also hold the book/studio at the first pose on entry.
      if (['dream', 'craft'].includes(el.dataset.cinematic!) && el.dataset.pinned !== 'true') return clamp(-rect.top / Math.max(rect.height * .75, innerHeight * .8));
      return chapterProgress(rect.top, rect.height, innerHeight, el.dataset.pinned === 'true');
    }
    function pose(el: HTMLElement, p: number, follow = 0) {
      const values = cinematicPose(el.dataset.cinematic as Chapter, p);
      const isWorld = ['heel', 'trivia', 'chaos'].includes(el.dataset.cinematic!);
      for (const [key, value] of Object.entries(values)) {
        if (isWorld && key === '--world-enter') continue; // No rendered consumer.
        if (isWorld && key === '--world-progress') { targets(el, key, '[data-world-rail]').forEach(node => write(node, key, value)); continue; }
        if (el === heel) {
          if (key.startsWith('--break-') || key.startsWith('--district-')) continue;
          targets(el, key, key === '--heel-shadow' ? '[data-heel-shadow]' : '[data-heel-shoe]').forEach(node => write(node, key, value));
        } else if (el.dataset.cinematic === 'trivia' && triviaTargets[key]) {
          targets(el, key, triviaTargets[key]).forEach(node => write(node, key, value));
        } else write(el, key, value);
      }
      if (el === heel) for (const { el: fragment, level, vector: [px, py, pz, dx, dy, dz, spin] } of fragments) {
        const b = Number(values[`--break-${['a', 'b', 'c'][level]}`]);
        const n = (v: number) => v.toFixed(5);
        write(fragment, 'transform', `translate3d(${n(px + b * dx)}cqw,${n(py + b * dy - Math.sin(b * Math.PI) * 8)}cqw,${n(pz + b * dz)}cqw) rotateX(${n(b * spin)}deg) rotateY(${n(b * spin * .7)}deg) rotateZ(${n(b * spin * .55)}deg)`);
      }
      if (el === hero) write(el, '--hero-follow-y', `${follow.toFixed(3)}px`);
      if (isWorld) {
        const phase = String(Math.min(2, Math.floor(p * 3)));
        if (el.dataset.worldPhase !== phase) el.dataset.worldPhase = phase;
      }
      if (el.dataset.cinematic === 'trivia') targets(el, 'tiles', '[data-trivia-tile]').forEach((tile, i) => {
        const tilePose = triviaTilePose(i, p);
        write(tile, 'transform', `translate3d(${tilePose.x.toFixed(5)}cqw,${tilePose.y.toFixed(5)}cqw,${tilePose.z.toFixed(5)}px) rotateZ(${tilePose.turn.toFixed(5)}deg) rotateY(${tilePose.yaw.toFixed(5)}deg)`);
      });
      if (el.dataset.cinematic === 'chaos') el.dispatchEvent(new CustomEvent<number>('world-progress', { detail: parseFloat(values['--chaos-frame']) }));
      if (el.dataset.cinematic === 'craft') {
        const stage = craftStage(p);
        el.dataset.phase = String(stage);
        el.querySelectorAll<HTMLElement>('[data-step]').forEach((node, i) => {
          node.setAttribute('data-active', String(i === stage));
          node.setAttribute('data-complete', String(i < stage));
          if (i === stage) node.setAttribute('aria-current', 'step'); else node.removeAttribute('aria-current');
        });
        el.querySelectorAll<HTMLElement>('[data-phase-caption]').forEach((node, i) => { node.hidden = i !== stage; });
      }
    }
    function render(time: number) {
      raf = 0;
      if (!enabled || document.hidden || disposed) return;
      const dt = previousTime ? Math.min(time - previousTime, 64) : 16;
      previousTime = time;
      const alpha = 1 - Math.exp(-dt / 45);
      // Read before writing; never update React state for a scroll frame.
      const reads = [...visible].map(el => ({ el, rect: el.getBoundingClientRect() }));
      let unsettled = false;
      const light = lightSections.some(el => { const rect = el.getBoundingClientRect(); return rect.top <= 55 && rect.bottom > 55; });
      for (const { el, rect } of reads) {
        const inView = String(rect.top < innerHeight && rect.bottom > 0);
        if (el.dataset.inView !== inView) el.dataset.inView = inView;
        if (el.dataset.cinematic === 'craft') el.dataset.craftEntered = String(rect.top < innerHeight * .28 && rect.bottom > 0);
        const target = progress(el, rect);
        const old = current.get(el) ?? target;
        const p = Math.abs(target - old) < .00015 ? target : old + (target - old) * alpha;
        current.set(el, p);
        if (Math.abs(target - p) > .00015) unsettled = true;
        pose(el, p, el === hero && el.dataset.pinned === 'true' ? heroFollow(rect.top, rect.height, heroStageHeight) : 0);
      }
      header?.classList.toggle('on-light', light);
      if (hero && visible.has(hero)) {
        write(hero, '--pointer-x', `${pointer.x.toFixed(3)}px`);
        write(hero, '--pointer-y', `${pointer.y.toFixed(3)}px`);
      }
      if (unsettled) raf = requestAnimationFrame(render);
    }
    function schedule() { if (!raf && enabled && !document.hidden) { previousTime = 0; raf = requestAnimationFrame(render); } }
    function reset() {
      if (disposed) return;
      observer?.disconnect(); visible.clear(); current.clear();
      cancelAnimationFrame(raf); raf = 0;
      restore();
      header?.classList.remove('on-light');
      enabled = !reduced.matches && 'IntersectionObserver' in window;
      if (!enabled) {
        sections.forEach(el => { delete el.dataset.pinned; delete el.dataset.motionReady; delete el.dataset.phase; delete el.dataset.inView; delete el.dataset.craftEntered; delete el.dataset.worldPhase; });
        sections.forEach(el => el.querySelectorAll<HTMLElement>('[data-phase-caption]').forEach((node, i) => { node.hidden = i !== 1; }));
        return;
      }
      const textSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
      sections.forEach(el => {
        if (el.dataset.pin === 'true' && innerHeight >= 480 && textSize < 24) el.dataset.pinned = 'true';
        else delete el.dataset.pinned;
        pose(el, 0);
      });
      // Measure readable content, not transformed artwork, shadows or whiteout.
      const overflowing = sections.filter(el => {
        const stage = el.querySelector<HTMLElement>('[data-stage]');
        if (el.dataset.pinned !== 'true' || !stage) return false;
        const content = el.querySelector<HTMLElement>(el.dataset.cinematic === 'hero' ? '[data-hero-copy]' : '[data-fit-content]');
        if (!content) return false;
        const padding = getComputedStyle(el.dataset.cinematic === 'hero' ? el.querySelector<HTMLElement>('[data-hero-inner]')! : stage);
        return content.offsetHeight + parseFloat(padding.paddingTop) + parseFloat(padding.paddingBottom) > stage.clientHeight + 3;
      });
      overflowing.forEach(el => { delete el.dataset.pinned; });
      // Use the actual 100svh stage, not the changing mobile browser viewport.
      heroStageHeight = hero?.querySelector<HTMLElement>('[data-stage]')?.getBoundingClientRect().height ?? 0;
      sections.forEach(el => {
        const rect = el.getBoundingClientRect(), p = progress(el, rect);
        pose(el, p, el === hero && el.dataset.pinned === 'true' ? heroFollow(rect.top, rect.height, heroStageHeight) : 0); current.set(el, p); el.dataset.motionReady = 'true';
        el.dataset.inView = String(rect.top < innerHeight && rect.bottom > 0);
        if (el.dataset.cinematic === 'craft') el.dataset.craftEntered = String(rect.top < innerHeight * .28 && rect.bottom > 0);
        if (rect.bottom > -innerHeight * .2 && rect.top < innerHeight * 1.2) visible.add(el);
      });
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) visible.add(el);
          else { visible.delete(el); current.delete(el); el.dataset.inView = 'false'; }
        }
        schedule();
      }, { rootMargin: '20% 0px', threshold: 0 });
      sections.forEach(el => observer!.observe(el));
    }
    function resize() {
      // Mobile toolbar changes do not change the authored 100svh stage. Avoid
      // rebuilding all observers and poses during each toolbar movement.
      const toolbarOnly = coarse.matches && innerWidth === measuredWidth && (innerHeight >= 480) === (measuredHeight >= 480);
      measuredWidth = innerWidth; measuredHeight = innerHeight;
      if (toolbarOnly) { schedule(); return; }
      if (!resizeRaf) resizeRaf = requestAnimationFrame(() => { resizeRaf = 0; reset(); });
    }
    function visibility() { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; sections.forEach(el => { el.dataset.inView = 'false'; }); } else schedule(); }
    function move(e: PointerEvent) {
      if (!enabled || !fine.matches || !hero || !visible.has(hero)) return;
      pointer = { x: (e.clientX / innerWidth - .5) * -8, y: (e.clientY / innerHeight - .5) * -6 };
      schedule();
    }
    function leave() { pointer = { x: 0, y: 0 }; schedule(); }
    // Links never disappear under a keyboard user: reveal the finished pose on focus.
    function focus(e: FocusEvent) {
      const chapter = (e.target as HTMLElement)?.closest<HTMLElement>('[data-cinematic]');
      if (chapter) chapter.dataset.hasFocus = 'true';
    }
    function blur(e: FocusEvent) {
      const chapter = (e.target as HTMLElement)?.closest<HTMLElement>('[data-cinematic]');
      if (chapter && !chapter.contains(e.relatedTarget as Node | null)) delete chapter.dataset.hasFocus;
    }
    reset();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', visibility);
    document.addEventListener('focusin', focus); document.addEventListener('focusout', blur);
    reduced.addEventListener('change', reset);
    hero?.addEventListener('pointermove', move, { passive: true }); hero?.addEventListener('pointerleave', leave);
    // Images already reserve their dimensions. Only readable-content size can
    // change whether a stage fits; an image finishing must not reset all scenes.
    const contentSizes = new WeakMap<Element, number>();
    const contentObserver = new ResizeObserver(entries => {
      let changed = false;
      for (const entry of entries) {
        const old = contentSizes.get(entry.target), height = entry.contentRect.height;
        if (old !== undefined && Math.abs(old - height) > 1) changed = true;
        contentSizes.set(entry.target, height);
      }
      if (changed && !resizeRaf) resizeRaf = requestAnimationFrame(() => { resizeRaf = 0; reset(); });
    });
    document.querySelectorAll('[data-hero-copy], [data-fit-content]').forEach(el => contentObserver.observe(el));
    // Prepare background sprites even while their scroll pose is transparent.
    // Keep their original CSS rendering, including the repeating book texture.
    const spriteSheets: Record<string, string[]> = { dream: ['dream-cutouts'], trivia: ['trivia-icons', 'tadri-players'] };
    const artworkObserver = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach(img => { img.loading = 'eager'; });
        for (const name of spriteSheets[(entry.target as HTMLElement).dataset.cinematic!] ?? []) {
          const img = new Image();
          img.srcset = `/assets/${name}-small.webp 1x, /assets/${name}.webp 2x`;
          img.src = `/assets/${name}.webp`;
          img.decode().catch(() => { /* CSS keeps the original fallback if unavailable. */ });
        }
        artworkObserver.unobserve(entry.target);
      }
    }, { rootMargin: `${Math.round(innerHeight * 1.5)}px 0px` });
    sections.filter(el => spriteSheets[el.dataset.cinematic!] || el.querySelector('img[loading="lazy"]')).forEach(el => artworkObserver.observe(el));
    document.fonts.ready.then(() => { if (!disposed) reset(); });
    return () => {
      disposed = true; enabled = false; observer?.disconnect(); cancelAnimationFrame(raf); cancelAnimationFrame(resizeRaf);
      restore();
      sections.forEach(el => { delete el.dataset.pinned; delete el.dataset.motionReady; delete el.dataset.hasFocus; delete el.dataset.phase; delete el.dataset.inView; delete el.dataset.craftEntered; delete el.dataset.worldPhase; });
      header?.classList.remove('home-masthead', 'on-light');
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', visibility); document.removeEventListener('focusin', focus); document.removeEventListener('focusout', blur);
      reduced.removeEventListener('change', reset);
      hero?.removeEventListener('pointermove', move); hero?.removeEventListener('pointerleave', leave);
      contentObserver.disconnect();
      artworkObserver.disconnect();
    };
  }, [pathname]);
  return null;
}

export function MoonMotionToggle({className}:{className?:string}) {
  const [paused, setPaused] = useState(false);
  return <button type="button" className={className} aria-label={paused ? 'Resume moon animation' : 'Pause moon animation'} aria-pressed={paused} onClick={() => {
    const next = !paused;
    const footer = document.querySelector<HTMLElement>('[data-cinematic=footer]');
    if (footer) footer.dataset.moonPaused = String(next);
    setPaused(next);
  }}><svg aria-hidden="true" viewBox="0 0 20 20" width="14" height="14">{paused ? <path d="m7 4 9 6-9 6Z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /> : <path d="M7 4v12m6-12v12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />}</svg><span>{paused ? 'Resume moon' : 'Pause moon'}</span></button>;
}
