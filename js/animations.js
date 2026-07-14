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
