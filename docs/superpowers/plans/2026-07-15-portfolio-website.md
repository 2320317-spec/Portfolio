# Portfolio Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy Myke's animated portfolio website (home + 3 STAR case studies) in vanilla HTML/CSS/JS per the approved spec at `docs/superpowers/specs/2026-07-15-portfolio-design.md`.

**Architecture:** Multi-page static site. One shared stylesheet (`css/style.css`) holding design tokens as CSS custom properties. Two shared scripts: `js/animations.js` (all 9 animation systems as `init*()` functions that no-op when their target elements are absent) and `js/main.js` (calls every init on DOMContentLoaded). Every page loads the same CSS/JS, so behavior is consistent and DRY.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript. Google Fonts (Archivo Black + Archivo). One external library — Lenis smooth scroll — added in the second-to-last task via `<script>` tag. Deployed on GitHub Pages.

## Global Constraints

- **Teaching mode:** this project is a learning vehicle. Before writing each new concept's code, explain it to Myke in plain language in chat. After each task, add new concepts to `docs/LEARNING.md`.
- Vanilla only: no frameworks, no npm, no build step. Only external library: Lenis (Task 14 only).
- Fonts: only `Archivo Black` (display) and `Archivo` 400/600 (body) from Google Fonts.
- Palette (exact): cream `#F2EEE9`, ink `#141414`, royal violet `#2E2447`, watermark violet `#453768`, muted lavender `#A99CC9`.
- Letter-zoom tuning (exact, user-approved): `MAX 0.18`, `RADIUS 170`, lift `4px`, transition `0.18s`.
- All paths relative (site must work from `file://` and GitHub Pages subpaths).
- Respect `prefers-reduced-motion`; hover-dependent effects must degrade on touch (`hover: none`).
- Verification is browser-based: each task states exactly what to look at and what must happen. No test framework (static site — YAGNI).
- Commit after every task with the message given in the task.
- Do not touch `.superpowers/` (brainstorm artifacts, gitignored).

---

### Task 1: Skeleton, design tokens, LEARNING.md

**Files:**
- Create: `index.html`
- Create: `css/style.css`
- Create: `assets/favicon.svg`
- Create: `docs/LEARNING.md`

**Interfaces:**
- Produces: CSS custom properties (`--cream`, `--ink`, `--violet`, `--violet-light`, `--lavender`, `--font-display`, `--font-body`), utility classes `.label`, `.container`, section base styles. Every later task consumes these.

**Teach:** what an HTML document is (head vs body), how CSS variables work (`:root` = global design tokens — change once, updates everywhere), why we load fonts in `<head>`.

- [ ] **Step 1: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Myke Lhowelle Marundan — Full Stack Developer</title>
  <meta name="description" content="Portfolio of Myke Lhowelle S. Marundan — full stack developer student building web, IoT, and AI projects. Based in Batangas.">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;600&family=Archivo+Black&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

  <main>
    <!-- Sections are added task by task -->
  </main>

  <script src="js/animations.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
```

(The two `<script>` tags will 404 until Task 3 creates the files — harmless, and it means we never have to touch this boilerplate again.)

- [ ] **Step 2: Create `assets/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#2E2447"/>
  <text x="32" y="44" font-family="Arial Black, sans-serif" font-size="34" font-weight="900" fill="#F2EEE9" text-anchor="middle">M</text>
</svg>
```

- [ ] **Step 3: Create `css/style.css` (tokens, reset, base)**

```css
/* ============ DESIGN TOKENS ============ */
:root {
  --cream: #F2EEE9;
  --ink: #141414;
  --violet: #2E2447;
  --violet-light: #453768;
  --lavender: #A99CC9;

  --font-display: 'Archivo Black', 'Arial Black', sans-serif;
  --font-body: 'Archivo', Arial, sans-serif;

  --pad-x: clamp(1.25rem, 5vw, 4rem);   /* responsive side padding */
}

/* ============ RESET ============ */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: var(--font-body);
  background: var(--cream);
  color: var(--ink);
  line-height: 1.6;
  overflow-x: hidden;
}
img { max-width: 100%; display: block; }
a { color: inherit; text-decoration: none; }
ul { list-style: none; }

/* Graph-paper texture on cream sections */
.grid-bg {
  background-image:
    linear-gradient(to right, rgba(20,20,20,.045) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(20,20,20,.045) 1px, transparent 1px);
  background-size: 48px 48px;
}

/* ============ UTILITIES ============ */
.label {
  font-size: .7rem;
  font-weight: 600;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: #8a8072;
}
section { padding: clamp(4rem, 10vh, 7rem) var(--pad-x); }

/* ============ ACCESSIBILITY ============ */
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
}
```

- [ ] **Step 4: Create `docs/LEARNING.md`**

```markdown
# Learning Log — Portfolio Project

Concepts I used and can explain. One line each; details in the linked code.

## Task 1 — Skeleton
- **HTML head vs body:** head = invisible setup (fonts, styles, metadata); body = visible content.
- **CSS custom properties (`--cream` etc.):** design tokens declared once on `:root`, used everywhere with `var()`. Change the token, the whole site updates.
- **CSS reset:** browsers add default margins/styles; we zero them so the design starts from a known state.
- **`clamp(min, preferred, max)`:** fluid sizing — grows/shrinks with the screen but never past the limits.
- **`prefers-reduced-motion`:** OS-level accessibility setting; we disable animations for users who ask for that.
```

- [ ] **Step 5: Verify in browser**

Open `index.html` in the browser (double-click the file). Expected: empty cream page, tab shows title "Myke Lhowelle Marundan — Full Stack Developer" with a violet "M" favicon. DevTools console shows two 404s for the js files (expected until Task 3).

- [ ] **Step 6: Commit**

```bash
git add index.html css/style.css assets/favicon.svg docs/LEARNING.md
git commit -m "feat: project skeleton with design tokens and learning log"
```

---

### Task 2: Hero section (static)

**Files:**
- Modify: `index.html` (inside `<main>`)
- Modify: `css/style.css` (append)

**Interfaces:**
- Produces: `.cascade-line` markup contract consumed by Task 3 (JS splits these into letters). `--base` custom property on the 2nd line sets its extra delay.

**Teach:** semantic tags (`section`, `h1`), viewport units + `clamp()` for the giant type, flexbox for the meta row.

- [ ] **Step 1: Add hero markup inside `<main>`**

```html
<section class="hero grid-bg">
  <p class="label hero-role">Full Stack Developer</p>
  <h1 class="hero-name" data-cascade>
    <span class="cascade-line">Myke Lhowelle</span>
    <span class="cascade-line" style="--base:350ms">Marundan</span>
  </h1>
  <div class="hero-meta">
    <span>Based in Batangas</span>
    <span>Student · Intern</span>
  </div>
