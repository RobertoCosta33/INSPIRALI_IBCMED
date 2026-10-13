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
})();
