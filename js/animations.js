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

  // Measure the TEXT, not its section. The section is ~2.3x taller than
  // the text and the text sits centred inside it, so driving off the
  // section's top tracked a point ~360px above the thing being animated:
  // the whole sweep finished while the text was still below the fold.
  const CENTRE_START = 0.60; // text's middle just under the centre line -> begin
  const CENTRE_END = 0.25;   // ...risen to near the top -> fully lit

  function onScroll() {
    const rect = el.getBoundingClientRect();
    const mid = rect.top + rect.height / 2;
    const vh = window.innerHeight;
    const progress = Math.min(1, Math.max(0,
      (vh * CENTRE_START - mid) / (vh * (CENTRE_START - CENTRE_END))));
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

/* ---- Interactive dot grid (dark statement background) ---- */
/* ~1100 dots on one canvas. Near the cursor a dot "excites": it breaks
   from the grid and orbits its home point on a randomized tilted plane
   (a squashed + rotated ellipse — 2D faking 3D). Excitement eases with
   cursor distance, so the swarm blooms around the pointer and dots far
   away never move. Sleeps when everything is home. */
function initDotGrid() {
  const section = document.querySelector('.statement');
  if (!section || REDUCE_MOTION) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'dot-grid';
  canvas.setAttribute('aria-hidden', 'true');
  section.prepend(canvas);
  const ctx = canvas.getContext('2d');

  const GAP = 28;      // grid spacing
  const RADIUS = 120;  // cursor influence
  const DPR = Math.min(2, window.devicePixelRatio || 1);
  let dots = [], w = 0, h = 0;

  function build() {
    w = section.clientWidth; h = section.clientHeight;
    canvas.width = w * DPR; canvas.height = h * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    dots = [];
    for (let y = GAP; y < h; y += GAP)
      for (let x = GAP; x < w; x += GAP)
        dots.push({
          hx: x, hy: y,                  // home on the grid
          e: 0,                          // excitement 0..1
          th: Math.random() * 6.283,     // orbit angle
          r: 5 + Math.random() * 9,      // orbit size
          sq: .25 + Math.random() * .75, // inclination (ellipse squash)
          tilt: Math.random() * 6.283,   // orbit plane rotation
          w: (Math.random() < .5 ? -1 : 1) * (.02 + Math.random() * .04)
        });
    wake();
  }

  let mx = -1e4, my = -1e4, inside = false, rafId = null;

  function draw() {
    ctx.clearRect(0, 0, w, h);
    let active = inside;
    for (const d of dots) {
      const target = inside
        ? Math.max(0, 1 - Math.hypot(mx - d.hx, my - d.hy) / RADIUS) : 0;
      d.e += (target - d.e) * .08;       // ease toward excitement
      if (d.e > .004) { active = true; d.th += d.w; } else d.e = 0;
      // circle -> squash (inclination) -> rotate (plane) -> scale by e
      const ox = Math.cos(d.th) * d.r, oy = Math.sin(d.th) * d.r * d.sq;
      const px = d.hx + (ox * Math.cos(d.tilt) - oy * Math.sin(d.tilt)) * d.e;
      const py = d.hy + (ox * Math.sin(d.tilt) + oy * Math.cos(d.tilt)) * d.e;
      const b = Math.round(58 + 170 * d.e); // idle: faint; excited: bright
      ctx.fillStyle = `rgb(${b},${b},${b})`;
      ctx.beginPath();
      ctx.arc(px, py, 1 + d.e * .9, 0, 6.283);
      ctx.fill();
    }
    rafId = active ? requestAnimationFrame(draw) : null; // sleep at rest
  }
  function wake() { if (rafId === null) rafId = requestAnimationFrame(draw); }

  if (window.matchMedia('(hover: hover)').matches) {
    section.addEventListener('mousemove', (e) => {
      const rect = section.getBoundingClientRect();
      mx = e.clientX - rect.left; my = e.clientY - rect.top;
      inside = true; wake();
    });
    section.addEventListener('mouseleave', () => { inside = false; wake(); });
  }
  build();
  window.addEventListener('resize', build);
}

/* ---- Curtain page transition ---- */
/* Exit: intercept internal link clicks, drop the panels, THEN navigate.
   A sessionStorage flag tells the next page it arrived via curtain, so
   it starts covered and lets the panels fall away. Direct visits and
   reduced-motion users never see any of it. */
function initCurtain() {
  // Did the head script arm the pre-paint shield? Consume the flag and
  // make sure the shield always comes down, even on the early returns —
  // otherwise reduced-motion users would stare at violet forever.
  const arrived = sessionStorage.getItem('curtain') === '1';
  if (arrived) sessionStorage.removeItem('curtain');
  const unveil = () => document.documentElement.classList.remove('curtain-in');
  if (REDUCE_MOTION) { unveil(); return; }

  // Build the overlay here so no page needs extra HTML.
  const curtain = document.createElement('div');
  curtain.className = 'curtain';
  curtain.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 5; i++) {
    const s = document.createElement('span');
    s.style.setProperty('--i', i);
    curtain.appendChild(s);
  }
  document.body.appendChild(curtain);
  const last = curtain.lastElementChild; // finishes last (largest delay)

  // Jump the panels to a state with transitions off (for setup/resets).
  function setInstant(state) {
    curtain.className = 'curtain no-anim' + (state ? ' ' + state : '');
    curtain.offsetHeight; // force the browser to apply the jump now
    curtain.classList.remove('no-anim');
  }

  // ENTRY — arrived via a curtain exit: panels take over from the
  // shield (same violet, so the swap is invisible), then fall away.
  if (arrived) {
    setInstant('cover');
    unveil();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      curtain.classList.replace('cover', 'leave');
    }));
    last.addEventListener('transitionend', () => setInstant(), { once: true });
  } else {
    unveil(); // stale shield (e.g. flag consumed by an earlier load)
  }

  // EXIT — any same-site page link gets the curtain.
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;                  // external
    if (url.pathname === location.pathname && url.hash) return;  // same-page anchor
    e.preventDefault();
    sessionStorage.setItem('curtain', '1');
    curtain.classList.add('cover');
    last.addEventListener('transitionend', () => { location.href = a.href; }, { once: true });
  });

  // Back/forward restores the page from cache mid-cover: clear it.
  window.addEventListener('pageshow', (e) => { if (e.persisted) setInstant(); });
}
