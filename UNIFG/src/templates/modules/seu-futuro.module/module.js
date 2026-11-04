// Carrossel de slide único com indicadores (Ecossistema de prática)
// e carrossel horizontal de cartões (Seu Futuro na Medicina).
(function () {
  document.querySelectorAll("[data-evidence-carousel]").forEach(function (root) {
    const slides = root.querySelectorAll("[data-evidence-slide]");
    const dots = root.querySelectorAll("[data-evidence-dot]");
    const prevBtn = root.querySelector("[data-evidence-prev]");
    const nextBtn = root.querySelector("[data-evidence-next]");
    const viewport = root.querySelector(".evidence-carousel__viewport");
    let index = 0;

    function show(newIndex) {
      index = (newIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    if (prevBtn) prevBtn.addEventListener("click", function () { show(index - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { show(index + 1); });
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () { show(i); });
    });

    // Arrastar (swipe) sobre o slide para trocar, no mobile/tablet.
    if (viewport) {
      let touchStartX = null;

      viewport.addEventListener("touchstart", function (event) {
        touchStartX = event.touches[0].clientX;
      }, { passive: true });

      viewport.addEventListener("touchend", function (event) {
        if (touchStartX === null) return;
        const deltaX = event.changedTouches[0].clientX - touchStartX;
        if (Math.abs(deltaX) > 40) {
          show(index + (deltaX < 0 ? 1 : -1));
        }
        touchStartX = null;
      });
    }
  });

  document.querySelectorAll("[data-card-carousel]").forEach(function (root) {
    const track = root.querySelector("[data-card-track]");
    const prevBtn = root.querySelector("[data-card-prev]");
    const nextBtn = root.querySelector("[data-card-next]");
    const prevIcon = prevBtn ? prevBtn.querySelector("img") : null;
    const nextIcon = nextBtn ? nextBtn.querySelector("img") : null;
    const dots = root.querySelectorAll(".card-carousel__dot");
    if (!track) return;

    const ICONS = window.UNIFG_CARD_NAV_ICONS || {};
    let dotIndex = 0;
    const EDGE_TOLERANCE = 2; // px de folga para evitar problemas de arredondamento

    function isAtStart() {
      return track.scrollLeft <= EDGE_TOLERANCE;
    }

    function isAtEnd() {
      const maxScroll = track.scrollWidth - track.clientWidth;
      return track.scrollLeft >= maxScroll - EDGE_TOLERANCE;
    }

    // "Anterior" fica de fato desabilitado (não clicável, sem dar a volta
    // para o último cartão) só no primeiro cartão. "Próximo" nunca desabilita
    // — ao chegar no último cartão, volta para o primeiro (loop).
    function updateNavState() {
      const atStart = isAtStart();

      if (prevBtn) {
        prevBtn.classList.toggle("card-carousel__nav-btn--active", !atStart);
        prevBtn.disabled = atStart;
        if (prevIcon && ICONS.prevActive) prevIcon.src = atStart ? ICONS.prevInactive : ICONS.prevActive;
      }
      if (nextBtn) {
        nextBtn.classList.add("card-carousel__nav-btn--active");
        nextBtn.disabled = false;
        if (nextIcon && ICONS.nextActive) nextIcon.src = ICONS.nextActive;
      }
    }

    function updateDots(direction) {
      if (!dots.length) return;
      dotIndex = (dotIndex + direction + dots.length) % dots.length;
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === dotIndex);
      });
    }

    function scrollByCard(direction) {
      // "Próximo" no último cartão dá a volta para o primeiro, em vez de
      // tentar rolar além do fim (o que não faria nada visualmente).
      if (direction > 0 && isAtEnd()) {
        track.scrollTo({ left: 0, behavior: "smooth" });
        updateDots(1);
        return;
      }
      const card = track.querySelector(":scope > *");
      const amount = card ? card.getBoundingClientRect().width + 16 : 300;
      track.scrollBy({ left: direction * amount, behavior: "smooth" });
      updateDots(direction);
    }

    if (prevBtn) prevBtn.addEventListener("click", function () { scrollByCard(-1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { scrollByCard(1); });
    track.addEventListener("scroll", updateNavState);
    updateNavState();
  });
})();
