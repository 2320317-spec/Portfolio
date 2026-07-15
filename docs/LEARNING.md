# Learning Log — Portfolio Project

Concepts I used and can explain. One line each; details in the linked code.

## Task 1 — Skeleton
- **HTML head vs body:** head = invisible setup (fonts, styles, metadata); body = visible content.
- **CSS custom properties (`--cream` etc.):** design tokens declared once on `:root`, used everywhere with `var()`. Change the token, the whole site updates.
- **CSS reset:** browsers add default margins/styles; we zero them so the design starts from a known state.
- **`clamp(min, preferred, max)`:** fluid sizing — grows/shrinks with the screen but never past the limits.
- **`prefers-reduced-motion`:** OS-level accessibility setting; we disable animations for users who ask for that.

## Task 3 — Letter cascade
- **The DOM:** the browser's live object model of the HTML; JS edits the DOM, the page updates.
- **Stagger:** one animation, each element delayed a bit more than the last (`--i * 40ms`). The whole "cascade" is just that.
- **`DOMContentLoaded`:** run JS only after the HTML is parsed, so the elements we look for exist.
- **Graceful no-op pattern:** every init function checks for its elements and does nothing if absent — same scripts safely load on every page.

## Bug #1 — The vanishing space (systematic debugging)
- **Symptom:** name rendered as one glued word, wrapping mid-word.
- **Evidence:** the space `<span>` existed in the DOM but measured 0px wide (a letter = 51px).
- **Root cause:** HTML whitespace collapsing — a span whose only content is a regular space gets trimmed to nothing. Bonus: bare inline-block letters also let lines break mid-word.
- **Fix at the root:** wrap each word in a `white-space: nowrap` span, keep real spaces as text between words — restores natural spacing AND natural word wrapping.
- **Second finding:** the 12.5vw font size borrowed from the inspiration never fit MY 13-character name; sized to 9.5vw measured against my own content. Design to your content, not someone else's.
- **Process:** evidence → hypothesis → minimal console test (0px → 17px) → root fix → measured verification. Never guess-and-patch.

## Task 4 — Marquee
- **The infinite-loop illusion:** duplicate the text, slide the strip left exactly 50%, restart instantly — copy #2 lands where copy #1 began, so the jump is invisible.
- **`@keyframes` vs `transition`:** keyframes = self-running timeline (no trigger); transition = reaction to a property change (hover, class toggle).
- **`aria-hidden="true"`:** hides the duplicate copy from screen readers so blind users don't hear everything twice.

## Task 5 — About + scroll/mask reveals
- **IntersectionObserver:** hand the browser elements and it "rings the doorbell" when they enter the screen — no scroll-event spam, efficient by design.
- **JS decides WHEN, CSS decides HOW:** JS only toggles a class (`is-visible`); the animation itself lives entirely in CSS. Clean separation of concerns.
- **Stagger via `--d`:** a custom property used as `transition-delay` lets sibling elements offset from one another with one shared rule.

## Bug #2 — The frozen laboratory
- **Symptom:** reveals never fired in the automated preview; transitions stuck at starting values even with correct classes and rules.
- **Proof:** disabling transitions entirely made styles apply instantly → CSS logic was correct all along.
- **Root cause:** the preview environment was a throttled renderer producing no animation frames — IntersectionObserver and transitions starve without frames.
- **Lesson:** sometimes the bug is in the test equipment, not the code. Prove it with a controlled experiment; final verification belongs in a real browser.

## Task 6 — Scroll-linked word highlight
- **Trigger vs scrub:** a trigger fires once (reveal); a scrub is welded to scroll position and runs both directions, like dragging a video timeline.
- **The measure → normalize → map recipe:** read position with `getBoundingClientRect()`, convert to a 0–1 progress number, then map progress onto the effect (60% progress = 60% of words lit). Reusable for endless scroll effects.
- **`scroll-behavior: smooth` is an animation too:** programmatic `scrollTo` glides instead of jumping — pass `behavior: 'instant'` when you need to jump (e.g. in tests).
- **Split-into-spans, third appearance:** cascade (by letter), scrub (by word). Same core trick, different unit and driver.

## Task 7 — Projects grid + hover reveal
- **CSS Grid vs flexbox:** flexbox = one dimension (a row OR a column); grid = two dimensions (`1fr 1fr` → equal columns, cells flow automatically).
- **Layering with position:** parent `relative` = anchor; child `absolute; inset: 0` = stretched over the parent. The hover image is always present at `opacity: 0` — hover just flips it, so it's instant.
- **Mouse coordinate conversion:** `e.clientX - rect.left` turns screen coordinates into inside-this-element coordinates. That's the whole cursor-following trick.
- **`(hover: none)` media query:** phones can't hover — give them a permanent faint image and hide cursor-only UI. Feature-detect, don't device-detect.

## Bug #3 — The stale cache
- **Symptom (recurring):** freshly edited JS wouldn't run after navigation; functions existed on the server but not in the running page.
- **Root cause:** our dev server sent no `Cache-Control` header, so the browser used "heuristic caching" and served old copies of files.
- **Fix at the root:** dev server now sends `Cache-Control: no-store` — browsers must always fetch fresh during development.
- **Lesson:** HTTP caching is a real protocol layer between your editor and your browser. When code "doesn't update," check what the browser actually loaded (hard refresh = Ctrl+Shift+R bypasses cache).

## Task 8 — Footer + letter zoom + underline sweep
- **DRY payoff:** `splitLetters()` from Task 3 reused unchanged for the watermark — one function now powers two different animations (load cascade + mouse zoom).
- **Proximity math:** distance → closeness (0–1) → `scale = 1 + MAX × closeness²`. Squaring the closeness makes falloff feel organic. Four numbers define the whole personality.
- **`::after` pseudo-elements:** CSS can conjure a phantom child element — the underline is drawn by CSS, no extra HTML. `transform-origin` right→left flip makes it exit the opposite way it entered.
- **Tone-on-tone:** the watermark is a lighter shade of the footer's own violet — presence without shouting. Cheap trick, expensive look.
