# Tuning Guide — how to adjust your portfolio

Everything on the site is controlled by a small number of "knobs." This guide
lists them by **what you want to change**, so you never have to hunt.

**The three files:**
- `index.html` — the content and structure (text, links, section order)
- `css/style.css` — everything visual (colours, sizes, spacing, layout)
- `js/animations.js` — the motion (each animation is one function with knobs at the top)

**The workflow:** edit → save → refresh the browser. No build step. If a change
doesn't show, hard-refresh (`Ctrl+Shift+R`) to beat the cache.

> Tip: in `css/style.css`, use `Ctrl+F` to jump to the `/* ==== SECTION ==== */`
> banner you want. In `js/animations.js`, search the function name (e.g. `initCamBox`).

---

## 1. Colours (change once, whole site follows)

`css/style.css`, very top, under `/* DESIGN TOKENS */`:

```css
--cream:         #F2EEE9;   /* page background / light text */
--ink:           #141414;   /* dark sections, body text */
--violet:        #2E2447;   /* the accent — footer, buttons, seams */
--violet-light:  #453768;   /* lighter accent — hovers */
--violet-shadow: #1B1530;   /* the long-shadow slab under your name */
--lavender:      #A99CC9;   /* soft violet — labels on dark */
```

Change `--violet` and the footer, seams, tabs, buttons, and cam dots all move
together. **This is the single most powerful edit on the site.**

---

## 2. Text & links (what it says)

All in `index.html`:

| What | Where to look |
|------|---------------|
| Your name (hero) | `<h1 class="hero-name">` — two `cascade-line` spans |
| Role / location / status | `.hero-role`, `.hero-meta` |
| Skills ticker | the `.marquee-track` spans (see §7 if it leaves a gap) |
| About bio + skill chips | `.about-body` paragraph + `.chips` list |
| The big dark statement | `.statement-text` |
| Project names/years/tags | the `.project-cell` blocks |
| Email / GitHub / LinkedIn / résumé | footer `.footer-links` |
| Case-study content | `projects/*.html` (each STAR block) |

---

## 3. The camera box (dot-matrix cam)

**Size** — `css/style.css`, search `.cam-box`:
```css
flex: 1 1 26rem;    /* how much space it wants */
max-width: 38rem;   /* biggest it can get — raise for a bigger box */
aspect-ratio: 4 / 3;/* shape; try 1 / 1 for a square, 16 / 9 for wide */
```

**The effect** — `js/animations.js`, search `initCamBox`:
```js
const CELL = 8;   // dot spacing in px. SMALLER = finer, more detailed image
```
Inside the `draw()` loop:
```js
const r = lum * CELL * .48;   // dot size vs brightness. Raise .48 for fatter dots
if (r < .4) continue;         // shadow cutoff. Raise to drop more dark dots
ctx.fillStyle = lum > .82 ? BRIGHT : MID;  // .82 = the cream/lavender split
```

Colours come from your tokens (`BRIGHT` = cream, `MID` = lavender), so §1 changes
carry into the camera automatically.

**Adding a NEW filter later — see §9. It's genuinely easy.**

---

## 4. Motion feel (speed & personality)

`js/animations.js` — each is at the top of its function:

| Feeling | Knob | Function | Now | Try |
|---------|------|----------|-----|-----|
| Name letters fly-in speed | `--i * 60ms` in CSS `.letter` | (css) | 60ms | 40 snappy / 100 dramatic |
| Your name jelly bounce | `STIFFNESS` / `DAMPING` | `initWatermark` | .12 / .72 | DAMPING .85 = jigglier |
| Name-rise stagger | `SPREAD` | `initWatermark` | .55 | .8 = slow rolling wave |
| Long-shadow length | `SHADOW_STEPS` | top of file | 40 | 70 = dramatic poster |
| Footer pin dead-zones | `LEAD_IN` / `LEAD_OUT` | `initWatermark` | .15 / .2 | bigger = more hold |
| Statement word-light timing | `CENTRE_START` / `CENTRE_END` | `initScrub` | .90 / .30 | see note below |
| Dot-grid bloom radius | `RADIUS` | `initDotGrid` | 120 | 200 = bigger bloom |
| Dot-grid density | `GAP` | `initDotGrid` | 28 | 20 = denser dots |

**Scroll smoothness** — `js/main.js`, search `new Lenis`:
```js
lerp: 0.07,             // LOWER = floatier/slower settle
wheelMultiplier: 0.8,   // LOWER = less distance per wheel tick
```

> `CENTRE_START` / `CENTRE_END` are "where on screen (top=0, bottom=1) the word-
> lighting begins and ends." `.90 → .30` means it lights up as the text travels
> from near the bottom to near the top.

---

## 5. Layout & spacing

