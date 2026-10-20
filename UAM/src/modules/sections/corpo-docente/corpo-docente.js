// Carrossel de coordenadores (Corpo docente) — navega por página de cards
// e sincroniza os indicadores (steps) com a posição do scroll.
(function () {
  const carousel = document.querySelector("[data-docente-carousel]");
  if (!carousel) return;

  const track = carousel.querySelector("[data-docente-track]");
  const prevBtn = carousel.querySelector("[data-docente-prev]");
  const nextBtn = carousel.querySelector("[data-docente-next]");
  const steps = carousel.querySelectorAll("[data-docente-step]");

  function scrollByPage(direction) {
    track.scrollBy({ left: direction * track.clientWidth, behavior: "smooth" });
  }

  if (prevBtn) prevBtn.addEventListener("click", () => scrollByPage(-1));
  if (nextBtn) nextBtn.addEventListener("click", () => scrollByPage(1));

  function updateSteps() {
    const maxScroll = track.scrollWidth - track.clientWidth;
    const progress = maxScroll > 0 ? track.scrollLeft / maxScroll : 0;
    const activeIndex = Math.min(steps.length - 1, Math.round(progress * (steps.length - 1)));
    steps.forEach((step, index) => step.classList.toggle("is-active", index === activeIndex));
  }

  track.addEventListener("scroll", updateSteps);
  updateSteps();
})();
