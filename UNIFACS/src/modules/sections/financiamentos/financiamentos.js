// Carrossel do valor de investimento mensal — a UNA só tem uma unidade (um
// único slide, sem indicadores), então este script fica praticamente
// inerte aqui; mantido igual à UAM para caso uma 2ª unidade seja
// adicionada no futuro. A UNA também não tem o modal "Programa Bolsa
// Permanência" (Figma não mostra esse card para esta instituição).
(function () {
  document.querySelectorAll("[data-financing-carousel]").forEach(function (root) {
    const slides = root.querySelectorAll("[data-financing-slide]");
    const dots = root.querySelectorAll("[data-financing-dot]");
    const card = root.querySelector(".financing-highlight");
    let index = 0;

    function show(newIndex) {
      index = (newIndex + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        const isActive = i === index;
        slide.classList.toggle("is-active", isActive);
        slide.hidden = false;
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () { show(i); });
    });

    // Arrastar (swipe) sobre o card para trocar de unidade.
    if (card) {
      let startX = null;

      card.addEventListener("touchstart", function (event) {
        startX = event.touches[0].clientX;
      }, { passive: true });

      card.addEventListener("touchend", function (event) {
        if (startX === null) return;
        const deltaX = event.changedTouches[0].clientX - startX;
        if (Math.abs(deltaX) > 40) {
          show(index + (deltaX < 0 ? 1 : -1));
        }
        startX = null;
      });
    }
  });
})();
