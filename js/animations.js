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
  const STEPS = 40;        // knob: more steps = longer slab
  const STEP_EM = 0.01;    // knob: 40 x 0.01em = 0.4em of shadow

  el.style.setProperty('--long-shadow', buildLongShadow(STEPS, STEP_EM, 'var(--violet-shadow)'));
  // Publish how far the slab reaches so the CSS below can reserve room
  // for it. One source of truth: retune the knobs and spacing follows.
  el.style.setProperty('--shadow-reach', (STEPS * STEP_EM).toFixed(3) + 'em');
}

/* ---- #9 Proximity letter zoom (footer watermark) ---- */
/* Jelly edition: each letter is a spring. The mouse only sets
   TARGETS; a frame loop integrates spring physics toward them,
   so letters overshoot, wobble, and settle like jelly.
   User-approved tuning — do not change without asking Myke:
   MAX 0.18, RADIUS 170, lift 4px. Jelly knobs: STIFFNESS, DAMPING. */
function initLetterZoom() {
  const el = document.getElementById('watermark');
  if (!el) return;
  splitLetters(el); // reuse the Task 3 splitter
  if (REDUCE_MOTION || !window.matchMedia('(hover: hover)').matches) return;

  const letters = [...el.querySelectorAll('.letter')];
  const RADIUS = 170;
  const MAX = 0.18;
  const STIFFNESS = 0.12; // spring pull: higher = snappier
  const DAMPING = 0.72;   // friction: lower = wobblier jelly

  // Cache letter centers in page coordinates (transforms don't move
  // layout, but they DO skew getBoundingClientRect — so measure once
  // at rest, and again on resize).
  let centers = [];
  function measure() {
    centers = letters.map(l => {
      const r = l.getBoundingClientRect();
      return r.left + r.width / 2 + window.scrollX;
    });
  }
  measure();
  window.addEventListener('resize', measure);

  // One spring per letter: c = current closeness, v = velocity.
  const springs = letters.map(() => ({ c: 0, v: 0, target: 0 }));
  let rafId = null;

  function tick() {
    let active = false;
    springs.forEach((sp, i) => {
      sp.v += (sp.target - sp.c) * STIFFNESS; // spring force
      sp.v *= DAMPING;                        // friction
      sp.c += sp.v;
      if (Math.abs(sp.v) > 0.0005 || Math.abs(sp.target - sp.c) > 0.0005) active = true;
      const scale = 1 + MAX * sp.c * sp.c;
      letters[i].style.transform =
        `scale(${scale.toFixed(3)}) translateY(${(-4 * sp.c).toFixed(1)}px)`;
    });
    rafId = active ? requestAnimationFrame(tick) : null; // sleep when settled
  }
  function wake() { if (rafId === null) rafId = requestAnimationFrame(tick); }

  el.addEventListener('mousemove', (e) => {
    letters.forEach((l, i) => {
      const dist = Math.abs(e.pageX - centers[i]);
      springs[i].target = Math.max(0, 1 - dist / RADIUS);
    });
    wake();
  });

  el.addEventListener('mouseleave', () => {
    springs.forEach(sp => { sp.target = 0; });
    wake();
  });
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
