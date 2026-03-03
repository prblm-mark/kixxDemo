# /build-component

Build a new UI component or section from Figma into the Kixx landing page, or audit/refine an existing one.

Usage: `/build-component <Figma URL or node description>`

---

## Process (follow every step in order)

> **Plan mode is read-only.** Steps 1–7 may be run during planning. Step 8 (Implement) and
> Step 9–10 (Document / Register) MUST NOT run until the user approves the plan and asks to
> implement. Never write, edit, or create files during planning — not even for a "trivial" fix.

### 1. Locate

**Step 1a — Tier gate (before everything else):**
Before locating the component set, check whether the target is a `Tier=Section` or
`Tier=Template` frame rather than an atomic or pattern-tier component.

**Tier=Section** (checked first) — a full page section that composes multiple components.
Signals: the Figma node is tagged `Tier=Section`, it's a wide frame containing multiple
pattern-tier children arranged as a page section.

If the target is Tier=Section: **STOP immediately.**

> "This is a Tier=Section frame — a full page section, not an atomic component.
> Use `/build-section` to build it."

Do not continue. The `/build-section` workflow handles sections.

**Tier=Template** — a full UI screen or multi-section layout that composes multiple patterns.
Signals: the Figma node is a full-screen frame, it contains Header + multiple patterns,
the URL points to a template-level node.

If the target is Tier=Template: **STOP before Step 1b.** Ask the user:

> "This looks like a Tier=Template component — a full UI section rather than an atomic component.
> Before I begin analysis, could you share any context about how it should work?
> For example: interactions, use cases, constraints, which existing elements it composes,
> or any behaviours that aren't visible from the Figma design alone."

Wait for the user's response before continuing.

**Step 1a — find the component set:**
Call `get_metadata` on the **Figma file page** to see the full layer tree and locate the target
component frame. Note the component set node ID (the parent frame, e.g. `68:5443`).

- File key: extract from URL (e.g. `8OAAokH2JXhIvGZFrlzeKT`)
- Page node: confirm from URL `node-id` param

**Step 1b — enumerate ALL variants:**
Call `get_metadata` again, this time on the **component set node itself** (not the page).
This lists every variant as a direct child with its exact name and node ID.

**Do not skip this step even for sub-components or dependencies.** A single node ID from a URL
or a parent component's tree represents only ONE variant. Without this step you will silently
miss entire states, sizes, or device breakpoints.

Build a variant table before writing any code:

| Node ID | Variant name | Notes |
|---|---|---|
| 68:5444 | State=Default, Device=Default | — |
| 68:5488 | State=Hover, Device=Default | — |
| … | … | … |

**Every variant in this table MUST be built. No exceptions for "unused" variants.**
- "Unused by current sections" is not a valid reason to skip a variant.
- "Looks identical to another variant" is not a valid reason — fetch its design context and confirm.
- If a user explicitly instructs you to skip a specific variant, note it in the table with a reason. Otherwise build it.

**Step 1c — identify interactions:**
Scan every variant name in the table for states that imply user-triggered interaction —
clicks, selections, toggles, expansions, activations.

Signal words (non-exhaustive): Selected, Checked, Expanded, Active, Open, Closed,
Toggled, Highlighted, Pressed, Focused (when a JS focus manager is needed).

Pure CSS states (hover, :focus-visible, :disabled) do NOT need to be asked about here —
they are handled in Step 4/8 per normal. Ask only about states that require JS to add/remove
a class or change DOM structure.

If any such variants exist: **STOP before Step 2.** List them and ask the user:

> "I see these variants that imply JavaScript-driven interaction:
> - [variant name] — [brief observation]
> - ...
>
> Can you describe the expected behavior for each? e.g.:
> - Single-select (radio) vs multi-select (checkbox)?
> - Click to toggle on/off, or click to select only?
> - Does clicking outside deselect?
> - Any keyboard behavior beyond Enter/Space?
> - Should GSAP animate the state transition?"

Do not proceed to Step 2 until the user has answered.

### 2. Screenshot

Call `get_screenshot` on the **parent frame** (the one containing all variants/states).
This gives a visual overview before touching any code — use it as the reference throughout.

### 3. Design context — root

Call `get_design_context` on the root/parent node.
Extract from the output:
- All child node IDs (look for `data-node-id` attributes)
- Exact CSS variable names used (pattern: `var(--*,fallback)`)
- Explicit dimensions (height, width, padding — especially any fixed `h-[...]`)
- Typography tokens (font-size, line-height, font-weight variables)

