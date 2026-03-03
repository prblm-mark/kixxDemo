# /build-section

Build a full page section from Figma into the Kixx landing page — a top-down composition of
existing components with responsive breakpoints, container rules, and GSAP ScrollTrigger integration.

Usage: `/build-section <Figma URL or node description>`

---

## Process (follow every step in order)

> **Plan mode is read-only.** Steps 1–7 may be run during planning. Step 8 (Implement) and
> Steps 9–10 (Document / Register) MUST NOT run until the user approves the plan and asks to
> implement. Never write, edit, or create files during planning — not even for a "trivial" fix.

### 1. Locate

**Step 1a — Tier gate:**
Call `get_metadata` on the **Figma file page** to see the full layer tree and locate the target
section frame.

- If the frame is tagged `Tier=Section` → continue to Step 1b.
- If the frame is `Tier=Template` → **STOP.**
  > "This is a Tier=Template frame — a full page or multi-section layout.
  > Break it into individual `Tier=Section` frames in Figma first, then run `/build-section`
  > on each one."
- If the frame is an atomic or pattern-tier component → **STOP.**
  > "This is an atomic/pattern component, not a page section.
  > Use `/build-component` to build it."

**Step 1b — enumerate breakpoint variants:**
Call `get_metadata` on the section frame node. Scan children for breakpoint variants
(Desktop, Tablet, Mobile — or similar naming).

Build a breakpoint table:

| Node ID | Breakpoint | Dimensions | Notes |
|---|---|---|---|
| 68:5444 | Desktop | 1440×… | — |
| 68:5488 | Tablet | 768×… | — |
| 68:5512 | Mobile | 375×… | — |

**Step 1c — gather context:**
**STOP** and ask the user:

> "Before I analyse this section, could you share context about:
> - Scroll-triggered animations? (fade-ins, parallax, pinned elements)
> - Connections to adjacent sections? (shared backgrounds, overlapping elements)
> - Dynamic content? (CMS-driven text, variable-length lists)
> - Any behaviour not visible in the static Figma design?"

Wait for the user's response before continuing.

### 2. Screenshot

Call `get_screenshot` on **each breakpoint variant** from the Step 1b table.
Label each clearly (e.g. "Desktop variant", "Mobile variant").

Use these as the visual reference throughout — design context output may not capture
gradients, blend modes, or layering that screenshots reveal.

### 3. Child component inventory

**Step 3a — scan children:**
Call `get_design_context` on the **Desktop variant**. Scan every `data-name="..."` attribute
in the output. Any element with a `data-name` IS a Figma component instance.

Build a dependency table:

| data-name | Figma node | In `src/styles.css`? | In `src/components/`? | In `index.html`? | Status |
|---|---|---|---|---|---|
| Button | 68:5500 | Yes | — | Yes | OK |
| TestimonialCard | 68:5510 | — | — | — | **Missing** |

**Step 3b — audit existing children:**
For each child with Status=OK, run `/review-component` Steps 3–4 (design context + child scan)
to verify it's up to date. Mark as **Outdated** if tokens or variants have drifted.

**Step 3c — hard gate:**
If ANY child is **Missing** or **Outdated** → **STOP.** Report the full table to the user.

> "These child components must be built or updated before the section can proceed:
> - [ComponentName] — Missing / Outdated (reason)
>
> Use `/build-component` or `/update-components` to resolve them first."

Do not proceed to Step 4 until every child is Status=OK.

### 4. Responsive strategy

**Step 4a — fetch all breakpoints:**
Call `get_design_context` on **each breakpoint variant** from the Step 1b table.

**Step 4b — build responsive matrix:**
Compare across breakpoints and document every difference:

| Property | Mobile (default) | Tablet (`md:`) | Desktop (`lg:`) |
|---|---|---|---|
| Container | `px-4` | `px-8` | `max-w-7xl mx-auto px-12` |
| Grid | `flex flex-col` | `grid grid-cols-2` | `grid grid-cols-3` |
| Heading size | `--clamp-*` | — | — |
| Spacing | `gap-6` | `gap-8` | `gap-12` |
| Hidden elements | — | — | `.desktop-only` visible |
| Element order | stacked | — | reordered |

