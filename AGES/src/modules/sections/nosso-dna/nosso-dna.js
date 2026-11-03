// Carrossel horizontal (arraste) dos pilares do "Nosso DNA" no mobile —
// no desktop o `.dna-pillars` continua em linha e este script fica inerte
// (não há overflow para rolar nem gatilho de scroll).
(function () {
  document.querySelectorAll("[data-dna-carousel]").forEach(function (track) {
    const section = track.closest("section");
    const dotsRoot = section ? section.querySelector("[data-dna-dots]") : null;
    const dots = dotsRoot ? Array.prototype.slice.call(dotsRoot.querySelectorAll("[data-dna-dot]")) : [];
    const pillars = Array.prototype.slice.call(track.querySelectorAll(".dna-pillar"));
    if (!pillars.length || !dots.length) return;

    let scrollRaf = null;

    function setActiveDot(index) {
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    // Usa getBoundingClientRect() em vez de offsetLeft: como `.dna-pillars`
    // não tem `position` próprio, offsetLeft seria relativo a um ancestral
    // posicionado diferente do próprio carrossel, dando contas erradas.
    function pillarLeftWithinTrack(pillar) {
      return track.scrollLeft + (pillar.getBoundingClientRect().left - track.getBoundingClientRect().left);
    }

    function activeIndexFromScroll() {
      const center = track.scrollLeft + track.clientWidth / 2;
      let closest = 0;
      let closestDistance = Infinity;
      pillars.forEach(function (pillar, i) {
        const pillarCenter = pillarLeftWithinTrack(pillar) + pillar.offsetWidth / 2;
        const distance = Math.abs(pillarCenter - center);
        if (distance < closestDistance) {
          closestDistance = distance;
          closest = i;
        }
      });
      return closest;
    }

    track.addEventListener("scroll", function () {
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      scrollRaf = requestAnimationFrame(function () {
        setActiveDot(activeIndexFromScroll());
      });
    }, { passive: true });

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        const pillar = pillars[i];
        if (!pillar) return;
        track.scrollTo({ left: pillarLeftWithinTrack(pillar), behavior: "smooth" });
      });
    });
  });
})();