</section>
```

- [ ] **Step 2: Append hero CSS**

```css
/* ============ HERO ============ */
.hero {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.hero-role { margin-bottom: 1rem; }
.hero-name {
  font-family: var(--font-display);
  font-size: clamp(3rem, 12.5vw, 11rem);
  line-height: .92;
  text-transform: uppercase;
  letter-spacing: -.02em;
}
.hero-name .cascade-line { display: block; }
.hero-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  font-size: .75rem;
  font-weight: 600;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: #6f675a;
}
```

- [ ] **Step 3: Verify in browser**

Refresh. Expected: full-screen cream section with faint grid texture; "MYKE LHOWELLE / MARUNDAN" gigantic in Archivo Black on two lines; role label above; meta row below with "Based in Batangas" left and "Student · Intern" right. Shrink the window — the name scales fluidly, never overflows horizontally.

- [ ] **Step 4: Commit**

```bash
git add index.html css/style.css
git commit -m "feat: hero section with giant fluid typography"
```

---

### Task 3: Animation system bootstrap + letter cascade (#1)

**Files:**
- Create: `js/animations.js`
- Create: `js/main.js`
- Modify: `css/style.css` (append)
- Modify: `docs/LEARNING.md` (append)

**Interfaces:**
- Produces: `splitLetters(el)` (splits an element's text into `<span class="letter">` with `--i` index; returns nothing), `initCascade()` (runs splitLetters on every `[data-cascade] .cascade-line`), `REDUCE_MOTION` (module-level boolean). `main.js` pattern: every `init*()` from animations.js is called once on DOMContentLoaded. Later tasks append their own `init*()` and add one call line in main.js.

**Teach:** what the DOM is, `querySelectorAll`, creating elements in JS, how stagger = same animation + increasing delay, why `DOMContentLoaded`.

- [ ] **Step 1: Create `js/animations.js`**

```js
/* ==================================================
   Animation systems. Each init*() finds its own
   elements and quietly does nothing if they're absent,
   so every page can load the same file.
   ================================================== */

const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- #1 Letter cascade ------------------------- */
/* Splits text into one <span class="letter"> per character.
   Each span gets --i (its index) so CSS can stagger delays. */
function splitLetters(el) {
  const text = el.textContent;
  el.textContent = '';
  [...text].forEach((ch, i) => {
    const span = document.createElement('span');
    span.className = 'letter';
    span.style.setProperty('--i', i);
    span.textContent = ch === ' ' ? ' ' : ch; // keep spaces visible
    el.appendChild(span);
  });
}

function initCascade() {
  if (REDUCE_MOTION) return; // text stays visible, no animation
  document.querySelectorAll('[data-cascade] .cascade-line').forEach(splitLetters);
}
```

- [ ] **Step 2: Create `js/main.js`**

```js
/* Entry point: wire up every animation system once the DOM exists. */
document.addEventListener('DOMContentLoaded', () => {
  initCascade();
});
```

- [ ] **Step 3: Append cascade CSS**

```css
/* ============ #1 LETTER CASCADE ============ */
.letter {
  display: inline-block;
  opacity: 0;
  transform: translateY(.6em) rotate(4deg);
  animation: letter-rise .7s cubic-bezier(.2, .7, .2, 1) forwards;
  animation-delay: calc(var(--base, 0ms) + var(--i) * 40ms);
}
@keyframes letter-rise {
  to { opacity: 1; transform: translateY(0) rotate(0); }
}
```

- [ ] **Step 4: Verify in browser**

Refresh. Expected: the name rains in letter by letter — first line starts immediately, second line ~350ms later. No console errors. Also verify the fallback: in DevTools → Rendering → "Emulate CSS prefers-reduced-motion: reduce" → refresh → name appears instantly with no animation (because `initCascade` returned early, no `.letter` spans exist).

- [ ] **Step 5: Update LEARNING.md**

Append:

```markdown
## Task 3 — Letter cascade
- **The DOM:** the browser's live object model of the HTML; JS edits the DOM, the page updates.
- **Stagger:** one animation, each element delayed a bit more than the last (`--i * 40ms`). The whole "cascade" is just that.
- **`DOMContentLoaded`:** run JS only after the HTML is parsed, so the elements we look for exist.
- **Graceful no-op pattern:** every init function checks for its elements and does nothing if absent — same scripts safely load on every page.
```

- [ ] **Step 6: Commit**

```bash
git add js/animations.js js/main.js css/style.css docs/LEARNING.md
git commit -m "feat: animation bootstrap and hero letter cascade"
```

---

### Task 4: Marquee band (#5)

**Files:**
- Modify: `index.html` (after hero)
- Modify: `css/style.css` (append)
- Modify: `docs/LEARNING.md` (append)

**Interfaces:**
- Produces: `.marquee` component (reusable if ever needed elsewhere).

**Teach:** the duplicated-content illusion; CSS keyframes vs transitions (keyframes = self-running timeline, transition = reaction to change); `aria-hidden` on the duplicate so screen readers don't read it twice.

- [ ] **Step 1: Add markup after the hero section**

```html
<div class="marquee" aria-label="Skills ticker">
  <div class="marquee-track">
    <span>Full Stack Development&nbsp;•&nbsp;Web Apps&nbsp;•&nbsp;IoT&nbsp;•&nbsp;AI&nbsp;•&nbsp;Robotics&nbsp;•&nbsp;</span>
    <span aria-hidden="true">Full Stack Development&nbsp;•&nbsp;Web Apps&nbsp;•&nbsp;IoT&nbsp;•&nbsp;AI&nbsp;•&nbsp;Robotics&nbsp;•&nbsp;</span>
  </div>
</div>
```

- [ ] **Step 2: Append CSS**

```css
/* ============ #5 MARQUEE ============ */
.marquee {
  background: var(--ink);
  color: var(--cream);
  overflow: hidden;
  white-space: nowrap;
  padding: .9rem 0;
}
.marquee-track {
  display: inline-block;
  animation: marquee-scroll 18s linear infinite;
}
.marquee-track span {
  font-family: var(--font-display);
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: .1em;
}
@keyframes marquee-scroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
```

- [ ] **Step 3: Verify in browser**

Refresh, scroll below hero. Expected: black band, cream uppercase text scrolling right-to-left, loop restart invisible (if it jumps, the two `<span>` contents aren't identical — they must match exactly).

- [ ] **Step 4: Update LEARNING.md** — append: marquee = duplicated text + `translateX(-50%)` loop; `aria-hidden` hides duplicates from screen readers.

- [ ] **Step 5: Commit**

```bash
git add index.html css/style.css docs/LEARNING.md
git commit -m "feat: infinite marquee skills band"
```

---

### Task 5: About section + scroll reveal (#3) + mask reveal (#2)

**Files:**
- Modify: `index.html` (after marquee)
- Modify: `css/style.css` (append)
- Modify: `js/animations.js` (append `initReveals`)
- Modify: `js/main.js` (add call)
- Modify: `docs/LEARNING.md` (append)

**Interfaces:**
- Produces: `initReveals()`; contract: any element with `data-reveal` fades/rises when scrolled into view; optional `--d` property on the element adds transition delay for stagger. `.mask > .mask-inner` markup: inner slides up when the ancestor `[data-reveal]` becomes `.is-visible`. All later sections reuse `data-reveal`.

**Teach:** IntersectionObserver ("a doorbell that rings when an element enters the screen"), CSS class toggling as the JS↔CSS handshake, `overflow: hidden` masking.

- [ ] **Step 1: Add About markup after the marquee**

```html
<section class="about grid-bg" id="about">
  <p class="label" data-reveal>About</p>
  <div class="about-grid">
    <h2 class="about-statement" data-reveal>
    <span class="mask"><span class="mask-inner">Student developer who ships:</span></span>
      <span class="mask"><span class="mask-inner" style="--d:.12s">web, hardware, and AI —</span></span>
      <span class="mask"><span class="mask-inner" style="--d:.24s">built to actually work.</span></span>
    </h2>
    <div class="about-body" data-reveal style="--d:.2s">
      <p>
        [PLACEHOLDER — replaced in Task 12 with Myke's real bio:
        academic background, journey, immediate career goals.]
      </p>
      <ul class="chips" aria-label="Core skills">
        <li>HTML</li><li>CSS</li><li>JavaScript</li>
        <li>Arduino</li><li>IoT</li><li>Local LLMs</li>
      </ul>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Append CSS**