**Rules:**
- Mobile-first CSS — base styles are mobile, layer up with `md:` / `lg:`
- Use Tailwind responsive prefixes in HTML for layout shifts
- **Never** create `.section--mobile` / `.section--desktop` modifier classes
- Clamp tokens (`var(--clamp-*)`) are inherently responsive — no breakpoint overrides needed
- Standard breakpoints: `768px` (md) / `1024px` (lg)

### 5. Section design context

Call `get_design_context` on the **Desktop root frame** (the section itself, not a child).

Extract section-level properties:
- Container strategy (max-width, padding, centering)
- Background (color, gradient, image — flag if gradient visible in screenshot but missing from context)
- z-index and blend modes
- Overflow behavior
- min-height / aspect ratio
- Semantic element (`<section>`, `<aside>`, `<footer>`)

Check `index.html` for the insertion point:
- Where does this section sit relative to existing sections?
- Is it inside `#smooth-content` (required for ScrollSmoother)?
- What is the heading hierarchy? (Next `<h2>` after hero's `<h1>`, etc.)

### 6. Token validation

Call `get_variable_defs` on the section root node.

Apply the same stop rules as `/build-component` Step 5:
- Scan for any design value without a corresponding semantic token
- Design values: colors, spacing/sizing, typography, border-radius
- Structural CSS (`transition`, `opacity`, `cursor`) does NOT need tokens

**STOP for any unresolved design value.** Report each gap:
- Property name, affected breakpoint/element
- Figma value and primitive name

**Prior approvals do NOT carry forward** — each use requires explicit confirmation.

Validate section-level tokens exist in `:root` / `@theme`:
- Background colors/gradients
- Section padding/spacing scale
- Any new typography sizes

### 7. GSAP / scroll planning

**Step 7a — animation intent:**
Review the user's response from Step 1c. If no scroll animations were mentioned and the
Figma design shows no animation cues → note "Static section, no GSAP" and skip to Step 8.

**Step 7b — ScrollTrigger config:**
For each animated element, design:
- `trigger`: which element starts the animation
- `start` / `end`: scroll positions (e.g. `"top 80%"` / `"bottom 20%"`)
- Play mode: `play`, `play reverse`, `restart`, or `scrub`
- Pin: is any element pinned during scroll?

**Step 7c — timeline integration rules:**
- The hero `tl` in `src/main.js` is a **self-contained load animation — never append to it**
- New sections use **independent `gsap.timeline()` instances with their own ScrollTrigger**
- Code placement:
  - <20 lines of GSAP → `src/main.js` under a `// -- SectionName --` comment block
  - ≥20 lines → new file `src/section-<name>.js` with its own `<script>` tag
- `gsap.set()` for initial states (hidden, offset) — not CSS classes
- Use labeled phases within the timeline for readability

**Step 7d — conflict check:**
Before implementing, verify:
- No existing GSAP tweens target elements in this section
- No CSS `transition` properties conflict with GSAP-animated properties
- ScrollSmoother is already initialized in `src/main.js` — do NOT create a second instance
- If ScrollSmoother is not yet initialized, note that it needs to wrap `#smooth-content`

### 8. Implement

> **Do not run this step until the user approves the plan.**

#### HTML

- `<section id="section-name">` with Tailwind layout classes
- Compose children using their existing BEM classes — do not reinvent child markup
- Semantic heading hierarchy: next `<h2>` after hero `<h1>`, sequential within page
- Use **exact text from Figma** design context — no invented placeholders
- WCAG 2.1 AA: landmarks, alt text, aria-labels, 44×44px touch targets
- Place inside `#smooth-content` for ScrollSmoother compatibility

#### CSS

- Add to `src/styles.css` under `/* -- SectionName -- */` comment block
- BEM naming: `.section-name`, `.section-name__element`, `.section-name--modifier`
- Mobile-first: base styles = mobile, layer up with `@media (min-width: 768px)` / `1024px`
- Semantic tokens only (or primitives explicitly approved in Step 6)
- `rem` for dimensions; `px` for borders and shadows
- No CSS transitions on GSAP-animated properties

#### Tokens

Same rules as `/build-component` Step 8:
- Colors → `@theme` with `--color-` prefix
- Spacing/sizing → `@theme` or `:root`
- Clamp font sizes → `var(--clamp-*)` (already in `:root`)
- Font families → trust `@theme` over Figma JSON

#### GSAP (if applicable)

- Independent `gsap.timeline({ scrollTrigger: { ... } })`
- `gsap.set()` for initial hidden/offset states
- Labeled phases for readability
- Match unit types across from/to tweens (em↔em, not em↔px)
- No `will-change` — GSAP handles GPU promotion

#### Responsive

- Tailwind responsive prefixes (`md:`, `lg:`) for layout in HTML
- `@media` queries in CSS matching the Step 4 matrix
- Container constraint on large screens (`max-w-7xl` or similar)
- Test that mobile-first base styles work without any breakpoint active

### 9. Document

After building the section, update `MEMORY.md` if the section introduces:
- New patterns or conventions
- New token declarations added to `@theme` or `:root`
- GSAP / ScrollTrigger integration points
- Architectural decisions worth preserving

Optionally create `src/figma-notes/<SectionName>.md` containing:
- Responsive matrix from Step 4
- Child dependency table from Step 3
- ScrollTrigger config from Step 7
- Token gap resolutions from Step 6

### 10. Register

Add a row to MEMORY.md under a `## Built Sections` table (create if needed):

```
| Name | Built | Figma URL | Children | ScrollTrigger | Notes |
|---|---|---|---|---|---|
| SectionName | YYYY-MM-DD | [link](url) | Button, Card, … | Yes/No | — |
```

---

## Quick reference: section vs component conventions

| Aspect | Component (`/build-component`) | Section (`/build-section`) |
|---|---|---|
| Tier | Atomic / Pattern | Section |
| Variants | State, Size, Type | Breakpoints (Desktop/Tablet/Mobile) |
| HTML element | `<button>`, `<div>`, `<input>` | `<section>`, `<aside>`, `<footer>` |
| CSS location | `src/components/<Name>.css` | `src/styles.css` under `/* -- Name -- */` |
| GSAP approach | Inline transitions or timeline phases | Independent ScrollTrigger timeline |
| Responsive | Variant per breakpoint in Figma | Mobile-first with `md:`/`lg:` prefixes |
| Composition | Standalone, reusable | Composes existing components |
| Build order | Bottom-up (children first) | Top-down (children must exist first) |

---

## Common pitfalls

- **Skipping child audit** → ships section with wrong/missing tokens in child components.
  Always complete Step 3 hard gate before implementing.
- **Appending to hero timeline** → breaks load animation timing. New sections MUST use
  independent `gsap.timeline()` with their own ScrollTrigger.
- **Fixed font sizes where clamp exists** → Figma shows a large px value but the real token
  is `var(--clamp-*)` with a responsive `clamp()`. Check token names before using numbers.
- **Hardcoded breakpoints** → use `768px` / `1024px` standard. No magic numbers.
- **Missing container constraint** → section stretches to full viewport on ultrawide screens.
  Always set a `max-w-*` on the content container.
- **Initializing a second ScrollSmoother** → only one instance can exist. Check if
  `src/main.js` already creates one. If not, create it there — not in the section file.
- **Gradient backgrounds invisible in `get_design_context`** → always compare Step 2
  screenshots against Step 5 design context. If a gradient is visible but not in the code
  output, ask the user.
- **CSS `transition` on GSAP properties** → causes jank and overrides. Never add `transition`
  to `transform`, `opacity`, or any property GSAP animates.
