'use client';
import { useEffect, useRef } from 'react';
import { closestFrame, DecodedFrameCache, frameWindow, sequenceFrame } from '@/lib/world-motion';

type Frame = CanvasImageSource & { close?: () => void };
export type SequenceSource = { count: number; width: number; height: number; base: string; mobileBase: string; revision: string };
/** A capped decoded-frame cache. Scroll seeks never decode the complete sequence. */
export function WorldSequence({ source, sectionId }: { source: SequenceSource; sectionId: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current, section = document.getElementById(sectionId);
    if (!canvas || !section) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const narrow = matchMedia('(max-width: 700px)');
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    // Decoded pixels, not compressed file size, determine memory use.
    // Mobile frames are smaller; keep a longer runway within the same budget.
    let cache = new DecodedFrameCache<Frame>(narrow.matches ? 24 : 12);
    const requests = new Map<number, AbortController>();
    let disposed = false, nearby = false, visible = false, target = 0, previous = 0, direction = 1;
    let queue: number[] = [], raf = 0, generation = 0;
    let queuedTarget = -1, releaseTimer: ReturnType<typeof setTimeout> | undefined;
    let paintedFrame = -1, paintedWidth = 0, paintedHeight = 0;
    let base = narrow.matches ? source.mobileBase : source.base;
    function paint() {
      raf = 0;
      if (disposed || !visible || document.hidden || reduced.matches) return;
      const ready = closestFrame(target, cache.keys());
      if (ready === undefined) return;
      if (ready === paintedFrame && canvas!.width === paintedWidth && canvas!.height === paintedHeight) return;
      const frame = cache.get(ready)!;
      const width = 'width' in frame ? Number(frame.width) : source.width;
      const height = 'height' in frame ? Number(frame.height) : source.height;
      const scale = Math.min(canvas!.width / width, canvas!.height / height);
      ctx!.fillStyle = '#081322'; ctx!.fillRect(0, 0, canvas!.width, canvas!.height);
      ctx!.drawImage(frame, (canvas!.width - width * scale) / 2, (canvas!.height - height * scale) / 2, width * scale, height * scale);
      canvas!.dataset.ready = 'true'; canvas!.dataset.frame = String(ready);
      paintedFrame = ready; paintedWidth = canvas!.width; paintedHeight = canvas!.height;
    }
    function schedule() { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(paint); }
    async function decode(blob: Blob): Promise<Frame> {
      if ('createImageBitmap' in window) return createImageBitmap(blob);
      const url = URL.createObjectURL(blob), image = new Image();
      try { image.src = url; await image.decode(); return image; } finally { URL.revokeObjectURL(url); }
    }
    function pump() {
      if (disposed || !nearby || reduced.matches || document.hidden) return;
      while (requests.size < 3 && queue.length) {
        const index = queue.shift()!;
        if (cache.has(index) || requests.has(index)) continue;
        const controller = new AbortController(), version = generation;
        requests.set(index, controller);
        fetch(`${base}/${String(index).padStart(3, '0')}.webp?v=${encodeURIComponent(source.revision)}`, { signal: controller.signal, cache: 'force-cache' })
          .then(response => { if (!response.ok) throw new Error('Frame unavailable'); return response.blob(); })
          .then(blob => { if (controller.signal.aborted || version !== generation) throw new Error('Obsolete frame'); return decode(blob); }).then(frame => {
            if (disposed || controller.signal.aborted || version !== generation) { frame.close?.(); return; }
            cache.set(index, frame, target); schedule();
          }).catch(() => { /* The fully rendered poster remains available on failure. */ })
          .finally(() => { if (requests.get(index) === controller) requests.delete(index); if (!disposed) pump(); });
      }
    }
    function seek(progress: number) {
      previous = target; target = sequenceFrame(progress, source.count);
      direction = target < previous ? -1 : target > previous ? 1 : direction;
      if (queuedTarget !== target) {
        queuedTarget = target;
        queue = frameWindow(target, source.count, direction, narrow.matches ? 12 : 8).filter(i => !cache.has(i) && !requests.has(i));
        for (const [index, controller] of requests) if (Math.abs(index - target) > 16) { controller.abort(); requests.delete(index); }
      }
      schedule(); pump();
    }
    function progress(event: Event) { seek((event as CustomEvent<number>).detail); }
    function release() {
      generation++; requests.forEach(controller => controller.abort()); requests.clear(); queue = [];
      cache.clear(); queuedTarget = -1; paintedFrame = -1; delete canvas!.dataset.ready;
    }
    function mode() {
      release(); base = narrow.matches ? source.mobileBase : source.base;
      cache = new DecodedFrameCache<Frame>(narrow.matches ? 24 : 12);
      if (!reduced.matches && nearby) seek(parseFloat(getComputedStyle(section!).getPropertyValue('--chaos-frame')) || 0);
    }
    const resize = new ResizeObserver(entries => {
      const rect = entries[0].contentRect, density = Math.min(devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.round(rect.width * density)), height = Math.max(1, Math.round(rect.height * density));
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; paintedFrame = -1; schedule(); }
      // Extend the original renderer's Gaussian sky across the entire stage.
      // Its origin and radii stay aligned with the unchanged island frame.
      const stage = canvas.closest<HTMLElement>('[data-stage]');
      if (stage) {
        const frame = canvas.getBoundingClientRect(), bounds = stage.getBoundingClientRect();
        stage.style.setProperty('--sky-x', `${frame.left - bounds.left + frame.width * .58}px`);
        stage.style.setProperty('--sky-y', `${frame.top - bounds.top + frame.height * .44}px`);
        stage.style.setProperty('--sky-rx', `${frame.width * .55}px`);
        stage.style.setProperty('--sky-ry', `${frame.height * .65}px`);
      }
    });
    resize.observe(canvas);
    const preload = new IntersectionObserver(entries => {
      nearby = entries[0].isIntersecting;
      clearTimeout(releaseTimer);
      if (nearby && !reduced.matches) seek(parseFloat(getComputedStyle(section).getPropertyValue('--chaos-frame')) || 0);
      else {
        requests.forEach(controller => controller.abort()); requests.clear(); queue = []; queuedTarget = -1;
        // A quick reverse scroll reuses decoded frames; far-away scenes still
        // release their bounded buffer instead of retaining it for the session.
        releaseTimer = setTimeout(release, 30000);
      }
    }, { rootMargin: `${Math.max(900, innerHeight * 2)}px 0px` });
    const viewport = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) { schedule(); pump(); } }, { threshold: 0 });
    preload.observe(section); viewport.observe(canvas);
    function visibility() { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else { schedule(); pump(); } }
    section.addEventListener('world-progress', progress); document.addEventListener('visibilitychange', visibility);
    reduced.addEventListener('change', mode); narrow.addEventListener('change', mode);
    return () => { disposed = true; clearTimeout(releaseTimer); cancelAnimationFrame(raf); resize.disconnect(); preload.disconnect(); viewport.disconnect(); release();
      section.removeEventListener('world-progress', progress); document.removeEventListener('visibilitychange', visibility);
      reduced.removeEventListener('change', mode); narrow.removeEventListener('change', mode);
    };
  }, [source, sectionId]);
  return <canvas ref={ref} width={source.width} height={source.height} aria-hidden="true" />;
}