```css
/* ============ #3 SCROLL REVEAL ============ */
[data-reveal] {
  opacity: 0;
  transform: translateY(28px);
  transition:
    opacity .7s ease var(--d, 0s),
    transform .7s cubic-bezier(.2, .7, .2, 1) var(--d, 0s);
}
[data-reveal].is-visible { opacity: 1; transform: none; }

/* ============ #2 MASK REVEAL ============ */
.mask { display: block; overflow: hidden; }
.mask-inner {
  display: block;
  transform: translateY(110%);
  transition: transform .8s cubic-bezier(.2, .7, .2, 1) var(--d, 0s);
}
[data-reveal].is-visible .mask-inner { transform: translateY(0); }

/* ============ ABOUT ============ */
.about-grid {
  display: grid;
  grid-template-columns: 1.2fr .8fr;
  gap: clamp(1.5rem, 4vw, 4rem);
  margin-top: 1.5rem;
}
.about-statement {
  font-family: var(--font-display);
  font-size: clamp(1.4rem, 3.2vw, 2.6rem);
  line-height: 1.15;
  text-transform: uppercase;
  letter-spacing: -.01em;
}
.about-body p { color: #4a4438; max-width: 42rem; }
.chips { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: 1.2rem; }
.chips li {
  border: 1.5px solid var(--ink);
  border-radius: 999px;
  padding: .2rem .8rem;
  font-size: .7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .08em;
}
@media (max-width: 720px) {
  .about-grid { grid-template-columns: 1fr; }
}
```

- [ ] **Step 3: Append `initReveals` to `js/animations.js`**

```js
/* ---- #3 Scroll reveal --------------------------- */
/* IntersectionObserver = "ring my doorbell when this
   element enters the viewport". We add .is-visible once,
   then stop watching that element. */
function initReveals() {
  const targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length) return;

  if (REDUCE_MOTION) {
    targets.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  targets.forEach(el => io.observe(el));
}
```

And in `js/main.js` add `initReveals();` after `initCascade();`.

- [ ] **Step 4: Verify in browser**

Refresh at top, scroll down slowly. Expected: "About" label and body fade/rise in; the three statement lines slide UP out of invisible masks, one after another (0 / .12s / .24s). Scroll back up and down again — they do NOT re-animate (once is intentional). With reduced-motion emulation: everything simply visible.

- [ ] **Step 5: Update LEARNING.md** — append: IntersectionObserver doorbell analogy; JS toggles classes / CSS owns the animation (separation of concerns); mask reveal = `overflow:hidden` + translateY.

- [ ] **Step 6: Commit**

```bash
git add index.html css/style.css js/animations.js js/main.js docs/LEARNING.md
git commit -m "feat: about section with scroll reveal and mask reveal systems"
```

---

### Task 6: Dark statement section + scroll-linked word highlight (#7)

**Files:**
- Modify: `index.html` (after About)
- Modify: `css/style.css` (append)
- Modify: `js/animations.js` (append `initScrub`)
- Modify: `js/main.js` (add call)
- Modify: `docs/LEARNING.md` (append)

**Interfaces:**
- Produces: `initScrub()`; contract: exactly one element with `data-scrub` inside a `<section>`; its words light up in proportion to scroll progress and dim when scrolling back.

**Teach:** scroll events + `getBoundingClientRect`, mapping a position to a 0–1 progress number, trigger vs scrub (fire-once vs tied-to-scroll — compare with Task 5).

- [ ] **Step 1: Add markup after About**

```html
<section class="statement">
  <p class="statement-text" data-scrub>
    Building web, hardware, and AI projects that actually work
  </p>
</section>
```

- [ ] **Step 2: Append CSS**

```css
/* ============ #7 SCROLL-LINKED HIGHLIGHT ============ */
.statement {
  background: var(--ink);
  min-height: 90vh;
  display: flex;
  align-items: center;
}
.statement-text {
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 5vw, 4rem);
  line-height: 1.2;
  text-transform: uppercase;
  max-width: 60rem;
}
.statement-text .word { color: #4a4a45; transition: color .25s ease; }
.statement-text .word.lit { color: var(--cream); }
```

- [ ] **Step 3: Append `initScrub` to `js/animations.js`**

```js
/* ---- #7 Scroll-linked word highlight ------------ */
/* Unlike a reveal (fires once), a scrub is TIED to scroll
   position: progress 0..1 decides how many words are lit,
   so scrolling back dims them again. */
function initScrub() {
  const el = document.querySelector('[data-scrub]');
  if (!el) return;

  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words.map(w => `<span class="word">${w}</span>`).join(' ');
  const spans = el.querySelectorAll('.word');

  if (REDUCE_MOTION) {
    spans.forEach(s => s.classList.add('lit'));
    return;
  }

  const section = el.closest('section');

  function onScroll() {
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    // 0 when the section's top reaches 85% down the screen,
    // 1 when it reaches 30% — i.e. lights sweep on while it rises.
    const progress = Math.min(1, Math.max(0, (vh * 0.85 - rect.top) / (vh * 0.55)));
    const lit = Math.round(progress * spans.length);
    spans.forEach((s, i) => s.classList.toggle('lit', i < lit));
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
```

And in `js/main.js` add `initScrub();`.

- [ ] **Step 4: Verify in browser**

Scroll down slowly through the dark section. Expected: words start dim gray and brighten to cream one by one as the section rises; scrolling UP dims them in reverse. All words lit by the time the section is centered.

- [ ] **Step 5: Update LEARNING.md** — append: trigger vs scrub distinction; `getBoundingClientRect` gives an element's live position; normalize any value to 0–1 progress then map progress → effect.

- [ ] **Step 6: Commit**

```bash
git add index.html css/style.css js/animations.js js/main.js docs/LEARNING.md
git commit -m "feat: dark statement section with scroll-linked word highlight"
```

---

### Task 7: Projects grid + hover reveal + cursor pill (#8)

**Files:**
- Modify: `index.html` (after statement section)
- Modify: `css/style.css` (append)
- Modify: `js/animations.js` (append `initProjectPills`)
- Modify: `js/main.js` (add call)
- Modify: `docs/LEARNING.md` (append)

**Interfaces:**
- Consumes: `data-reveal` from Task 5.
- Produces: `initProjectPills()`. Grid links point at `projects/booking-website.html`, `projects/sentrycore.html`, `projects/mazebot.html` (pages created in Tasks 9–11 — links 404 until then, expected).

**Teach:** CSS Grid, `position: relative/absolute` layering, `mousemove` events + coordinates relative to a container, `(hover: hover)` media query for touch safety.

- [ ] **Step 1: Add markup after the statement section**

