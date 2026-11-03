// Widget flutuante de contato: "Ligue já!" e "Tem alguma dúvida?" abrem um
// painel próprio; clicar fora, no X, ou em Escape fecha. O WhatsApp é um
// link direto, sem painel.
(function () {
  const root = document.querySelector("[data-floating-contact]");
  if (!root) return;

  const triggers = root.querySelectorAll("[data-floating-trigger]");
  const panels = root.querySelectorAll("[data-floating-panel]");
  const items = root.querySelectorAll(".floating-contact__item");
  const closeButtons = root.querySelectorAll("[data-floating-close]");

  function closeAll() {
    panels.forEach(function (panel) {
      panel.classList.remove("is-open");
      panel.hidden = true;
    });
    items.forEach(function (item) {
      item.classList.remove("is-active");
    });
  }

  function openPanel(key) {
    panels.forEach(function (panel) {
      const isMatch = panel.getAttribute("data-floating-panel") === key;
      if (isMatch) {
        panel.hidden = false;
        requestAnimationFrame(function () {
          panel.classList.add("is-open");
        });
      } else {
        panel.classList.remove("is-open");
        panel.hidden = true;
      }
    });
    items.forEach(function (item) {
      const hasMatch = !!item.querySelector('[data-floating-panel="' + key + '"]');
      item.classList.toggle("is-active", hasMatch);
    });
  }

  triggers.forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      const key = trigger.getAttribute("data-floating-trigger");
      const panel = root.querySelector('[data-floating-panel="' + key + '"]');
      const isOpen = panel && panel.classList.contains("is-open");
      closeAll();
      if (!isOpen) openPanel(key);
    });
  });

  closeButtons.forEach(function (button) {
    button.addEventListener("click", closeAll);
  });

  document.addEventListener("click", function (event) {
    if (!root.contains(event.target)) closeAll();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeAll();
  });
})();
