// Controla grupos de abas simples: "Processo seletivo" e a
// "Matriz Curricular em Espiral" (unidades de aprendizagem).
(function () {
  document.querySelectorAll("[data-tabs]").forEach(function (group) {
    const tabs = group.querySelectorAll("[data-tab]");
    const panels = group.querySelectorAll("[data-tab-panel]");

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        const target = tab.getAttribute("data-tab");

        tabs.forEach(function (t) {
          t.classList.toggle("is-active", t === tab);
        });

        panels.forEach(function (panel) {
          const isMatch = panel.getAttribute("data-tab-panel") === target;
          panel.hidden = !isMatch;
        });
      });
    });
  });

  // Modal "Processo Seletivo Medicina" — lista de editais por forma de
  // ingresso, aberto pelos links "Consultar Edital".
  const modal = document.querySelector("[data-edital-modal]");
  if (modal) {
    const openTriggers = document.querySelectorAll("[data-open-edital-modal]");
    const closeTriggers = modal.querySelectorAll("[data-edital-modal-close]");

    function openModal(event) {
      if (event) event.preventDefault();
      modal.hidden = false;
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      requestAnimationFrame(function () {
        modal.classList.add("is-open");
      });
    }

    function closeModal() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      setTimeout(function () {
        modal.hidden = true;
      }, 250);
    }

    openTriggers.forEach(function (trigger) {
      trigger.addEventListener("click", openModal);
    });
    closeTriggers.forEach(function (trigger) {
      trigger.addEventListener("click", closeModal);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !modal.hidden) closeModal();
    });

    modal.querySelectorAll("[data-accordion-item]").forEach(function (item) {
      const trigger = item.querySelector("[data-accordion-trigger]");
      trigger.addEventListener("click", function () {
        const isOpen = item.classList.toggle("is-open");
        trigger.setAttribute("aria-expanded", String(isOpen));
      });
    });
  }
})();