```html
<section class="projects grid-bg" id="projects">
  <p class="label" data-reveal>Selected Projects</p>
  <h2 class="projects-title" data-reveal>Three builds,<br>three domains.</h2>
  <div class="project-grid">

    <a class="project-cell" href="projects/booking-website.html" data-reveal>
      <div class="cell-img img-booking" aria-hidden="true"></div>
      <span class="cell-year">2025</span>
      <span class="cell-name">Booking Website</span>
      <span class="cell-cat">Full Stack Web</span>
      <span class="view-pill" aria-hidden="true">View project →</span>
    </a>

    <a class="project-cell" href="projects/sentrycore.html" data-reveal style="--d:.1s">
      <div class="cell-img img-sentry" aria-hidden="true"></div>
      <span class="cell-year">2026</span>
      <span class="cell-name">sentryCORE</span>
      <span class="cell-cat">IoT × AI</span>
      <span class="view-pill" aria-hidden="true">View project →</span>
    </a>

    <a class="project-cell" href="projects/mazebot.html" data-reveal style="--d:.2s">
      <div class="cell-img img-mazebot" aria-hidden="true"></div>
      <span class="cell-year">2025</span>
      <span class="cell-name">MazeBot</span>
      <span class="cell-cat">Robotics</span>
      <span class="view-pill" aria-hidden="true">View project →</span>
    </a>

    <a class="project-cell cell-more" href="https://github.com/2320317-spec" target="_blank" rel="noopener" data-reveal style="--d:.3s">
      <span class="cell-name">More on GitHub →</span>
      <span class="cell-cat">All repositories</span>
    </a>

  </div>
</section>
```

- [ ] **Step 2: Append CSS**

```css
/* ============ PROJECTS GRID + #8 HOVER REVEAL ============ */
.projects-title {
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 3.5rem);
  text-transform: uppercase;
  line-height: 1;
  margin: 1rem 0 2.5rem;
}
.project-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border: 1px solid #d8d0c2;
}
.project-cell {
  position: relative;
  aspect-ratio: 4 / 3;
  border: 1px solid #d8d0c2;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  cursor: pointer;
}
/* image sits underneath, invisible until hover */
.cell-img {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity .3s ease;
  background-size: cover;
  background-position: center;
}
/* placeholder art until real screenshots land in Task 12 */
.img-booking { background-image: linear-gradient(135deg, #c9b8ff, #e8e0ff 50%, #9db8ff); }
.img-sentry  { background-image: linear-gradient(135deg, #2e2447, #6d5a9e 55%, #a99cc9); }
.img-mazebot { background-image: linear-gradient(135deg, #b8e6c9, #e8fff0 50%, #7acca0); }

.project-cell:hover .cell-img { opacity: 1; }
.cell-year, .cell-name, .cell-cat { position: relative; z-index: 1; }
.cell-year { align-self: flex-start; font-size: .75rem; color: #8a8072; }
.cell-name {
  font-family: var(--font-display);
  font-size: clamp(1.1rem, 2.6vw, 1.9rem);
  text-transform: uppercase;
  text-align: center;
}
.cell-cat { font-size: .65rem; font-weight: 600; letter-spacing: .16em; text-transform: uppercase; color: #6f675a; }
.cell-more { background: var(--ink); color: var(--cream); justify-content: center; gap: .6rem; }
.cell-more .cell-cat { color: #9b9285; }

/* cursor-following pill (positioned by JS) */
.view-pill {
  position: absolute;
  z-index: 2;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) scale(.6);
  background: #fff;
  color: var(--ink);
  border-radius: 999px;
  padding: .55rem 1.2rem;
  font-size: .8rem;
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  box-shadow: 0 4px 20px rgba(0,0,0,.18);
  transition: opacity .25s ease, transform .25s cubic-bezier(.2,.7,.2,1);
}
.project-cell:hover .view-pill { opacity: 1; transform: translate(-50%, -50%) scale(1); }

/* touch devices: no hover — show a hint of the image, hide pills */
@media (hover: none) {
  .cell-img { opacity: .25; }
  .view-pill { display: none; }
}
@media (max-width: 720px) {
  .project-grid { grid-template-columns: 1fr; }
}
```

- [ ] **Step 3: Append `initProjectPills` to `js/animations.js`**

```js
/* ---- #8 Cursor-following "View project" pill ---- */
function initProjectPills() {
  if (!window.matchMedia('(hover: hover)').matches) return; // touch: skip
  document.querySelectorAll('.project-cell').forEach(cell => {
    const pill = cell.querySelector('.view-pill');
    if (!pill) return;
    cell.addEventListener('mousemove', (e) => {
      const rect = cell.getBoundingClientRect();
      pill.style.left = (e.clientX - rect.left) + 'px';
      pill.style.top = (e.clientY - rect.top) + 'px';
    });
  });
}
```

And in `js/main.js` add `initProjectPills();`.

- [ ] **Step 4: Verify in browser**

Scroll to projects. Expected: cells stagger in; hovering a cell fades its gradient in fast (~0.3s) and a white "View project →" pill appears and FOLLOWS the cursor; leaving resets to clean. The GitHub cell is ink-colored, opens GitHub in a new tab. DevTools device emulation (touch): images faintly visible, no pills.

- [ ] **Step 5: Update LEARNING.md** — append: CSS Grid, absolute-inside-relative layering, `e.clientX - rect.left` converts screen coords to element coords, `(hover: hover)` guard.

- [ ] **Step 6: Commit**

```bash
git add index.html css/style.css js/animations.js js/main.js docs/LEARNING.md
git commit -m "feat: projects grid with hover reveal and cursor pill"
```

---

### Task 8: Footer + underline sweep (#4) + proximity letter zoom (#9)

**Files:**
- Modify: `index.html` (after projects, closing out `<main>`)
- Modify: `css/style.css` (append)
- Modify: `js/animations.js` (append `initLetterZoom`)
- Modify: `js/main.js` (add call)
- Modify: `docs/LEARNING.md` (append)

**Interfaces:**
- Consumes: `splitLetters(el)` from Task 3 (reused for the watermark).
- Produces: `initLetterZoom()` targeting `#watermark`; `.link-sweep` underline-hover class reused on case-study pages.

**Teach:** reusing `splitLetters` (write once, use everywhere = DRY), distance→closeness→scale math (recap of the v3 demo they tuned), `::after` pseudo-elements for the underline.

- [ ] **Step 1: Add footer markup after `</main>`'s last section (footer goes inside `<body>`, after `<main>`)**

```html
<footer class="site-footer" id="contact">
  <p class="watermark" id="watermark" aria-hidden="true">Myke Marundan</p>
  <div class="footer-cta">
    <p class="footer-small">Let's build something</p>
    <p class="footer-big">Meaningful<br>and memorable</p>
  </div>
  <nav class="footer-links" aria-label="Contact links">
    <a class="link-sweep" href="mailto:PLACEHOLDER-EMAIL">Email</a>
    <a class="link-sweep" href="https://github.com/2320317-spec" target="_blank" rel="noopener">GitHub</a>
    <a class="link-sweep" href="https://www.linkedin.com/in/myke-lhowelle-undefined-259729405" target="_blank" rel="noopener">LinkedIn</a>
    <a class="link-sweep" href="assets/resume/Myke-Marundan-Resume.pdf" download>Resume (PDF) ↓</a>
  </nav>
  <div class="footer-credit">
    <span>Designed &amp; coded by Myke Lhowelle S. Marundan</span>
    <span>Built with HTML · CSS · JS</span>
  </div>
</footer>
```