### 4. Design context — child nodes

For each **distinct child component** (especially interactive sub-components like inputs, icons, badges):
call `get_design_context` on that child node ID separately.

Fetch `get_design_context` for: each **Type** variant (e.g. Primary / Secondary / Tertiary),
each **Size** (base / sm), and **every interactive State** (Default, Hover, Focus, Pressed, Disabled).

**Never skip interactive states.** A state that looks like "just a color change" often isn't —
Figma may flip the entire visual treatment.

**Critical — fetch every size variant separately.** Never assume a smaller size uses a smaller
token. Call `get_design_context` on each size node individually and read the exact tokens.

**Critical — check ALL properties on EACH variant independently, not just layout or colour.**
When a component has multiple sizes or states, do NOT carry a property value from one variant to
another without checking.

**Critical — scan for nested components in design context output.** After fetching design context,
scan every `data-name="..."` attribute in the output. **Any element with a `data-name` attribute
IS a Figma component — regardless of what HTML element it renders as.**

For each named nested component found:
1. Check if it already exists in `src/styles.css` as a section or in `src/components/`
2. If **missing** → STOP. Do not write any code for the parent. Report the missing dependency
   and follow the bottom-up build order (build the child first, then return to the parent).
   **Critical:** when building the child, restart from Step 1a — call `get_metadata` on the
   PAGE to find the child's component set node. **Do NOT use the instance node ID visible in
   the parent's design context.**
3. If **existing** → audit it (Steps 3–6 of `/review-component`) before using it.

Never implement a named Figma component as scoped CSS inside the parent (e.g. `.nav__tooltip`).
That duplicates what should be a standalone reusable component.

**Critical — flag contextual overrides before implementing.**
When fetching design context for a parent component, if a child component instance has a property
set differently from the child's base design (e.g. width set to fill-container, padding
changed, colour overridden), STOP before writing any code. Report the anomaly to the user:

- What the child's base value is
- What the parent has set it to
- Which case it appears to be:
  - **Case A — Formal variant:** the customisation exists as a variant in the child's Figma
    component set → add it to the child component
  - **Case B — Contextual override:** a one-off usage not formalised as a variant → scope it
    to the parent with a modifier/override class

Wait for the user to confirm the case before implementing anything.

### 5. Variables

Call `get_variable_defs` on the root node to get the complete Figma variable → CSS token map.

**Critical:** scan for any **design value** that does NOT have a corresponding semantic
token — including Figma primitives (e.g. `Orange/600`, `Neutral/950`) and arbitrary values.

Design values are: colors, spacing/sizing, typography (font-size, weight, line-height), and
border-radius. Structural CSS values (`transition`, `opacity`, `cursor`, `border: 1px solid`,
`outline: none`) are implementation details and do NOT need to be tokens — use them freely.

**STOP here for any unresolved design value. Do not proceed to Step 6 or write any code.**
Report each gap to the user:
- Property name, affected state/variant
- Figma value and primitive name if identifiable (e.g. "hover bg → Orange/400 = `#ff9900`")

**Prior approvals do NOT carry forward.** Even if a primitive was approved in a previous
session or for a different variant, stop and ask again. Each use requires explicit confirmation.

Wait for the user to decide: add a semantic token to Figma, approve using the primitive, or skip.
Only continue once every gap has a resolution.

### 6. Code Connect check

Call `get_code_connect_map` on the root node to check if this component already exists in the codebase.
- If **no mapping**: create new CSS from scratch
- If **mapping exists** (audit/refine mode): read the existing CSS, then compare against what
  Figma now shows — list any tokens, variants, or states that are missing, outdated, or incorrect

### 7. State × size × variant matrix

**Before writing any CSS**, build a complete table:

| Type | Sizes | States | Icon Only? |
|---|---|---|---|
| Primary | base, sm | Default, Hover, Focus, Pressed, Disabled | Yes/No |
| ... | | | |

Rules:
- **Never infer sizes from padding alone** — check for explicit `h-[...]` or `w-[...]` in design context
- **Check for spurious variants in existing code** — if an existing CSS class has no Figma counterpart, remove it
- **List any missing variants** not yet in CSS before implementing

### 8. Implement

Write the component following project conventions:

#### Token → CSS declaration

