// Carrossel de slide único com indicadores (Ecossistema de prática)
// e carrossel horizontal de cartões (Seu Futuro na Medicina).
(function () {
  document.querySelectorAll("[data-evidence-carousel]").forEach(function (root) {
    const slides = root.querySelectorAll("[data-evidence-slide]");
    const dots = root.querySelectorAll("[data-evidence-dot]");
    const prevBtn = root.querySelector("[data-evidence-prev]");
    const nextBtn = root.querySelector("[data-evidence-next]");
    let index = 0;

    function show(newIndex) {
      index = (newIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    if (prevBtn) prevBtn.addEventListener("click", function () { show(index - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { show(index + 1); });
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () { show(i); });
    });
  });

  document.querySelectorAll("[data-card-carousel]").forEach(function (root) {
    const track = root.querySelector("[data-card-track]");
    const prevBtn = root.querySelector("[data-card-prev]");
    const nextBtn = root.querySelector("[data-card-next]");
    if (!track) return;

    function scrollByCard(direction) {
      const card = track.querySelector(":scope > *");
      const amount = card ? card.getBoundingClientRect().width + 16 : 300;
      track.scrollBy({ left: direction * amount, behavior: "smooth" });
    }

    if (prevBtn) prevBtn.addEventListener("click", function () { scrollByCard(-1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { scrollByCard(1); });
  });
})();
