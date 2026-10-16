// Carrossel simples da galeria de ambientes do campus.
(function () {
  document.querySelectorAll("[data-campus-gallery]").forEach(function (root) {
    const slides = root.querySelectorAll("[data-gallery-slide]");
    const thumbs = root.querySelectorAll("[data-gallery-thumb]");
    const counter = root.querySelector("[data-gallery-counter]");
    const label = root.querySelector("[data-gallery-label]");
    const prevBtn = root.querySelector("[data-gallery-prev]");
    const nextBtn = root.querySelector("[data-gallery-next]");
    let index = 0;

    function show(newIndex) {
      index = (newIndex + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle("is-active", i === index);
      });
      if (counter) counter.textContent = String(index + 1).padStart(2, "0");
      if (label) label.textContent = slides[index].getAttribute("data-label") || slides[index].alt;
    }

    if (prevBtn) prevBtn.addEventListener("click", function () { show(index - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { show(index + 1); });
    thumbs.forEach(function (thumb, i) {
      thumb.addEventListener("click", function () { show(i); });
    });
  });
})();
