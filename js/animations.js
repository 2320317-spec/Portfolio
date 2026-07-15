/* ==================================================
   Animation systems. Each init*() finds its own
   elements and quietly does nothing if they're absent,
   so every page can load the same file.
   ================================================== */

const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- #1 Letter cascade ------------------------- */
/* Splits text into one <span class="letter"> per character,
   grouped inside per-word wrappers. Why wrappers: bare inline-block
   letters destroy natural text behavior — spaces collapse to zero
   width and lines can break mid-word. Word wrappers restore both:
   unbreakable words, real spaces between them.
   Each letter gets --i (its index) so CSS can stagger delays. */
function splitLetters(el) {
  const words = el.textContent.trim().split(/\s+/);
  el.textContent = '';
  let letterIndex = 0;
  words.forEach((word, w) => {
    const wordSpan = document.createElement('span');
    wordSpan.className = 'word-wrap';
    [...word].forEach(ch => {
      const span = document.createElement('span');
      span.className = 'letter';
      span.style.setProperty('--i', letterIndex++);
      span.textContent = ch;
      wordSpan.appendChild(span);
    });
    el.appendChild(wordSpan);
    if (w < words.length - 1) el.appendChild(document.createTextNode(' '));
  });
}

function initCascade() {
  if (REDUCE_MOTION) return; // text stays visible, no animation
  document.querySelectorAll('[data-cascade] .cascade-line').forEach(splitLetters);
}

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

/* ---- Long shadow (footer watermark) ------------- */
/* A "long shadow" is just N copies of the glyph, each nudged one step
   further down-right, welded into a solid slab. CSS has no loops, so
   we build the value here. Steps are in `em` so the shadow scales with
   the responsive font size instead of dwarfing the text on phones. */
const SHADOW_STEPS = 40;      // knob: more steps = longer slab
const SHADOW_STEP_EM = 0.01;  // knob: 40 x 0.01em = 0.4em of shadow

function buildLongShadow(steps, stepEm, color) {
  const parts = [];
  for (let i = 1; i <= steps; i++) {
    const offset = (i * stepEm).toFixed(3) + 'em';
    parts.push(`${offset} ${offset} 0 ${color}`);
  }
  return parts.join(', ');
}

function initLongShadow() {
  const el = document.getElementById('watermark');
  if (!el) return;
  el.style.setProperty('--long-shadow',
    buildLongShadow(SHADOW_STEPS, SHADOW_STEP_EM, 'var(--violet-shadow)'));
  // Publish how far the slab reaches so the CSS below can reserve room
  // for it. One source of truth: retune the knobs and spacing follows.
  el.style.setProperty('--shadow-reach', (SHADOW_STEPS * SHADOW_STEP_EM).toFixed(3) + 'em');
}

/* ---- #9 Watermark: ground extrusion + proximity jelly ---- */
/* The ground IS the background. At rest a letter lies flat in it:
   face painted the background color (camouflaged), zero shadow — flat
   things cast no shadow. Scroll extrudes it: the face travels up-left
   along the shadow axis while the shadow grows step by step beneath
   it, always bridging face -> ground. The lengthening shadow is what
   sells the rise.
   Each letter carries two springs:
     sprout — scroll-driven extrusion height (0 flat .. 1 risen)
     hover  — the mouse jelly zoom
   Neither input ever sets a style directly: they set TARGETS, and the
   frame loop integrates physics toward them. That's why letters
   overshoot, wobble, and settle instead of gliding.
   User-approved tuning — do not change without asking Myke:
   MAX 0.18, RADIUS 170, lift 4px. Jelly knobs: STIFFNESS, DAMPING. */
