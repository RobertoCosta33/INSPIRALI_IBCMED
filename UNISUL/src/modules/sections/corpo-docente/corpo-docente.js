// Carrossel de coordenadores (Corpo docente) — navega por página de cards
// e sincroniza os indicadores (steps) com a posição do scroll.
(function () {
  const carousel = document.querySelector("[data-docente-carousel]");
  if (!carousel) return;

  const track = carousel.querySelector("[data-docente-track]");
  const prevBtn = carousel.querySelector("[data-docente-prev]");
  const nextBtn = carousel.querySelector("[data-docente-next]");
  const steps = carousel.querySelectorAll("[data-docente-step]");

  function scrollByPage(direction) {
    track.scrollBy({ left: direction * track.clientWidth, behavior: "smooth" });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (prevBtn.getAttribute("aria-disabled") === "true") return;
      scrollByPage(-1);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (nextBtn.getAttribute("aria-disabled") === "true") return;
      scrollByPage(1);
    });
  }

  function updateSteps() {
    const maxScroll = track.scrollWidth - track.clientWidth;
    const progress = maxScroll > 0 ? track.scrollLeft / maxScroll : 0;
    const activeIndex = Math.min(steps.length - 1, Math.round(progress * (steps.length - 1)));
    steps.forEach((step, index) => step.classList.toggle("is-active", index === activeIndex));

    const atStart = maxScroll <= 0 || track.scrollLeft <= 1;
    const atEnd = maxScroll <= 0 || track.scrollLeft >= maxScroll - 1;
    if (prevBtn) prevBtn.setAttribute("aria-disabled", String(atStart));
    if (nextBtn) nextBtn.setAttribute("aria-disabled", String(atEnd));
  }

  track.addEventListener("scroll", updateSteps);
  updateSteps();

  // Modal "Ver mais": mostra a foto e a bio completa do coordenador,
  // lendo os dados diretamente do card clicado (sem duplicar conteúdo).
  const modal = document.querySelector("[data-docente-modal]");
  if (modal) {
    const modalPhoto = modal.querySelector("[data-docente-modal-photo]");
    const modalName = modal.querySelector("[data-docente-modal-name]");
    const modalRole = modal.querySelector("[data-docente-modal-role]");
    const modalBio = modal.querySelector("[data-docente-modal-bio]");

    function openDocenteModal(card) {
      const photo = card.querySelector(".docente-card__photo");
      const name = card.querySelector(".docente-card__name");
      const role = card.querySelector(".docente-card__role");
      const bio = card.querySelector(".docente-card__bio");

      if (modalPhoto && photo) {
        modalPhoto.src = photo.src;
        modalPhoto.alt = photo.alt;
      }
      if (modalName && name) modalName.textContent = name.textContent.trim();
      if (modalRole && role) modalRole.textContent = role.textContent.trim();
      if (modalBio && bio) modalBio.textContent = bio.textContent.trim();

      modal.hidden = false;
      requestAnimationFrame(() => modal.classList.add("is-open"));
      document.body.style.overflow = "hidden";
    }

    function closeDocenteModal() {
      modal.classList.remove("is-open");
      document.body.style.overflow = "";
      setTimeout(() => { modal.hidden = true; }, 250);
    }

    carousel.querySelectorAll("[data-docente-more]").forEach(function (button) {
      button.addEventListener("click", function () {
        const card = button.closest(".docente-card");
        if (card) openDocenteModal(card);
      });
    });

    modal.querySelectorAll("[data-docente-modal-close]").forEach(function (el) {
      el.addEventListener("click", closeDocenteModal);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !modal.hidden) closeDocenteModal();
    });
  }
})();
