// Carrossel do valor de investimento mensal (Mooca / Piracicaba / São José dos
// Campos). Clique nas barrinhas abaixo do valor para trocar de unidade. No
// mobile/touch também é possível arrastar (swipe) sobre o card.
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
