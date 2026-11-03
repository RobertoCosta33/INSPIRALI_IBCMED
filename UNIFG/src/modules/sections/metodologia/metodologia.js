// Controla a abertura/fechamento dos itens de "Disclosure" da Metodologia.
// Escopado ao próprio container para não interferir com outros accordions
// da página (ex.: FAQ e contato), que têm seu próprio script.
(function () {
  const container = document.querySelector(".methodology");
  if (!container) return;
  const items = container.querySelectorAll("[data-accordion-item]");

  items.forEach(function (item) {
    const trigger = item.querySelector("[data-accordion-trigger]");
    const panel = item.querySelector("[data-accordion-panel]");
    if (!trigger || !panel) return;

    trigger.addEventListener("click", function () {
      const isOpen = item.classList.contains("is-open");

      items.forEach(function (other) {
        if (other !== item) {
          other.classList.remove("is-open");
          const otherTrigger = other.querySelector("[data-accordion-trigger]");
          if (otherTrigger) otherTrigger.setAttribute("aria-expanded", "false");
        }
      });

      item.classList.toggle("is-open", !isOpen);
      trigger.setAttribute("aria-expanded", String(!isOpen));
    });
  });
})();
