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
