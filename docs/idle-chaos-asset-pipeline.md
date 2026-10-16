# Idle Chaos motion assets

The website uses a scroll-indexed sequence from one authored 3D scene. The images
are rendered from common geometry, camera, lighting and deterministic progress;
they are not independent generative images or crossfades between key art.

## Included outputs

- `public/assets/idle-chaos-frames/000.webp` through `095.webp`: 1100 × 800.
- The corresponding `mobile/000.webp` through `095.webp`: 660 × 480.
- `public/assets/idle-chaos-storm.webp`: the revision-specific poster from the same production scene; `idle-chaos.webp` is retained as an equivalent compatibility copy.
- `public/assets/idle-chaos-frames/scene.json`: dimensions, paths and byte counts.
- `docs/animation-review/idle-chaos-motion.mp4`: linear timing review of all frames.
- `design-assets/render-idle-chaos.py`: complete procedural model/render source.

## Authored animation

At the start, the city sits on a faceted island with roads, a civic clock tower,
fountain, small houses, parks, streetlights, an observatory, a cyan water shelf and
three waterfalls. A small ground vortex grows into a textured, irregular funnel.
The storm now uses a true three-dimensional density field integrated along camera
rays, rather than an opaque funnel mesh capped with separate cloud spheres. An
irregular, broad thundercloud anvil spreads above a rotating funnel. Street-level
dust expands around the touch-down. The final phase adds twin fork lightning,
glowing fissures, fifteen displacing cliff wedges, two roofs lifting into the
vortex and one front house wall collapsing after its roof tears away. Twenty-five
trees deform in the wind, and two uproot. One hundred seventy seeded fragments
spiral upward and outward; one hundred fifty wind-slanted 3D rain streaks pass
through the same depth-aware scene. Internal lightning illumination and cloud
shade dim the city while keeping its windows and water edge visible.
Scrolling backward evaluates the same frame order in reverse. There is no live
physics dependency and no randomly re-seeded animation in the browser.

The offline renderer uses Mesa EGL with ModernGL, common shadow maps, a contact
ambient occlusion pass, warm key/cool fill lighting and an emissive bloom pass.
The storm pass integrates a 72-step density field with directional self-shadow
approximation, rotating noise advection and geometry depth occlusion.
Everything uses a fixed seed of 71. Rendering is capped at eight software threads.

## Regeneration

This preparation script is intended for Linux with working Mesa EGL libraries;
it is not required to install or run the website. No additional NPM dependency,
service account, API key or generation credits are needed.

```sh
python -m venv .venv-idle-render
.venv-idle-render/bin/pip install -r design-assets/requirements-idle-render.txt
LIBGL_ALWAYS_SOFTWARE=1 LP_NUM_THREADS=8 .venv-idle-render/bin/python design-assets/render-idle-chaos.py
```

Use `--preview` to render the four-stage contact sheet before a full run.

## Fidelity and practical limits

The production artwork is an original modeled, stylized city. It preserves the
approved circular diorama, navy/cyan/orange palette and storm escalation, but does
not reproduce the exact painterly buildings from the concept image. The city has
a fixed view with a small authored camera move; scroll is not an orbit control.
The storm density and destruction are authored continuously, not a numerical fluid
or rigid-body simulation. Most buildings remain standing; the visible destruction
is roofs, one front house, affected trees, fragments, fissures and the cliff edge.
These choices keep the sequence coherent and small enough to
deliver without a browser 3D engine or paid rendering service.

The MP4 is a source-asset motion review, not a browser recording. Website scroll
timing, responsive placement and browser performance need to be checked in an
actual browser separately.

## Verified storm-v2 output

The sequence manifest is version 2 with revision `storm-v2`. All 192 WebP files
were decoded and checked at their expected dimensions. All 96 desktop frames are
unique, ordered `000` through `095`, and the poster decodes at 1100 × 800.

| Output | Encoded bytes |
| --- | ---: |
| Desktop sequence, 96 frames | 5,396,972 |
| Mobile sequence, 96 frames | 2,149,190 |
| MP4 asset review, 96 frames / four seconds | 1,489,365 |

The largest adjacent-frame mean pixel change is 3.57 on a 0–255 scale; the mean
across the sequence is 2.34. The largest change coincides with an authored
lightning onset. This is a source-image continuity check, not a browser frame-rate
measurement. The complete verification record is in
`docs/animation-review/idle-chaos-verification.json`.

The frontend reads paths, dimensions, frame count and revision from scene.json. Its fetch URLs include the revision to prevent old force-cached frames surviving a website update. Bump the revision when regenerating different scene content.
