/* Entry point: wire up every animation system once the DOM exists. */
document.addEventListener('DOMContentLoaded', () => {
  initCascade();
  initReveals();
  initScrub();
  initProjectPills();
  initLetterZoom();
});
