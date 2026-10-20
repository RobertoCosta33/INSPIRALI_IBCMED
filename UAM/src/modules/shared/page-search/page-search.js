// Busca "Ctrl+F" dentro da página, usando a lib mark.js para destacar
// correspondências parciais em todo o <main> e navegar entre elas.
(function () {
  const trigger = document.querySelector("[data-search-trigger]");
  const panel = document.querySelector("[data-page-search]");
  if (!trigger || !panel || typeof Mark === "undefined") return;

  const input = panel.querySelector("[data-page-search-input]");
  const countEl = panel.querySelector("[data-page-search-count]");
  const prevBtn = panel.querySelector("[data-page-search-prev]");
  const nextBtn = panel.querySelector("[data-page-search-next]");
  const closeBtn = panel.querySelector("[data-page-search-close]");
  const scope = document.querySelector("main") || document.body;
  const markInstance = new Mark(scope);

  let matches = [];
  let currentIndex = -1;

  function clear(callback) {
    markInstance.unmark({ done: callback });
  }

  // Considera "visível" um trecho que não está dentro de uma aba/painel/slide
  // escondido no momento (display:none, visibility:hidden, opacity:0 ou
  // atributo [hidden]) — evita contar/navegar para texto duplicado que existe
  // no HTML mas não está sendo exibido (ex.: outras abas da matriz curricular,
  // outros slides do carrossel de financiamento).
  function isVisible(el) {
    let node = el;
    while (node && node !== scope.parentElement) {
      if (node.hidden) return false;
      const style = window.getComputedStyle(node);
      if (style.display === "none" || style.visibility === "hidden" || parseFloat(style.opacity) === 0) {
        return false;
      }
      node = node.parentElement;
    }
    return true;
  }

  function updateCount() {
    countEl.textContent = matches.length ? (currentIndex + 1) + "/" + matches.length : "0/0";
  }

  function focusCurrent() {
    matches.forEach(function (el) { el.classList.remove("is-current"); });
    const el = matches[currentIndex];
    if (!el) return;
    el.classList.add("is-current");
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function search(term) {
    clear(function () {
      matches = [];
      currentIndex = -1;
      updateCount();

      if (!term.trim()) return;

      markInstance.mark(term, {
        className: "page-search-highlight",
        accuracy: "partially",
        separateWordSearch: false,
        diacritics: true,
        done: function () {
          matches = Array.prototype.slice
            .call(scope.querySelectorAll(".page-search-highlight"))
            .filter(isVisible);
          if (matches.length) {
            currentIndex = 0;
            focusCurrent();
          }
          updateCount();
        },
      });
    });
  }

  function goTo(delta) {
    if (!matches.length) return;
    currentIndex = (currentIndex + delta + matches.length) % matches.length;
    focusCurrent();
    updateCount();
  }

  function openSearch() {
    panel.hidden = false;
    requestAnimationFrame(function () {
      panel.classList.add("is-open");
      input.focus();
    });
  }

  function closeSearch() {
    panel.classList.remove("is-open");
    clear();
    matches = [];
    currentIndex = -1;
    input.value = "";
    updateCount();
    setTimeout(function () { panel.hidden = true; }, 250);
  }

  trigger.addEventListener("click", function () {
    if (panel.classList.contains("is-open")) {
      closeSearch();
    } else {
      openSearch();
    }
  });

  closeBtn.addEventListener("click", closeSearch);
  input.addEventListener("input", function () { search(input.value); });
  nextBtn.addEventListener("click", function () { goTo(1); });
  prevBtn.addEventListener("click", function () { goTo(-1); });

  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      goTo(event.shiftKey ? -1 : 1);
    } else if (event.key === "Escape") {
      closeSearch();
    }
  });

  document.addEventListener("keydown", function (event) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openSearch();
    }
  });
})();
