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