Tokens in the Figma JSON (`src/figmaTokens/`) are NOT automatically available as CSS variables.
When a Figma design references a token not yet declared in `src/styles.css`:

- **Color tokens** → add to `@theme` block with `--color-` prefix (enables Tailwind utilities
  like `bg-surface-brand`, `text-text-primary`)
  ```css
  @theme {
      --color-surface-brand: #FF7500;
  }
  ```
- **Spacing/sizing** → add to `@theme` (if Tailwind utilities needed) or `:root`
- **Typography** → font families already in `@theme`; fixed sizes and line heights go in `:root`
- **Clamp font-size tokens** — Figma `font/size-clamp/*` tokens (e.g. `$value: 300`) are
  visual stand-ins only. Their `codeSyntax.WEB` names start with `--clamp-` (e.g.
  `--clamp-headline`, `--clamp-display`). These map to `:root` variables in `src/styles.css`
  that contain real `clamp()` expressions. **Always use `var(--clamp-headline)` etc. — never
  the fixed pixel value from the JSON.** No breakpoint overrides needed; the clamp is
  inherently responsive.

**Token source files** (read raw JSON, no build pipeline):

| Need | Read from |
|------|-----------|
| Colors, spacing, radii, icons | `src/figmaTokens/tokens.json` |
| Color primitives (hex lookup) | `src/figmaTokens/primitives.json` |
| Font sizes, weights, line heights | `src/figmaTokens/Typography/Desktop.tokens.json` |
| Mobile typography | `src/figmaTokens/Typography/Mobile.tokens.json` |

#### Font family mapping

| Figma token | Kixx `@theme` var | Actual font |
|-------------|-------------------|-------------|
| `--font-display` | `--font-display` | Atomic |
| `--font-headline` | `--font-title` | GraphikXXXBold |
| `--font-body` | `--font-body` | Plus Jakarta Sans (Google Fonts) |
| — | `--font-bold` | GraphikXBold |
| — | `--font-semi` | GraphikXSemibold |

Rule: **always trust `@theme` definitions in `src/styles.css` over Figma JSON `$value` for font families**.
Figma says "Jakarta Sans" for `--font-title` but the actual font loaded is GraphikXXXBold.

#### CSS output location

- **Section-specific styles** (nav, form, hero elements): add to `src/styles.css` under a
  `/* -- <Name> -- */` section comment
- **Reusable components** (button, card, input): create `src/components/<Name>.css` and
  `@import` from `src/styles.css` (create the `src/components/` directory on first use)

#### CSS rules

- BEM naming: `.component`, `.component__element`, `.component--modifier`
- Only semantic token variables, or primitives explicitly approved by the user in Step 5
- Approved primitives: use the hex value with a comment citing the primitive name
  (e.g. `/* Orange/400 */`)
- Never hardcode arbitrary hex values or named colors
- **Dimension values (spacing, sizing, font-size, line-height, border-radius) → use `rem`
  via token variables when available.** Border widths (`1px`, `2px`) and box-shadow pixel
  offsets stay as `px`.
- Base state first, then variant modifiers, then size modifiers
- Include `:hover`, `:active`, `:focus-visible`, `:disabled` pseudo-classes where applicable
- Add `min-height` (not just padding) when Figma specifies a fixed height

#### Tailwind v4 utility vs custom CSS decision

- **Prefer Tailwind utilities** for: layout, spacing, colors, typography, responsive breakpoints
- **Use custom CSS** for: multi-state styling, pseudo-elements, complex transitions, BEM blocks
- **Never use Tailwind `animate-*`** — always GSAP or custom CSS `@keyframes`

#### GSAP awareness

- **Never use CSS `transition` on properties GSAP animates** (transform, opacity)
- Check `src/main.js` before adding transforms to any element — GSAP may already control it
- Don't add redundant `will-change` — GSAP handles GPU promotion internally

#### Responsive approach

- Prefer Tailwind responsive prefixes (`md:`, `lg:`) in HTML for layout shifts
- Custom CSS media queries use `@media (min-width: 768px)` (mobile-first)
- **No dark mode** — single theme only

#### HTML output

No standalone demo pages. Component markup goes directly into `index.html` in the appropriate
section. When adding new markup:

- Use semantic elements: `<button>` for actions, `<a>` for navigation, `<input>` for inputs
- Icons: inline SVG — no external icon library
- Use Tailwind utility classes for layout; custom CSS classes for stateful/animated elements

