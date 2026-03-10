# Animation Vocabulary — Quick Reference

Terms you can use when describing what you want. Plain English on the left, technical name on the right.

---

## How things move (Entrance / Exit)

| What you mean | Term |
|---|---|
| Appears gradually from invisible → visible | **Fade in** |
| Disappears gradually from visible → invisible | **Fade out** |
| Slides in from a direction (e.g. bottom) | **Translate in** / "slide up in" |
| Slides out continuing in the same direction | **Translate out** / "slide up off" |
| Starts small, grows to full size | **Scale up** / "punch in" |
| Shrinks and disappears | **Scale down** |
| Fades in + slides up simultaneously | **Fade-translate in** (what your text currently does) |
| Appears word-by-word or letter-by-letter | **Stagger** |
| Enters from off-screen on one side | **Slide in** / "fly in from [direction]" |

## Timing & Feel

| What you mean | Term |
|---|---|
| Animation starts fast, ends slow (decelerating) | **Ease out** — feels natural, like arriving |
| Animation starts slow, ends fast (accelerating) | **Ease in** — feels like leaving / exiting |
| Slow start AND slow end | **Ease in-out** |
| Constant speed, no acceleration | **Linear** / "no easing" |
| Overshoots then bounces back to position | **Back ease** / "elastic" / "overshoot" |
| How long the animation takes | **Duration** |
| Pause before an animation starts | **Delay** |
| Time between each item in a group animating | **Stagger delay** |

## Scroll Behaviour

| What you mean | Term |
|---|---|
| Section sticks to the screen while you scroll through it | **Pin** / "pinned section" |
| Animation progress is tied directly to scroll position | **Scrub** (e.g. `scrub: true`) |
| Scrub but with a smooth delay catching up | **Scrub with lag** (e.g. `scrub: 1.5` = 1.5s lag) |
| Animation plays once when you scroll to it | **Trigger** / "fire and forget" |
| Animation reverses when you scroll back up | **Reverse on leave** / `toggleActions` |
| Content moves at a different speed than scroll | **Parallax** |
| Horizontal movement driven by vertical scroll | **Horizontal scrub** (what your image strip does) |
| The scroll distance the pinned section "consumes" | **Scroll distance** / "pin length" |
| Where the animation starts relative to viewport | **Start trigger** (e.g. "top 80%" = element top hits 80% down viewport) |

## Sequencing

| What you mean | Term |
|---|---|
| Animations happen one after another | **Sequence** / "chained" |
| Animations happen at the same time | **Parallel** / "simultaneous" |
| A group of sequenced animations | **Timeline** |
| A named point in a timeline you can reference | **Label** |
| The element stays visible, nothing moves, scroll continues | **Hold** / "dwell" / "pause" |
| Text enters → holds → exits before the next thing starts | **Intro → dwell → outro** |

## Layout / Visual

| What you mean | Term |
|---|---|
| Image covers the full screen edge-to-edge | **Full-bleed** |
| Dark layer between image and text for readability | **Overlay** / "scrim" |
| Image fills its container without stretching | **Object-cover** (crops to fit) |
| Content that extends beyond its container is hidden | **Overflow hidden** / "clipped" |
| Element is positioned on top of another | **Z-index** / "stacking order" |
| Element is placed relative to its parent's edges | **Absolute positioning** |

---

## Putting it together — example requests

> "Pin the section. Fade-translate the headline in from the bottom. Hold for a beat. Then slide it up off-screen. After it's gone, start the horizontal scrub."

> "Stagger the words in with a back ease. Once they've all landed, hold, then fade out the whole block."

> "Parallax the background image — scrub it slowly — while the text stays pinned in the center."

> "Ease-out on entrance, ease-in on exit. Linear for the image strip scrub."
