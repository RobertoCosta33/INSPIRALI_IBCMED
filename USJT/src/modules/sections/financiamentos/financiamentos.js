// Carrossel do valor de investimento mensal do campus USJT. aberto pelo botão "Veja mais" do card.
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