**Text content check:** For every child component instance that has variable text, record the
exact text shown in the Figma design context output and use that — do not invent placeholder values.

#### Accessibility (WCAG 2.1 AA)

- `aria-label` on icon-only buttons
- `role="alert"` on error messages
- `:focus-visible` outline: `2px solid var(--color-kixx-orange)`
- Touch targets: minimum 44x44px for interactive elements

### 9. Document

After building or updating any component, update `MEMORY.md` if the component introduces:
- New patterns or conventions
- New token declarations added to `@theme` or `:root`
- GSAP integration points
- Architectural decisions worth preserving

For complex components, optionally create a notes file in `src/figma-notes/<Name>.md` containing:

```markdown
# <Name> — Figma Notes

## Figma Node
File key, page node, component node IDs per variant

## Variant × Size × State Matrix
(table from step 7)

## CSS Class Mapping
(Figma property → CSS class)

## Token Mapping
(Figma variable → CSS variable → role)

## Token Gaps
(any raw primitives with no semantic token; decision taken)

## Notes
- Any naming mismatches
- Any hidden properties
- Any contextual overrides applied
```

### 10. Register

Add a row to MEMORY.md under a "## Built Components" section (create if needed):

```
| ComponentName | Built | [Figma URL](url) | Notes |
```

---

## Quick reference: token categories

Token names come from `com.figma.codeSyntax.WEB` in the JSON files — they use **no prefix**
(not `--ai-*`). When declaring them as CSS variables, add the `--color-` prefix for colors
(so Tailwind can generate utilities), or use plain `--` for non-color tokens.

| Need | Token name (from JSON) | CSS declaration |
|---|---|---|
| Backgrounds | `--surface-*` | `--color-surface-*` in `@theme` |
| Text colors | `--text-*` | `--color-text-*` in `@theme` |
| Border colors | (if present) | `--color-border-*` in `@theme` |
| Border radius | `--radius-sm/md/lg/xl/full` | `:root` as `px` or `rem` |
| Spacing / size | `--spacing-1` … `--spacing-13` | `:root` or `@theme` |
| Font size (fixed) | `--font-fixed-xxs` … `--font-fixed-4xl` | `:root` as `rem` |
| Font size (clamp) | `--clamp-headline`, `--clamp-display` | Already in `:root` — contains `clamp()`. Figma `$value` is a visual stand-in, ignore it. |
| Font weight | `--font-regular/medium/semibold/bold/extrabold` | `:root` |
| Line height | `--leading-1` … `--leading-5` | `:root` as `rem` |
| Icon sizes | `--icon-size-sm` (16px) / `--icon-size-md` (20px) / `--icon-size-lg` (24px) | `:root` |

Full token source: `src/figmaTokens/tokens.json` and `src/figmaTokens/Typography/Desktop.tokens.json`

---

## Common pitfalls

- **Font family mismatch:** Figma JSON says "Jakarta Sans" for `--font-title` but Kixx uses
  GraphikXXXBold (loaded via `@font-face`). Always trust `@theme` in `src/styles.css`.
- **Tokens not auto-available:** Unlike a generated `tokens.css`, Figma tokens must be
  manually declared in `src/styles.css` `@theme` or `:root` before use.
- **GSAP conflicts:** Never add CSS `transition` to elements animated by GSAP in `src/main.js`.
  Check the timeline phases before adding any transform or opacity styles.
- **No icon library:** Use inline SVG for icons, not Lucide or any CDN icon set.
- **Single page:** All markup lives in `index.html` — no separate demo HTML files.
- **Gradient backgrounds:** `get_design_context` does NOT expose gradient fills. If a gradient
  is visible in the Step 2 screenshot but the element has no `bg-[...]` class in design context,
  STOP and ask: "I see a gradient on [element] in the screenshot — which gradient style is this?"
- **Always use the exact token from Figma** — never substitute a different token based on
  personal judgement. If a Figma token seems wrong, flag it to the user.
- **Design context shows structure only — NOT interaction behavior.** Figma prototype interactions
  never appear in `get_design_context` output. Never remove or demote an existing interactive
  element based on design context output alone.
- **Clamp tokens are NOT fixed sizes:** `font/size-clamp/headline` shows `$value: 300` in
  JSON — that's a Figma canvas placeholder. The real value is `clamp(6.875rem, ... 18.75rem)`
  in `:root`. If Figma shows a giant fixed font-size on a headline element, check whether
  the token name starts with `--clamp-` before using the number.
