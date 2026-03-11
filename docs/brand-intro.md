# Brand Intro Section — Complete Reference

## HTML Structure (`index.html:393–469`)

One `<section id="brand-intro">` containing a single block:

**`.brand-block.brand-block--hero[data-brand="0"]`** — the pinned full-screen container. Inside it, in z-order:

1. **`.brand-img-strip`** (line 399–407) — **Mobile only** (<1024px). 7 stacked `<img>` elements (absolute, full-bleed). Each starts below the viewport (`yPercent: 100`) and slides up to cover the previous during scroll.

2. **`.brand-desktop-panels`** (line 408–425) — **Desktop only** (≥1024px). A 3-column CSS grid:
   - `.brand-panel--left` — 5 images (growth/ + new/)
   - `.brand-panel--center` — empty black column
   - `.brand-panel--right` — 5 images (all new/)

   Images are absolutely positioned inside each panel with 20px margin on all sides. They scroll up continuously (masonry-style), with left and right columns offset by half a step so they never transition simultaneously.

3. **`.brand-bg-overlay`** (line 426) — Semi-transparent black gradient overlay sitting above images (z-index: 10), darkening the background so text is readable.

4. **`.brand-text`** (line 429–464) — The text layer (z-index: 20 via stacking context). Contains:
   - **`<h2>`** — Orange headline: "Watch them kick off with a smile..."
   - **`.brand-subtitle-area`** — A CSS grid where all 6 subtitles occupy the same cell (grid-area: 1/1). Each subtitle (data-step 0–5) starts hidden (`opacity: 0, y: 40px`) and animates in/out sequentially as you scroll. The last subtitle (step 5) includes a CTA button.

---

## CSS (`src/styles.css`)

**Base styles (all viewports):**
- `.brand-block` (line 163) — `position: relative; overflow: hidden; min-height: 100svh; display: flex; align-items: center; justify-content: center`
- `.brand-img-strip` (line 173) — `position: absolute; inset: 0` with images `position: absolute; inset: 0; object-fit: cover`
- `.brand-bg-overlay` (line 188) — absolute overlay with gradient from 40% to 85% black opacity
- `.brand-subtitle-area` (line 231) — `display: grid` so subtitles stack in the same cell
- `.brand-desktop-panels` (line 389) — `display: none` (hidden by default)

**768px breakpoint** (line 332):
- `.brand-block` gets `min-height: 80vh`
- `.brand-block--hero .brand-text` gets `max-width: 800px`

**1024px breakpoint** (line 391):
- `.brand-block--hero` forced to `height: 100vh !important; max-height: 100vh !important` — overrides ScrollTrigger's inline styles that would otherwise cap height below viewport
- `.brand-img-strip` hidden (`display: none`)
- `.brand-desktop-panels` becomes a `display: grid; grid-template-columns: 1fr 1fr 1fr; position: absolute; inset: 0` covering the full hero block
- `.brand-panel` — `position: relative; overflow: hidden`
- `.brand-panel--center` — `background: #000`
- `.brand-panel img` — `position: absolute; left/right/top: 20px; width: calc(100% - 40px); height: calc(100% - 40px); object-fit: cover`
- `.brand-text` — `max-width: 700px; margin: 0 auto; text-align: center`

---

## JS — `initBrandIntroAnimations()` (`src/main.js:365–489`)

**Setup (line 365–397):**
- Queries `[data-brand="0"]` as `block0`
- `isDesktop = window.matchMedia("(min-width: 1024px)").matches` — one-time check at init
- Grabs `.brand-text`, `h2`, and all `.brand-subtitle` elements
- Hides text initially: `gsap.set(textEl, { y: 400, opacity: 0 })`
- **Mobile path**: sets strip images to stacked positions (`yPercent: 0` for first, `100` for rest, ascending `zIndex`)
- **Desktop path**: sets panel images to `yPercent: 0` (first) or `104` (rest, slightly below for gap)

**ScrollTrigger timeline (line 399–409):**
- Pins `block0` at `top top`
- Total scroll distance: `window.innerHeight * 15` (12 + 3 breathing room)
- `scrub: 3` — smooth scroll-linked animation with 3s of smoothing
- `invalidateOnRefresh: true` — recalculates on resize

**Timeline sequence (shared by both mobile and desktop):**

| Timeline position | What happens |
|---|---|
| `0 → 0.75` | Hold — first image visible, nothing else moves |
| `0.75 → 1.75` | `.brand-text` fades up (`y: 400 → 0, opacity: 0 → 1`) |
| `1.75 → 2.25` | Hold — headline visible before subtitles |
| `2.25 → ~19.05` | **Subtitle carousel** — 6 subtitles cycle through. Each: slide in (0.8), hold (1.4), slide out (0.8). Last subtitle doesn't slide out. |
| `~19.05 → 20.55` | Final hold — everything static, pin stays |

**Background image animations (line 444–485) — run in parallel with the subtitle carousel:**

- **Mobile** (line 444–459): 6 slide-up transitions spread evenly from `0.75` to end of timeline. Each image slides from `yPercent: 100 → 0`, covering the previous.

- **Desktop** (line 460–485):
  - Left column: 4 transitions (5 images), spread evenly across `driftStart` to `tlDuration`. Linear ease (`"none"`), no gaps — images scroll continuously with every scroll tick. Outgoing goes to `yPercent: -104`, incoming from `104 → 0`. The 4% overshoot creates a black gap between images.
  - Right column: same but offset by half a step (`rightDur * 0.5`) so the two columns never transition at the same time.