| What | Where |
|------|-------|
| Side padding (whole site) | `--pad-x` token (top of CSS) |
| Section vertical padding | `section { padding: ... }` |
| Bookmark-tab spacing | `.tab` → `margin-right: ... var(--ti) * 6.6rem` |
| Stacking-sheet shadow | `.sheet-hero + .tab + .sheet { box-shadow ... }` |

---

## 6. Page transition (the violet curtain)

`css/style.css`, search `.curtain span`:
```css
transition: transform .7s cubic-bezier(.76, 0, .24, 1);  /* .7s = speed */
transition-delay: calc(var(--i) * 80ms);                 /* 80ms = ripple */
```
Panel count is in `js/animations.js` → `initCurtain` (`for (let i = 0; i < 5; i++)`).

---

## 7. Common fixes

- **Marquee leaves a gap on a wide screen:** each `.marquee-track` span must be
  wider than the screen. Add another copy of the phrase to **both** spans, and
  raise the `72s` in `.marquee-track` proportionally (keeps the pace).
- **Something animated looks offset from the cursor:** a `<canvas>` needs explicit
  `width:100%; height:100%` (not just `inset:0`). See `.cam-canvas` / `.dot-grid`.
- **A change won't show:** hard-refresh `Ctrl+Shift+R`.

---

## 8. Deploying updates

The site is static, so publishing is just pushing to GitHub:
```bash
git add -A
git commit -m "your message"
git push
```
GitHub Pages redeploys automatically. The camera needs HTTPS — Pages provides it,
so the cam works live even though it can't over plain `file://`.

---

## 9. Adding a new camera filter (your TouchDesigner effects)

**Yes — this is designed for it.** The camera already does the hard part (asks
permission, grabs frames, samples pixels). A filter is just "given this pixel
grid, draw something." Here's the whole recipe.

In `js/animations.js`, find the `draw()` function inside `initCamBox`. The dot
effect lives in the `for` loop after `const px = ...` (that `px` array is the
video, one RGBA pixel per grid cell). To add filters:

**Step 1 — make the current dot loop its own function:**
```js
function filterDots(ctx, px, cols, rows) {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = (y * cols + x) * 4;
      const lum = (px[i] * .299 + px[i+1] * .587 + px[i+2] * .114) / 255;
      const r = lum * CELL * .48;
      if (r < .4) continue;
      ctx.fillStyle = lum > .82 ? BRIGHT : MID;
      ctx.beginPath();
      ctx.arc(x*CELL + CELL/2, y*CELL + CELL/2, r, 0, 6.283);
      ctx.fill();
    }
  }
}
```

**Step 2 — write another filter the same shape.** Example: ASCII/blocks —
draw a filled square per cell instead of a dot, sized by brightness:
```js
function filterBlocks(ctx, px, cols, rows) {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = (y * cols + x) * 4;
      const lum = (px[i] * .299 + px[i+1] * .587 + px[i+2] * .114) / 255;
      const s = lum * CELL;                 // block size = brightness
      ctx.fillStyle = lum > .5 ? BRIGHT : MID;
      ctx.fillRect(x*CELL + (CELL-s)/2, y*CELL + (CELL-s)/2, s, s);
    }
  }
}
```
Or an **edge/outline** look — compare each pixel to its neighbour and draw only
where brightness jumps (that's a Sobel-style edge filter, the classic TD trick):
```js
function filterEdges(ctx, px, cols, rows) {
  for (let y = 0; y < rows; y++) {
    for (let x = 1; x < cols; x++) {
      const i = (y*cols + x) * 4, j = (y*cols + x-1) * 4;
      const a = px[i]*.299 + px[i+1]*.587 + px[i+2]*.114;
      const b = px[j]*.299 + px[j+1]*.587 + px[j+2]*.114;
      if (Math.abs(a - b) > 28) {           // 28 = edge sensitivity
        ctx.fillStyle = BRIGHT;
        ctx.fillRect(x*CELL, y*CELL, CELL, CELL);
      }
    }
  }
}
```

**Step 3 — pick which filter runs.** In `draw()`, replace the inline loop with a
call to whichever is active:
```js
ctx.clearRect(0, 0, canvas.width, canvas.height);
FILTERS[currentFilter](ctx, px, cols, rows);   // <- one line
```
and near the top of `initCamBox`:
```js
const FILTERS = { dots: filterDots, blocks: filterBlocks, edges: filterEdges };
let currentFilter = 'dots';
```

**Step 4 (optional) — a switch button.** Add a `<button class="cam-filter">`
next to "Enable camera" in `index.html`, then:
```js
box.querySelector('.cam-filter').addEventListener('click', () => {
  const names = Object.keys(FILTERS);
  currentFilter = names[(names.indexOf(currentFilter) + 1) % names.length];
});
```

That's it — each TouchDesigner effect you port becomes one `filterX(ctx, px, cols, rows)`
function. The camera plumbing never changes.

---

*Keep this file. When you present the site, §9 is proof you architected the camera
for extension — that's a senior instinct.*
