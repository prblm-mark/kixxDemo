# /review-component

Audit a composite Figma component, map all nested dependencies, verify each against the
codebase, and produce an approved build plan before writing any code.

Usage: `/review-component <Figma URL>`

---

## Process (follow every step in order)

### 1. Map the component tree

Call `get_metadata` on the Figma file page to get the full layer tree.
Locate the target component frame and recursively identify every nested component instance —
including components nested inside nested components (full depth).

For each unique component found, record:
- Component name
- Figma node ID and URL
- Depth in the tree (root = 0, direct child = 1, etc.)
- How many times it appears (e.g. Input x3)

Output a tree like:
```
BookingForm (root)
├── FormTab (depth 1, x2) — node 68:5444
├── Input (depth 1, x3) — node 78:2016
│   └── Icon (depth 2) — node 53:1234
└── Button (depth 1) — node 53:2489
```

### 2. Check each component against the codebase

For each unique component in the tree, check for a matching implementation:

1. Search `src/styles.css` for a `/* -- <Name> -- */` section comment
2. Search `src/components/` for a matching CSS file (if directory exists)
3. Search `index.html` for matching BEM class names

Mark each as:
- **Missing** → needs to be built from scratch
- **Exists (in styles.css)** → has a section in the main stylesheet
- **Exists (component file)** → has its own CSS file in `src/components/`
- **Exists (inline only)** → has markup in `index.html` but no dedicated CSS section

### 3. Audit each existing component against Figma

For every component in the tree (whether existing or missing), first call `get_metadata` on its
**component set node** to enumerate all variants. Do NOT rely on the single node ID surfaced
in the parent's tree — that is one variant, not the full component.

For every component marked as existing, run a quick audit:

1. Call `get_metadata` on the component set node to list all variants
2. Call `get_design_context` on each distinct variant node
3. **Scan every `data-name="..."` in the design context output.** Any named element that is
   not a standard HTML primitive is a Figma component. If it does not exist in `src/styles.css`
   or `src/components/`, it must be added to the build plan as a missing dependency — it must
   NOT be implemented inline inside the parent.
4. Call `get_variable_defs` on the root node
5. Read the existing CSS from `src/styles.css` (relevant section) or `src/components/<Name>.css`
6. Compare and flag any discrepancies:
   - Tokens in Figma not present in CSS (missing or wrong token)
   - Variants/states in Figma not implemented in CSS
   - CSS classes with no Figma counterpart (spurious — candidate for removal)
   - Token gaps (design values with no semantic token — apply the same stop rule as
     `/build-component` Step 5)

**Flag contextual overrides before marking status.** If a child component instance within the
parent has a property set differently from the child's base design, STOP and report it to the
user before continuing. Describe what differs and propose which case it is:

- **Case A — Formal variant:** exists in the child's component set → add to the child
- **Case B — Contextual override:** one-off usage in the parent → scope to parent with an
  override class

Wait for confirmation before including it in the build plan.

**Critical — check for token drift.** Before marking a component as current, cross-reference
every token used in the component's CSS against the current `src/figmaTokens/tokens.json` and
`src/figmaTokens/Typography/Desktop.tokens.json`. Flag as `Outdated` if:
- The component uses a token where a more specific token now exists for that role
- A new token has been added to the JSON files that the component should be using but isn't

Mark the component as:
- `Current` — matches Figma, no action needed
- `Outdated` — exists but has discrepancies (list each one)

### 4. Resolve token gaps

If any audit (Steps 2 or 3) surfaces a design value with no semantic token:

**STOP. Do not produce the build plan yet.**
Report each gap — property name, affected component/state, Figma value, primitive name if
identifiable. Wait for the user to decide before continuing.

**Prior approvals do NOT carry forward.** Even if a primitive was approved in a previous
session or for a different variant/component, stop and ask again every time it appears.

### 5. Present the build plan

Output a summary table and await user approval before writing any code:

```
Component     | Status              | Action
--------------|---------------------|------------------------------------------
Icon          | Missing             | Build (no dependencies)
Input         | Missing             | Build after Icon
FormTab       | Exists (styles.css) | Current — no action
Button        | Outdated            | Update — missing hover state token
BookingForm   | Missing             | Build after all above are resolved
```

Include:
- Bottom-up build order (leaves first, root last)
- For Outdated components: a bullet list of what needs to change
- For Missing components: "Build from scratch"

**Do not proceed until the user explicitly approves the plan.**

### 6. Execute

Once approved, work through the plan in order:

- **Missing** → run the full `/build-component` process for that node
- **Outdated** → apply only the changes listed in the audit (do not rewrite the whole component)
- **Current** → no action

After all dependencies are resolved, build or update the root/parent component last,
composing the child components in its HTML rather than duplicating their markup.

### 7. Composition rules

When the parent component HTML references a child component:
- Use the child's existing BEM class structure — do not re-implement it inline
- If the child has its own CSS file, ensure it's `@import`ed in `src/styles.css`
- Note the dependency in MEMORY.md or `src/figma-notes/<Name>.md`

---

## Key principles

- **Never build the parent before all children are current** — the parent's fidelity depends on
  its children being correct first
- **Audit != rebuild** — for outdated components, make targeted changes only, not a full rewrite
- **Token gaps block the plan** — surface them in Step 4 before showing the user any build order
- **Reuse, don't duplicate** — if a component exists and is current, the parent just references it
- **Always enumerate variants via `get_metadata` on the component set node** — never assume a
  single node ID is the complete component
- **Never implement a `data-name` component inline** — if design context output contains
  `data-name="Tooltip"` (or any named component), it must become a standalone section in
  `src/styles.css` or a file in `src/components/`, not `.parent__tooltip` scoped CSS
- **Responsive layout via media queries or Tailwind prefixes, not modifier classes** — when a
  component has a Device=Mobile variant, the correct implementation is `@media (min-width: 768px)`
  rules or Tailwind `md:` prefixes, not a `.component--mobile` modifier class
- **Font family trust order:** Always trust `@theme` definitions in `src/styles.css` over Figma
  JSON `$value` for font families
- **GSAP awareness:** Before adding any transform or opacity styles to an element, check
  `src/main.js` — GSAP may already control those properties. Never use CSS `transition` on
  GSAP-animated properties
- **Dimension values use `rem`** — all spacing, sizing, font-size, line-height, and border-radius
  values are `rem` via token variables. Border widths (`1px`, `2px`) and box-shadow pixel offsets
  stay as `px`
- **No dark mode** — single theme only, no dark mode token checks needed
