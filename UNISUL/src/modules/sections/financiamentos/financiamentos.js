// Carrossel do valor de investimento mensal (Mooca / Piracicaba / São José dos
// Campos). Clique nas barrinhas abaixo do valor para trocar de unidade. No
// mobile/touch também é possível arrastar (swipe) sobre o card.
(function () {
  // Ícones das setas: cinza = desabilitada (não tem mais pra onde ir nesse
  // sentido), verde = habilitada. Na 1ª unidade a seta esquerda fica cinza;
  // na última, a direita; no meio, as duas ficam verdes.
  const PREV_ICON_ENABLED = "/UNISUL/src/public/icons/icon-chevron-left-financing-active.svg";
  const PREV_ICON_DISABLED = "/UNISUL/src/public/icons/icon-chevron-left-financing.svg";
  const NEXT_ICON_ENABLED = "/UNISUL/src/public/icons/icon-chevron-right-financing.svg";
  const NEXT_ICON_DISABLED = "/UNISUL/src/public/icons/icon-chevron-right-financing-disabled.svg";

  document.querySelectorAll("[data-financing-carousel]").forEach(function (root) {
    const slides = root.querySelectorAll("[data-financing-slide]");
    const dots = root.querySelectorAll("[data-financing-dot]");
    const prevBtn = root.querySelector("[data-financing-prev]");
    const nextBtn = root.querySelector("[data-financing-next]");
    const prevIcon = prevBtn ? prevBtn.querySelector("img") : null;
    const nextIcon = nextBtn ? nextBtn.querySelector("img") : null;
    const card = root.querySelector(".financing-highlight");
    let index = 0;

    function show(newIndex) {
      // Sem loop: na primeira unidade não dá pra voltar, na última não dá
      // pra avançar (diferente de outros carrosséis do site, que dão a
      // volta) — é o que a seta cinza/desabilitada comunica.
      index = Math.max(0, Math.min(newIndex, slides.length - 1));

      slides.forEach(function (slide, i) {
        const isActive = i === index;
        slide.classList.toggle("is-active", isActive);
        slide.hidden = false;
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });

      const isFirst = index === 0;
      const isLast = index === slides.length - 1;
      if (prevBtn) prevBtn.setAttribute("aria-disabled", String(isFirst));
      if (nextBtn) nextBtn.setAttribute("aria-disabled", String(isLast));
      if (prevIcon) prevIcon.src = isFirst ? PREV_ICON_DISABLED : PREV_ICON_ENABLED;
      if (nextIcon) nextIcon.src = isLast ? NEXT_ICON_DISABLED : NEXT_ICON_ENABLED;
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () { show(i); });
    });

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        if (prevBtn.getAttribute("aria-disabled") === "true") return;
        show(index - 1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        if (nextBtn.getAttribute("aria-disabled") === "true") return;
        show(index + 1);
      });
    }

    show(0);

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

  // Modal "Programa Bolsa Permanência" — lista de documentos necessários,
  // aberto pelo botão "Veja mais" do card.
  const bolsaModal = document.querySelector("[data-bolsa-modal]");
  if (bolsaModal) {
    const openTriggers = document.querySelectorAll("[data-open-bolsa-modal]");
    const closeTriggers = bolsaModal.querySelectorAll("[data-bolsa-modal-close]");

    function openBolsaModal(event) {
      if (event) event.preventDefault();
      bolsaModal.hidden = false;
      bolsaModal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      requestAnimationFrame(function () {
        bolsaModal.classList.add("is-open");
      });
    }

    function closeBolsaModal() {
      bolsaModal.classList.remove("is-open");
      bolsaModal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      setTimeout(function () {
        bolsaModal.hidden = true;
      }, 250);
    }

    openTriggers.forEach(function (trigger) {
      trigger.addEventListener("click", openBolsaModal);
    });
    closeTriggers.forEach(function (trigger) {
      trigger.addEventListener("click", closeBolsaModal);
    });
    bolsaModal.addEventListener("click", function (event) {
      if (event.target === bolsaModal) closeBolsaModal();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !bolsaModal.hidden) closeBolsaModal();
    });
  }
})();