- [ ] **Step 2: Append CSS**

```css
/* ============ FOOTER + #9 LETTER ZOOM ============ */
.site-footer {
  background: var(--violet);
  color: var(--cream);
  padding: clamp(3rem, 8vh, 6rem) var(--pad-x) 2rem;
  overflow: hidden;
}
.watermark {
  font-family: var(--font-display);
  font-size: clamp(3rem, 11vw, 10rem);
  line-height: .95;
  text-transform: uppercase;
  letter-spacing: -.02em;
  color: var(--violet-light);
  text-align: center;
  user-select: none;
}
.watermark .letter {
  /* override cascade defaults: watermark letters are always visible */
  opacity: 1;
  animation: none;
  transform: none;
  transition: transform .18s ease-out;
  transform-origin: bottom center;
  will-change: transform;
}
.footer-cta { margin-top: 3rem; }
.footer-small { font-size: 1.05rem; color: var(--lavender); }
.footer-big {
  font-family: var(--font-display);
  font-size: clamp(2rem, 6vw, 4.5rem);
  line-height: 1;
  text-transform: uppercase;
}
.footer-links { display: flex; gap: 2rem; flex-wrap: wrap; margin-top: 2.5rem; }
.footer-links a {
  font-size: .8rem;
  font-weight: 600;
  letter-spacing: .12em;
  text-transform: uppercase;
  padding-bottom: .25rem;
}

/* ---- #4 underline sweep (reusable) ---- */
.link-sweep { position: relative; }
.link-sweep::after {
  content: '';
  position: absolute;
  left: 0; bottom: 0;
  width: 100%; height: 2px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform .35s cubic-bezier(.2, .7, .2, 1);
}
.link-sweep:hover::after { transform: scaleX(1); transform-origin: left; }

.footer-credit {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 3.5rem;
  font-size: .7rem;
  color: var(--lavender);
}
```

- [ ] **Step 3: Append `initLetterZoom` to `js/animations.js`**

```js
/* ---- #9 Proximity letter zoom (footer watermark) ---- */
/* User-approved tuning — do not change without asking Myke:
   MAX 0.18, RADIUS 170, lift 4px, transition .18s (in CSS). */
function initLetterZoom() {
  const el = document.getElementById('watermark');
  if (!el) return;
  splitLetters(el); // reuse the Task 3 splitter
  if (REDUCE_MOTION || !window.matchMedia('(hover: hover)').matches) return;

  const letters = el.querySelectorAll('.letter');
  const RADIUS = 170;
  const MAX = 0.18;

  el.addEventListener('mousemove', (e) => {
    letters.forEach(l => {
      const rect = l.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const dist = Math.abs(e.clientX - centerX);
      const closeness = Math.max(0, 1 - dist / RADIUS);
      const scale = 1 + MAX * closeness * closeness;
      l.style.transform = `scale(${scale.toFixed(3)}) translateY(${(-4 * closeness).toFixed(1)}px)`;
    });
  });

  el.addEventListener('mouseleave', () => {
    letters.forEach(l => { l.style.transform = ''; });
  });
}
```

And in `js/main.js` add `initLetterZoom();`.

- [ ] **Step 4: Verify in browser**

Scroll to footer. Expected: violet footer, tone-on-tone giant "MYKE MARUNDAN"; sweeping the mouse across it makes letters swell gently (max +18%) with neighbors rising less — the subtle dock effect from the approved demo. Links show the underline sweep left-to-right on hover. Resume link 404s (file arrives Task 12 — expected).

- [ ] **Step 5: Update LEARNING.md** — append: DRY in action (`splitLetters` reused), pseudo-elements (`::after`) draw the underline without extra HTML, `transform-origin` flip makes the sweep exit the opposite way.

- [ ] **Step 6: Commit**

```bash
git add index.html css/style.css js/animations.js js/main.js docs/LEARNING.md
git commit -m "feat: violet footer with letter zoom and underline sweep"
```

---

### Task 9: Case-study template — booking-website.html

**Files:**
- Create: `projects/booking-website.html`
- Modify: `css/style.css` (append case-study components)
- Modify: `docs/LEARNING.md` (append)

**Interfaces:**
- Consumes: `data-cascade`/`.cascade-line` (Task 3), `data-reveal` (Task 5), `.link-sweep` (Task 8), `.chips` (Task 5).
- Produces: all `.cs-*` case-study component classes; page skeleton copied (then customized) by Tasks 10–11. Asset/CSS/JS paths from `projects/` use `../` prefix.

**Teach:** how multi-page sites share assets, relative paths (`../css/style.css` = "go up one folder"), why consistent component classes beat per-page styles.

