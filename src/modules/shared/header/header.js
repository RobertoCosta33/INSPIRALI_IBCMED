// Header fixo: reserva no topo da página o espaço equivalente à altura
// real do header (institucional + navegação do curso), que varia por
// breakpoint, para o conteúdo não ficar escondido atrás dele.
(function () {
  const header = document.querySelector(".site-header");

  if (header) {
    const updateOffset = function () {
      document.body.style.paddingTop = header.offsetHeight + "px";
    };
    updateOffset();
    window.addEventListener("resize", updateOffset);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(updateOffset);
    }
  }
})();

// Alterna o menu de navegação institucional em telas pequenas.
(function () {
  const toggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-menu-nav]");

  if (!toggle || !nav) return;

  toggle.addEventListener("click", function () {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a, button").forEach(function (el) {
    el.addEventListener("click", function () {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
})();