function initWatermark() {
  const el = document.getElementById('watermark');
  if (!el) return;
  splitLetters(el); // reuse the Task 3 splitter
  const letters = [...el.querySelectorAll('.letter')];
  // No JS motion => CSS defaults: home position, lit face, full slab
  // (inherited from .watermark). The name is never lost to a failure.
  if (!letters.length || REDUCE_MOTION) return;

  const RADIUS = 170;
  const MAX = 0.18;
  const STIFFNESS = 0.12; // spring pull: higher = snappier
  const DAMPING = 0.72;   // friction: lower = wobblier jelly
  const SPREAD = 0.55;    // knob: share of the scroll window spent staggering

  // One shadow string per possible height, shared by every letter:
  // SHADOWS[0] = flat in the ground .. SHADOWS[40] = fully extruded.
  // Built past 40 as well: when a spring overshoots, the letter stands
  // taller than its resting height and must cast a LONGER shadow, or the
  // slab's far end lifts off the ground point and the bounce reads as a
  // glitch instead of a bounce.
  const MAX_SHADOW_IDX = Math.round(SHADOW_STEPS * 1.3);
  const SHADOWS = ['none'];
  for (let k = 1; k <= MAX_SHADOW_IDX; k++) {
    SHADOWS.push(buildLongShadow(k, SHADOW_STEP_EM, 'var(--violet-shadow)'));
  }

  // Face color ramp: read the tokens so a future palette change can't
  // silently break the camouflage.
  const readToken = (name) => {
    const hex = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  };
  const GROUND = readToken('--violet');       // face color when flat
  const LIT = readToken('--violet-light');    // face color when risen
  const faceColor = (p) =>
    'rgb(' + GROUND.map((g, i) => Math.round(g + (LIT[i] - g) * p)).join(',') + ')';

  // Cache letter centers in page coordinates. Transforms don't move
  // layout, but they DO skew getBoundingClientRect — so clear them
  // while measuring, then put them back.
  let centers = [], reachPx = 0;
  function measure() {
    const saved = letters.map(l => l.style.transform);
    letters.forEach(l => { l.style.transform = 'none'; });
    centers = letters.map(l => {
      const r = l.getBoundingClientRect();
      return r.left + r.width / 2 + window.scrollX;
    });
    reachPx = SHADOW_STEPS * SHADOW_STEP_EM * parseFloat(getComputedStyle(el).fontSize);
    letters.forEach((l, i) => { l.style.transform = saved[i]; });
  }
  measure();
  window.addEventListener('resize', measure);

  // Two springs per letter. c = current value, v = velocity.
  const springs = letters.map(() => ({
    sprout: { c: 0, v: 0, target: 0 },
    hover:  { c: 0, v: 0, target: 0 },
    shadowIdx: -1
  }));

  function paint(i) {
    const s = springs[i];
    const c = s.sprout.c;                         // may overshoot past 1
    const off = (1 - c) * reachPx;                // face: reach => flat, 0 => home
    const grow = 1 + MAX * s.hover.c * s.hover.c; // jelly bump
    const lift = -4 * s.hover.c;                  // jelly's little hop
    letters[i].style.transform =
      `translate(${off.toFixed(1)}px, ${(off + lift).toFixed(1)}px) scale(${grow.toFixed(3)})`;
    // Shadow tracks the SAME unclamped height as the face, so
    // face offset + shadow length always == reach: the slab's far end
    // stays welded to the ground point even mid-bounce.
    const idx = Math.min(MAX_SHADOW_IDX, Math.max(0, Math.round(c * SHADOW_STEPS)));
    if (idx !== s.shadowIdx) { // rebuild strings only when the height changes
      s.shadowIdx = idx;
      letters[i].style.textShadow = SHADOWS[idx];
      letters[i].style.color = faceColor(Math.min(1, Math.max(0, c)));
    }
  }
  letters.forEach((_, i) => paint(i)); // ground state before the first frame

  let rafId = null;

  function step(sp) {
    sp.v += (sp.target - sp.c) * STIFFNESS; // spring force
    sp.v *= DAMPING;                        // friction
    sp.c += sp.v;
    return Math.abs(sp.v) > 0.0005 || Math.abs(sp.target - sp.c) > 0.0005;
  }

  function tick() {
    let active = false;
    springs.forEach((s, i) => {
      if (step(s.sprout)) active = true;
      if (step(s.hover)) active = true;
      paint(i);
    });
    rafId = active ? requestAnimationFrame(tick) : null; // sleep when settled
  }
  function wake() { if (rafId === null) rafId = requestAnimationFrame(tick); }

  // SCROLL sets sprout targets, staggered so letters break ground in
  // sequence (same measure -> normalize -> map recipe as the scrub).
  // Progress comes from the PIN's travel, not the watermark's position:
  // while pinned the watermark doesn't move at all, so its own rect would
  // read the same number forever.
  const pin = el.closest('.footer-pin');
  const footer = el.closest('.site-footer');
  // Dead zones at both ends of the pin's travel. Without them the rise
  // starts on the same pixel the pin locks and ends near the release, so
  // scroll jitter at either edge makes the letters twitch. Knobs:
  const LEAD_IN = 0.15;   // frozen beat after locking, before anything moves
  const LEAD_OUT = 0.2;   // frozen beat once the name is fully up
  const SPAN = 1 - LEAD_IN - LEAD_OUT; // the slice that actually animates

  function onScroll() {
    // travel = how far the wrapper scrolls while the footer stays stuck
    const travel = pin && footer ? pin.offsetHeight - footer.offsetHeight : 0;
    let progress;
    if (travel > 0) {
      const raw = -pin.getBoundingClientRect().top / travel; // 0..1 across the pin
      progress = Math.min(1, Math.max(0, (raw - LEAD_IN) / SPAN));
    } else {
      // No room to pin (very short viewport): fall back to a plain reveal
      // as the watermark enters the screen, so the name still comes up.
      const vh = window.innerHeight;
      progress = Math.min(1, Math.max(0, (vh - el.getBoundingClientRect().top) / (vh * 0.55)));
    }
    const n = letters.length;
    springs.forEach((s, i) => {
      const start = n > 1 ? (i / (n - 1)) * SPREAD : 0; // this letter's turn
      const local = (progress - start) / (1 - SPREAD);  // its own 0..1
      s.sprout.target = Math.min(1, Math.max(0, local));
    });
    wake();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // MOUSE sets hover targets — only where hovering exists.
  if (window.matchMedia('(hover: hover)').matches) {
    el.addEventListener('mousemove', (e) => {
      springs.forEach((s, i) => {
        const dist = Math.abs(e.pageX - centers[i]);
        s.hover.target = Math.max(0, 1 - dist / RADIUS);
      });
      wake();
    });
    el.addEventListener('mouseleave', () => {
      springs.forEach(s => { s.hover.target = 0; });
      wake();
    });
  }
}

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
