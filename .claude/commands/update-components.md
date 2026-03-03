# /update-components

Review and update all components after Figma token changes.

Run this after Figma variables have been re-exported to `src/figmaTokens/` to ensure all
component CSS, HTML markup, and documentation stay in sync with the updated token values.

---

## Step 0 — Permissions (ALWAYS first, before any other action)

Before doing anything, output the following numbered list and ask the user to confirm which
categories are pre-approved for this session. Do NOT proceed until all categories are addressed.

```
The following actions may be taken during /update-components. Please confirm which are approved:

1. Read-only Figma fetches (get_design_context, get_variable_defs, get_metadata)
2. Edit src/styles.css (@theme, :root, component sections)
3. Edit src/components/*.css files
4. Edit index.html markup
5. Create/edit src/figma-notes/*.md files
6. Update MEMORY.md
7. Commit and push

Reply with which numbers are approved, or say "all approved" to approve everything.
```

Do not make any edits until the user has responded.

---

## Step 1 — Detect token changes

There is no build pipeline. Tokens live as raw JSON in `src/figmaTokens/`.

Run `git diff HEAD src/figmaTokens/` to compare the current token files against the last
committed versions. Save this diff output as the **change manifest**.

If there are unstaged/untracked token files (new export), also run `git diff --no-index`
against the previous version or simply read and compare the JSON files directly.

If no token values changed (diff is empty AND no new files), report:
> "No token values changed. No components need updating."
> Then stop — do not continue to Step 2.

---

## Step 2 — Verify typography consistency

Compare Desktop vs Mobile typography JSON for sanity:

Read `src/figmaTokens/Typography/Desktop.tokens.json` and
`src/figmaTokens/Typography/Mobile.tokens.json`.

For any shared token (e.g. `--font-fixed-sm`), verify that the Desktop value is >= the
Mobile value (or that they are intentionally equal).

If ANY value seems inverted (mobile larger than desktop for the same token), STOP and report:
> "Typography sanity check failed: [token] is [X]px on Desktop but [Y]px on Mobile.
> Check the Figma export source files."

Do not continue until this is resolved.

---

## Step 3 — Triage components

Scan `src/styles.css` for all `var(--*)` references. Also scan any files in `src/components/`.
Cross-reference each token against the change manifest from Step 1.

Build a triage table:

| Component/Section | CSS location | Tokens changed | Action |
|---|---|---|---|
| Navigation Icons | styles.css L138-158 | none | Skip |
| Booking Form | styles.css L162-181 | --surface-brand | Review + update |
| Button | src/components/Button.css | --spacing-3 | Review + update |
| … | … | … | … |

Components with "Skip" require NO further action this session.
Components with "Review + update" proceed to Step 4.

Also flag any component that:
- Uses a token whose **value** changed (not just added)
- Uses a hardcoded hex or px value that should now map to a changed token
- Should NOW use a newly-added token based on its Figma design

---

## Step 4 — Review and update each affected component

For each component flagged in Step 3 (in leaf-first order):

### 4a. Fetch fresh Figma design context

Call `get_design_context` for each variant of the component. Do NOT skip variants.
Call `get_variable_defs` to identify any token gaps.

Follow all rules from `/build-component`:
- Token gap rule: STOP and report any property with no semantic token
- Contextual override rule: STOP and flag any anomaly vs the child component design
- Interaction discovery rule: STOP if any JS-interaction variants are found that lack JS

### 4b. Update CSS

Apply the exact token values from Figma.

Do NOT:
- Infer values for states that weren't refetched
- Use hardcoded hex values
- Use primitives without per-session user approval

When adding new tokens to `src/styles.css`:
- **Color tokens** → add to `@theme` with `--color-` prefix
- **Spacing/sizing** → add to `@theme` or `:root`
- **Typography** → font families in `@theme`; sizes and line heights in `:root`

### 4c. Update HTML

If the CSS class names, markup structure, or visible content changed, update `index.html`.

### 4d. Update notes

If the component has a file in `src/figma-notes/`, update it. Otherwise note significant
changes in MEMORY.md.

---

## Step 5 — Wrap up

### 5a. Update MEMORY.md

Update `.claude/projects/-Users-mark-PycharmProjects-kixxDemo/memory/MEMORY.md`:
- Fix any outdated token value notes
- Add notes about new tokens or patterns discovered
- Update the Built Components table if any component changed

### 5b. Commit

Create a commit with all changes. Message format:
```
Update component CSS after Figma token re-export

- Updated @theme / :root token declarations in src/styles.css
- [list specific components/sections updated]

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

Push if the user pre-approved it in Step 0.

---

## Rules that apply throughout

All rules from `/build-component` apply at every step:
- Never infer token values — always fetch from Figma
- Token gap rule: STOP on any missing semantic token
- Contextual override rule: STOP and flag before writing any code
- No hardcoded hex or px dimension values
- Font family trust order: `@theme` > Figma JSON `$value`
- GSAP awareness: no CSS transitions on GSAP-animated properties
- Tailwind v4 utilities preferred for layout; custom CSS for stateful elements
- No dark mode
