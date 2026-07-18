/* Entry point: wire up every animation system once the DOM exists. */
document.addEventListener('DOMContentLoaded', () => {
  initCascade();
  initReveals();
  initScrub();
  initProjectPills();
  initLongShadow();
  initWatermark();
  initDotGrid();
  initSheets();
  initCurtain();

  // #6 Smooth scroll — the only external library, added last.
  // Lenis eases the wheel input into a weighted glide; native scroll
  // events still fire, so every scroll-driven system above keeps working.
  if (!REDUCE_MOTION && typeof Lenis !== 'undefined') {
    const lenis = new Lenis();
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // CSS smooth scroll is gone (it fought Lenis), so glide anchor
    // jumps — the bookmark tabs — through Lenis instead.
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const href = a.getAttribute('href');
      // bare "#" (placeholder links): querySelector('#') would THROW
      if (href.length < 2) { e.preventDefault(); return; }
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      // Scroll to the target's SHEET flow-top (stashed by initSheets), not
      // the element: inside a sticky sheet, element.offsetTop is ~0, so
      // lenis.scrollTo(element) barely moves. A number is unambiguous.
      const container = target.closest('.sheet, .footer-pin');
      const y = container ? parseFloat(container.dataset.flowTop) : 0;
      lenis.scrollTo(y);
    });
  }
});