- [ ] **Step 1: Create `projects/booking-website.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Website — Myke Lhowelle Marundan</title>
  <meta name="description" content="Case study: full stack booking website by Myke Lhowelle S. Marundan.">
  <link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;600&family=Archivo+Black&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/style.css">
</head>
<body>
<main>
  <section class="cs-header grid-bg">
    <p class="label"><a class="link-sweep" href="../index.html#projects">← Back</a> &nbsp;·&nbsp; Selected Projects · 01/03</p>
    <h1 class="cs-title" data-cascade>
      <span class="cascade-line">Booking</span>
      <span class="cascade-line" style="--base:300ms">Website</span>
    </h1>
    <div class="cs-meta">
      <span>2025</span><span>Full Stack Web</span><span>Role: Developer</span>
    </div>
    <ul class="chips" aria-label="Tech stack">
      <li>HTML</li><li>CSS</li><li>JavaScript</li>
      <!-- PLACEHOLDER: real stack confirmed in Task 12 -->
    </ul>
    <div class="cs-actions">
      <a class="cs-btn cs-btn-solid" href="#" target="_blank" rel="noopener">Live site ↗</a>
      <a class="cs-btn" href="https://github.com/2320317-spec" target="_blank" rel="noopener">GitHub repo ↗</a>
    </div>
  </section>

  <section class="cs-hero" data-reveal>
    <div class="cs-img-placeholder">Project screenshot — added in Task 12</div>
  </section>

  <section class="cs-star grid-bg">
    <article class="star-block" data-reveal>
      <span class="star-num">01</span>
      <div>
        <p class="label">Situation</p>
        <h2 class="star-head">The context &amp; the problem</h2>
        <p class="star-body">[PLACEHOLDER — Myke's STAR content, Task 12]</p>
      </div>
    </article>

    <article class="star-block" data-reveal>
      <span class="star-num">02</span>
      <div>
        <p class="label">Task</p>
        <h2 class="star-head">My role &amp; responsibility</h2>
        <p class="star-body">[PLACEHOLDER — Task 12]</p>
      </div>
    </article>

    <article class="star-block" data-reveal>
      <span class="star-num">03</span>
      <div>
        <p class="label">Action</p>
        <h2 class="star-head">How I built it</h2>
        <p class="star-body">[PLACEHOLDER — Task 12]</p>
        <pre class="code-block"><code>// PLACEHOLDER — a real snippet from the project (Task 12)</code></pre>
      </div>
    </article>

    <article class="star-block" data-reveal>
      <span class="star-num">04</span>
      <div>
        <p class="label">Result</p>
        <h2 class="star-head">What it achieved</h2>
        <p class="star-body">[PLACEHOLDER — Task 12]</p>
        <div class="star-stats">
          <div><span class="stat-n">—</span><span class="stat-l">stat 1 (Task 12)</span></div>
          <div><span class="stat-n">—</span><span class="stat-l">stat 2 (Task 12)</span></div>
        </div>
      </div>
    </article>
  </section>

  <a class="cs-next" href="sentrycore.html">
    <span class="label" style="color:var(--lavender)">Next project</span>
    <span class="cs-next-name">sentryCORE →</span>
  </a>
</main>

<script src="../js/animations.js"></script>
<script src="../js/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: Append case-study CSS to `css/style.css`**

```css
/* ============ CASE STUDY PAGES ============ */
.cs-header { padding-top: clamp(3rem, 8vh, 5rem); }
.cs-title {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 9vw, 7rem);
  line-height: .95;
  text-transform: uppercase;
  letter-spacing: -.02em;
  margin: 1.2rem 0 1rem;
}
.cs-title .cascade-line { display: block; }
.cs-meta { display: flex; gap: 1.5rem; flex-wrap: wrap; font-size: .75rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: #6f675a; margin-bottom: 1rem; }
.cs-actions { display: flex; gap: .8rem; margin-top: 1.5rem; }
.cs-btn {
  border: 1.5px solid var(--ink);
  border-radius: 999px;
  padding: .55rem 1.3rem;
  font-size: .72rem;
  font-weight: 600;
  letter-spacing: .1em;
  text-transform: uppercase;
  transition: transform .25s cubic-bezier(.2,.7,.2,1), background .25s, color .25s;
}
.cs-btn:hover { transform: scale(1.05); background: var(--ink); color: var(--cream); }
.cs-btn-solid { background: var(--violet); border-color: var(--violet); color: var(--cream); }
.cs-btn-solid:hover { background: var(--ink); border-color: var(--ink); }

.cs-hero { padding-top: 0; }
.cs-img-placeholder {
  border: 1px dashed #b8ae9d;
  border-radius: 8px;
  min-height: clamp(200px, 45vh, 480px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8a8072;
  font-size: .75rem;
  letter-spacing: .14em;
  text-transform: uppercase;
}

.cs-star { display: flex; flex-direction: column; gap: 3.5rem; }
.star-block { display: grid; grid-template-columns: 5rem 1fr; gap: 1.2rem; align-items: start; }
.star-num { font-family: var(--font-display); font-size: 2.6rem; color: #d8cfe8; line-height: 1; }
.star-head { font-family: var(--font-display); font-size: clamp(1.1rem, 2.4vw, 1.6rem); text-transform: uppercase; margin: .3rem 0 .6rem; }
.star-body { max-width: 46rem; color: #4a4438; }
.code-block {
  background: var(--ink);
  color: #b8e6c9;
  border-radius: 8px;
  padding: 1.1rem 1.3rem;
  font-size: .8rem;
  line-height: 1.6;
  overflow-x: auto;
  margin-top: 1rem;
}
.star-stats { display: flex; gap: 2.5rem; flex-wrap: wrap; margin-top: 1.2rem; }
.star-stats .stat-n { display: block; font-family: var(--font-display); font-size: 2.2rem; color: var(--violet); }
.star-stats .stat-l { font-size: .65rem; letter-spacing: .12em; text-transform: uppercase; color: #8a8072; }

.cs-next {
  display: block;
  background: var(--violet);
  color: var(--cream);
  text-align: center;
  padding: 3.5rem var(--pad-x);
  transition: background .3s ease;
}
.cs-next:hover { background: var(--violet-light); }
.cs-next-name { display: block; font-family: var(--font-display); font-size: clamp(1.6rem, 4vw, 2.8rem); text-transform: uppercase; margin-top: .4rem; }

@media (max-width: 720px) {
  .star-block { grid-template-columns: 1fr; }
  .star-num { font-size: 2rem; }
}
```

- [ ] **Step 3: Verify in browser**

Open `projects/booking-website.html` directly. Expected: styles and fonts load (proving `../` paths work), title cascades in, STAR blocks reveal on scroll, buttons invert on hover, back link sweeps underline, violet "Next project: sentryCORE →" band at bottom (404s until Task 10). Check the home page grid → clicking "Booking Website" lands here.

- [ ] **Step 4: Update LEARNING.md** — append: relative paths (`../` = up one folder), one stylesheet serving many pages, component classes as a mini design system.

- [ ] **Step 5: Commit**

```bash
git add projects/booking-website.html css/style.css docs/LEARNING.md
git commit -m "feat: case-study template with booking website page"
```

---

### Task 10: sentryCORE page (custom blocks: hardware manifest + architecture diagram)

**Files:**
- Create: `projects/sentrycore.html`
- Modify: `css/style.css` (append `.hw-list`, `.arch` components)
- Modify: `docs/LEARNING.md` (append)

**Interfaces:**
- Consumes: every `.cs-*` class from Task 9.
- Produces: `.hw-list` (hardware manifest) and `.arch` (architecture diagram) components; `.hw-list` reused by Task 11.

**Teach:** copying a template page and what to change (head metadata, title, meta, content); building a diagram from styled divs instead of an image (it stays crisp, editable, and themeable).

- [ ] **Step 1: Create `projects/sentrycore.html`** — copy `booking-website.html`, then apply ALL of these changes:

  - `<title>sentryCORE — Myke Lhowelle Marundan</title>`; description: `Case study: sentryCORE — AI smart lock with Arduino, camera, and a local LLM.`
  - Header label position marker: `02/03`
  - Title lines: `sentry` / `CORE` (cascade lines)
  - Meta: `<span>2026</span><span>IoT × AI</span><span>Role: Developer</span>`
  - Chips: `<li>Arduino</li><li>JavaScript</li><li>LM Studio</li><li>Local LLM</li>`
  - Actions: remove the "Live site ↗" button (hardware project) — keep GitHub repo button only.
  - Next link at bottom: `href="mazebot.html"`, name `MazeBot →`, label `Next project`.
  - After the `01 Situation` block's `star-body`, no change. Inside the **`03 Action`** block, after `star-body` and before `code-block`, insert the two custom blocks:

```html
<h3 class="cs-sub">Hardware used</h3>
<ul class="hw-list" aria-label="Hardware components">
  <li>Arduino</li>
  <li>Servo motor</li>
  <li>4×4 Keypad</li>
  <li>16×2 LCD</li>
  <li>Camera module</li>
</ul>

<h3 class="cs-sub">System architecture</h3>
<div class="arch" role="img" aria-label="System flow: keypad and camera feed the Arduino, which talks to the web interface, which queries a local LLM in LM Studio, which decides whether the servo unlocks.">
  <span class="arch-node">Keypad + Camera</span>
  <span class="arch-arrow" aria-hidden="true">→</span>
  <span class="arch-node">Arduino</span>
  <span class="arch-arrow" aria-hidden="true">→</span>
  <span class="arch-node">Web interface</span>
  <span class="arch-arrow" aria-hidden="true">→</span>
  <span class="arch-node">Local LLM (LM Studio)</span>
  <span class="arch-arrow" aria-hidden="true">→</span>
  <span class="arch-node arch-node-accent">Servo unlock</span>
</div>
```

  - In the **`04 Result`** block, after `star-stats`, insert the demo slot:

```html
<div class="cs-img-placeholder" style="min-height:180px">Demo video / GIF — added in Task 12</div>
```

- [ ] **Step 2: Append CSS**

```css
/* ============ SENTRYCORE / HARDWARE COMPONENTS ============ */
.cs-sub {
  font-family: var(--font-display);
  font-size: .95rem;
  text-transform: uppercase;
  letter-spacing: .04em;
  margin: 1.6rem 0 .7rem;
}
.hw-list { display: flex; flex-wrap: wrap; gap: .5rem; }
.hw-list li {
  border: 1.5px solid var(--violet);
  color: var(--violet);
  border-radius: 999px;
  padding: .2rem .8rem;
  font-size: .7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .08em;
}
.arch {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: .6rem;
  background: #fff;
  border: 1px solid #d8d0c2;
  border-radius: 8px;
  padding: 1.2rem;
}
.arch-node {
  border: 1.5px solid var(--ink);
  border-radius: 6px;
  padding: .5rem .9rem;
  font-size: .72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .06em;
  background: var(--cream);
}
.arch-node-accent { background: var(--violet); border-color: var(--violet); color: var(--cream); }
.arch-arrow { font-weight: 700; color: #8a8072; }
```

- [ ] **Step 3: Verify in browser**

Open `projects/sentrycore.html`. Expected: "SENTRY / CORE" cascades; hardware chips render in violet outline; architecture diagram reads Keypad+Camera → Arduino → Web interface → Local LLM → Servo unlock with the final node solid violet; no Live-site button; next band → MazeBot. Narrow the window: diagram nodes wrap gracefully.

- [ ] **Step 4: Update LEARNING.md** — append: template reuse checklist (title/meta/content/next-link), HTML+CSS diagrams > image diagrams (editable, crisp, accessible via aria-label).

- [ ] **Step 5: Commit**

```bash
git add projects/sentrycore.html css/style.css docs/LEARNING.md
git commit -m "feat: sentryCORE case study with hardware manifest and architecture diagram"
```

---

### Task 11: MazeBot page (algorithm block) + close the navigation loop

**Files:**
- Create: `projects/mazebot.html`
- Modify: `css/style.css` (append `.algo-steps`)
- Modify: `docs/LEARNING.md` (append)

**Interfaces:**
- Consumes: `.cs-*`, `.hw-list` (Task 10).
- Produces: `.algo-steps` ordered-list component. Completes the 01→02→03→01 next-project cycle.

**Teach:** ordered lists + CSS counters; what "closing a navigation loop" means for UX (no dead ends).

- [ ] **Step 1: Create `projects/mazebot.html`** — copy `sentrycore.html`, then apply ALL of these changes:

  - `<title>MazeBot — Myke Lhowelle Marundan</title>`; description: `Case study: MazeBot — an Arduino maze-solving robot.`
  - Position marker: `03/03`; title lines: `Maze` / `Bot`; meta: `<span>2025</span><span>Robotics</span><span>Role: Developer</span>`
  - Chips: `<li>Arduino</li><li>C/C++</li><li>Sensors</li>`
  - Hardware list contents: `<li>Arduino</li><li>Motors + wheels</li><li>Sensors</li>` *(exact parts confirmed with Myke in Task 12)*
  - Replace the architecture diagram (`.cs-sub` + `.arch`) with the algorithm block:

```html
<h3 class="cs-sub">How it solves the maze</h3>
<ol class="algo-steps">
  <li>[PLACEHOLDER — step 1 of the actual navigation logic, Task 12]</li>
  <li>[PLACEHOLDER — step 2]</li>
  <li>[PLACEHOLDER — step 3]</li>
</ol>
```

  - Next link: `href="booking-website.html"`, name `Booking Website →` (closes the loop).

- [ ] **Step 2: Append CSS**

```css
/* ============ MAZEBOT / ALGORITHM STEPS ============ */
.algo-steps { counter-reset: algo; max-width: 46rem; }
.algo-steps li {
  counter-increment: algo;
  position: relative;
  padding: .7rem 0 .7rem 3rem;
  border-bottom: 1px solid #d8d0c2;
  color: #4a4438;
}
.algo-steps li::before {
  content: counter(algo, decimal-leading-zero);
  position: absolute;
  left: 0;
  font-family: var(--font-display);
  color: var(--violet);
}
```

- [ ] **Step 3: Verify in browser**

Open `projects/mazebot.html`: numbered algorithm steps show violet `01 02 03` counters. Click through the whole loop: home grid → Booking → sentryCORE → MazeBot → Booking. Every page's back link returns to the home projects grid. No dead ends anywhere.

- [ ] **Step 4: Update LEARNING.md** — append: CSS counters generate the numbers (no hardcoding), navigation loops keep visitors moving.

- [ ] **Step 5: Commit**

```bash
git add projects/mazebot.html css/style.css docs/LEARNING.md
git commit -m "feat: MazeBot case study and complete project navigation loop"
```

---

### Task 12: Real content entry (collaborative with Myke)

**Files:**
- Modify: `index.html` (bio paragraph, chips)
- Modify: `projects/booking-website.html`, `projects/sentrycore.html`, `projects/mazebot.html` (all `[PLACEHOLDER …]` blocks)
- Create: `assets/resume/Myke-Marundan-Resume.pdf` (provided by Myke)
- Create: `assets/images/booking-1.png`, `assets/images/sentrycore-1.png`, `assets/images/mazebot-1.png` (screenshots provided by Myke; exact names may vary — update the CSS `background-image`/`<img>` references to match)
- Modify: `css/style.css` (swap `.img-booking/.img-sentry/.img-mazebot` gradients for `background-image: url('../assets/images/…')`)

**Interfaces:**
- Consumes: every placeholder marker from Tasks 5, 9, 10, 11.
- Produces: content-complete site; zero `[PLACEHOLDER` markers remain.

**Teach:** STAR writing itself — interview Myke project by project (this doubles as interview practice for the internship presentation).

- [ ] **Step 1: Interview Myke for the About bio** (background, journey, career goals — 3–5 sentences) and his confirmed skill list; replace the About placeholder and chips in `index.html`.
- [ ] **Step 2: Interview for Booking Website STAR** — Situation, Task, Action (+ one real code snippet from the project), Result (+ 2–3 quantifiable stats). Replace all placeholders. Set the real Live-site URL or remove that button. Set the real GitHub repo URL for this project.
- [ ] **Step 3: Interview for sentryCORE STAR** — same, plus verify the LCD is 16×2, confirm the exact LLM/model used in LM Studio, and correct the architecture diagram if the real data flow differs. Replace placeholders.
- [ ] **Step 4: Interview for MazeBot STAR** — same, plus the real algorithm steps and exact hardware list. Replace placeholders.
- [ ] **Step 5: Collect files from Myke:** resume PDF into `assets/resume/Myke-Marundan-Resume.pdf`; at least one screenshot/photo per project into `assets/images/`; his professional email into the footer `mailto:`. Swap the three grid gradient classes for real `background-image: url(...)` screenshots. Add hero images to each case-study page (replace `.cs-img-placeholder` with `<img>` + descriptive `alt`).
- [ ] **Step 6: Verify** — search the repo for `PLACEHOLDER`: zero hits. Click the resume link: PDF downloads. Every external link opens correctly.

Run: `grep -ri "placeholder" index.html projects/` → expected: no matches.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: real content — bio, STAR case studies, resume, screenshots"
```

---

### Task 13: Cross-device & accessibility verification sweep

**Files:**
- Modify: whatever the checks below flag (fixes only, no new features)

**Interfaces:** none new — this is a structured QA pass.

**Teach:** how professionals verify before shipping; DevTools device toolbar; Lighthouse.

- [ ] **Step 1: Responsive check** — DevTools device toolbar at 375px (phone), 768px (tablet), 1280px+ (desktop). For each page (home + 3 case studies): no horizontal scrolling; hero/title text never overflows; grids collapse to one column; diagram wraps. Fix anything that breaks, matching the existing media-query patterns.
- [ ] **Step 2: Touch check** — device emulation (touch): project cells navigate on tap, no stuck hover states, pills hidden, watermark zoom inactive.
- [ ] **Step 3: Reduced-motion check** — emulate `prefers-reduced-motion: reduce`: all content fully visible with no animation on every page (cascade text intact, scrub words all lit, reveals visible).
- [ ] **Step 4: Keyboard check** — Tab through the home page: every link reachable, focus visible. If focus is invisible on dark/violet sections, add `a:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }` to the utilities block in `css/style.css`.
- [ ] **Step 5: Lighthouse** — DevTools → Lighthouse → run on `index.html` (Performance + Accessibility + Best Practices + SEO). Expected: Accessibility ≥ 90, no contrast errors. Fix what it flags (typical: missing alt text, contrast on `#8a8072` labels — darken toward `#6f675a` if flagged).
- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "fix: responsive, touch, reduced-motion, and a11y issues from QA sweep"
```

---

### Task 14: Lenis smooth scroll (#6)

**Files:**
- Modify: `index.html`, `projects/booking-website.html`, `projects/sentrycore.html`, `projects/mazebot.html` (add script tag)
- Modify: `js/main.js` (init Lenis)
- Modify: `docs/LEARNING.md` (append)

**Interfaces:**
- Consumes: nothing internal. Adds global `Lenis` from CDN.
- Produces: buttery scroll site-wide. Must not break `initScrub` (scroll events still fire — Lenis scrolls natively via transform on the same scroll events, so `window` scroll listeners keep working).

**Teach:** what a library is, reading third-party docs, `requestAnimationFrame`, the trade-off just made (first dependency: convenience vs control).

- [ ] **Step 1: Add the script tag** before `js/animations.js` in all four HTML files:

```html
<script src="https://unpkg.com/lenis@1.1.14/dist/lenis.min.js"></script>
```

- [ ] **Step 2: Initialize in `js/main.js`** (inside the DOMContentLoaded handler, after the init calls):

```js
  // #6 Smooth scroll — the only external library, added last.
  if (!REDUCE_MOTION && typeof Lenis !== 'undefined') {
    const lenis = new Lenis();
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }
```

- [ ] **Step 3: Verify in browser**

Refresh home page and scroll with the wheel. Expected: weighted, gliding scroll. Critically re-test: scrub section still lights/dims words correctly; reveals still fire; anchor link `../index.html#projects` still lands on the grid. With reduced-motion emulation: native instant scrolling (Lenis skipped).

- [ ] **Step 4: Update LEARNING.md** — append: libraries = other people's tested code via one script tag; `requestAnimationFrame` = "call me every frame"; why we added it last.

- [ ] **Step 5: Commit**

```bash
git add index.html projects/ js/main.js docs/LEARNING.md
git commit -m "feat: Lenis smooth scrolling as final polish"
```

---

### Task 15: Deploy to GitHub Pages

**Files:**
- Create: `README.md`

**Interfaces:**
- Produces: public URL `https://2320317-spec.github.io/` (root user site).

**Teach:** remotes, push, what GitHub Pages does (serves the repo as a website), why the repo name `<username>.github.io` gives the root URL.

- [ ] **Step 1: Create `README.md`**

```markdown
# Myke Lhowelle S. Marundan — Portfolio

Personal portfolio: full stack web, IoT, and AI projects. Built from scratch
with vanilla HTML, CSS, and JavaScript — no frameworks, one library (Lenis).

**Live:** https://2320317-spec.github.io/

## Projects featured
- **Booking Website** — full stack web
- **sentryCORE** — AI smart lock (Arduino + camera + local LLM via LM Studio)
- **MazeBot** — Arduino maze-solving robot

## Design
Spec and decisions: `docs/superpowers/specs/2026-07-15-portfolio-design.md`.
Everything I learned building it: `docs/LEARNING.md`.
```

Commit it:

```bash
git add README.md
git commit -m "docs: README with live URL and project overview"
```

- [ ] **Step 2: Create the GitHub repo (Myke does this, guided)** — on github.com (logged in as `2320317-spec`): New repository → name **exactly** `2320317-spec.github.io` → Public → no README/gitignore (we have them) → Create. *(Claude must not create accounts or accept terms on Myke's behalf — Myke drives, Claude navigates.)*

- [ ] **Step 3: Connect and push**

```bash
git remote add origin https://github.com/2320317-spec/2320317-spec.github.io.git
git push -u origin main
```

(If prompted to authenticate, Myke signs in via the browser popup / credential manager himself.)

- [ ] **Step 4: Verify Pages is serving** — repos named `<username>.github.io` auto-enable Pages. Check: repo → Settings → Pages shows "Your site is live at https://2320317-spec.github.io/". First build can take ~2 minutes.

- [ ] **Step 5: End-to-end verification on the LIVE site** — visit `https://2320317-spec.github.io/` in a normal tab AND on Myke's actual phone: all four pages load with styles/fonts/images; all 9 animations behave; resume downloads; external links work. This fulfills internship Requirement #4.

- [ ] **Step 6: Final commit if any path bugs surfaced** (absolute-path mistakes appear only on live hosting):

```bash
git add -A
git commit -m "fix: live-hosting path corrections"
git push
```

---

## Self-Review (completed)

**Spec coverage:** rubric #1 About → Task 5+12; #2 STAR ×3 → Tasks 9–12; #3 resume/contact → Tasks 8+12; #4 deployment → Task 15. Animations: #1→T3, #2→T5, #3→T5, #4→T7/8/9, #5→T4, #6→T14, #7→T6, #8→T7, #9→T8. Design tokens → T1. Responsive + reduced-motion + touch → in-task CSS + T13 sweep. LEARNING.md → T1 and every task. Custom blocks (hardware/arch/algorithm) → T10/11. ✓
**Placeholders:** the `[PLACEHOLDER — Task 12]` markers are intentional, machine-greppable content slots with a dedicated fill task and a grep verification step — not plan gaps. ✓
**Type consistency:** `splitLetters`, `initCascade`, `initReveals`, `initScrub`, `initProjectPills`, `initLetterZoom`, `REDUCE_MOTION` used identically across Tasks 3–14; class contracts (`data-reveal`, `.mask-inner`, `.letter`, `.cs-*`, `.hw-list`) match between producer and consumer tasks. ✓
