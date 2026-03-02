/**
 * social-carousel.js — Auto-rotating social proof testimonials
 *
 * Cycles through [data-social-item] elements every 3 seconds
 * using CSS opacity transitions (defined in HTML via Tailwind classes).
 */
(function () {
  const items = document.querySelectorAll("[data-social-item]");
  if (items.length < 2) return;

  let current = 0;

  setInterval(() => {
    items[current].classList.add("opacity-0");
    current = (current + 1) % items.length;
    items[current].classList.remove("opacity-0");
  }, 3000);
})();
