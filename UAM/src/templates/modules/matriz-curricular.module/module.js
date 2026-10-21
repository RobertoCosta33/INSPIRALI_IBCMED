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

  // Botão "Ver mais +" de cada unidade/período da Matriz Curricular:
  // revela os grupos de disciplinas extras (Integração ao SUS, Inovações em Medicina etc.).
  document.querySelectorAll("[data-unit-more]").forEach(function (button) {
    const panel = button.closest(".unit-panel");
    const extra = panel ? panel.querySelector("[data-unit-extra]") : null;
    if (!extra) return;

    button.addEventListener("click", function () {
      const isOpen = extra.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(isOpen));
      button.textContent = isOpen ? "Ver menos -" : "Ver mais +";
    });
  });
})();
