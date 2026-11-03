// Modal compartilhado para tocar vídeos do YouTube embutidos na própria
// página (em vez de abrir uma nova aba). Exposto como window.openVideoModal.
(function () {
  const modal = document.querySelector("[data-video-modal]");
  if (!modal) return;

  const iframe = modal.querySelector("[data-video-modal-iframe]");
  const closeButtons = modal.querySelectorAll("[data-video-modal-close]");

  function extractYoutubeId(input) {
    if (!input) return "";
    if (!/^https?:\/\//.test(input)) return input; // já é um ID puro
    const match = input.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : "";
  }

  function openVideoModal(videoIdOrUrl) {
    const id = extractYoutubeId(videoIdOrUrl);
    if (!id || !iframe) return;
    iframe.src = "https://www.youtube.com/embed/" + id + "?autoplay=1&rel=0";
    modal.hidden = false;
    requestAnimationFrame(function () {
      modal.classList.add("is-open");
    });
    document.body.style.overflow = "hidden";
  }

  function closeVideoModal() {
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
    setTimeout(function () {
      modal.hidden = true;
      if (iframe) iframe.src = ""; // para o vídeo ao fechar
    }, 250);
  }

  closeButtons.forEach(function (btn) {
    btn.addEventListener("click", closeVideoModal);
  });

  // Qualquer elemento com data-open-video-modal="<id ou URL do YouTube>"
  // abre o modal automaticamente, sem precisar de JS extra por seção.
  document.querySelectorAll("[data-open-video-modal]").forEach(function (trigger) {
    trigger.addEventListener("click", function (event) {
      event.preventDefault();
      openVideoModal(trigger.getAttribute("data-open-video-modal"));
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !modal.hidden) closeVideoModal();
  });

  window.openVideoModal = openVideoModal;
  window.closeVideoModal = closeVideoModal;
})();
