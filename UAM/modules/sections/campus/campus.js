// Carrossel simples da galeria de ambientes do campus + alternância entre
// as unidades (Mooca, Piracicaba, São José dos Campos).
(function () {
  function buildGallery(folder, name, count) {
    const photos = [];
    for (let i = 1; i <= count; i++) {
      photos.push({
        src: "/UAM/public/images/campus-gallery/" + folder + "/photo-" + i + ".jpg",
        label: name,
        alt: name + " — foto " + i + " do campus " + name,
      });
    }
    return photos;
  }

  function youtubeThumb(videoId) {
    return "https://img.youtube.com/vi/" + videoId + "/hqdefault.jpg";
  }

  function videoSlide(videoId, name) {
    return {
      type: "video",
      videoId: videoId,
      videoUrl: "https://www.youtube.com/watch?v=" + videoId,
      src: youtubeThumb(videoId),
      label: "Vídeo institucional",
      alt: "Vídeo institucional do campus " + name,
    };
  }

  const CAMPUS_GALLERIES = {
    mooca: buildGallery("mooca", "Mooca", 7),
    piracicaba: buildGallery("piracicaba", "Piracicaba", 6),
    "sao-jose-dos-campos": buildGallery("sao-jose-dos-campos", "São José dos Campos", 10),
  };
  // Algumas fotos foram salvas como .png em vez de .jpg; corrige extensões conhecidas.
  CAMPUS_GALLERIES.piracicaba[5].src = CAMPUS_GALLERIES.piracicaba[5].src.replace(/\.jpg$/, ".jpeg");
  CAMPUS_GALLERIES["sao-jose-dos-campos"][1].src = CAMPUS_GALLERIES["sao-jose-dos-campos"][1].src.replace(/\.jpg$/, ".png");
  CAMPUS_GALLERIES["sao-jose-dos-campos"][6].src = CAMPUS_GALLERIES["sao-jose-dos-campos"][6].src.replace(/\.jpg$/, ".png");
  CAMPUS_GALLERIES["sao-jose-dos-campos"][9].src = CAMPUS_GALLERIES["sao-jose-dos-campos"][9].src.replace(/\.jpg$/, ".png");

  // Vídeo institucional de cada unidade, sempre como último item da galeria.
  CAMPUS_GALLERIES.mooca.push(videoSlide("pZ5RWFXfIQU", "Mooca"));
  CAMPUS_GALLERIES.piracicaba.push(videoSlide("kOfW_fLo23c", "Piracicaba"));
  CAMPUS_GALLERIES["sao-jose-dos-campos"].push(videoSlide("I8S5-E5OYlQ", "São José dos Campos"));

  document.querySelectorAll("[data-campus-gallery]").forEach(function (root) {
    const viewport = root.querySelector(".campus-gallery__viewport");
    const thumbsList = root.querySelector(".campus-gallery__thumbs");
    const counter = root.querySelector("[data-gallery-counter]");
    const total = root.querySelector("[data-gallery-total]");
    const label = root.querySelector("[data-gallery-label]");
    const prevBtn = root.querySelector("[data-gallery-prev]");
    const nextBtn = root.querySelector("[data-gallery-next]");
    const progressRing = root.querySelector("[data-gallery-progress]");
    let slides = Array.prototype.slice.call(root.querySelectorAll("[data-gallery-slide]"));
    let thumbs = Array.prototype.slice.call(root.querySelectorAll("[data-gallery-thumb]"));
    let index = 0;

    const AUTOPLAY_DURATION = 3000;
    let autoplayRaf = null;

    function stopAutoplay() {
      if (autoplayRaf) cancelAnimationFrame(autoplayRaf);
      autoplayRaf = null;
    }

    function startAutoplay() {
      stopAutoplay();
      if (slides.length <= 1) return;
      const startTime = performance.now();

      function tick(now) {
        const elapsed = now - startTime;
        const progress = Math.min((elapsed / AUTOPLAY_DURATION) * 100, 100);
        if (progressRing) progressRing.style.setProperty("--progress", String(progress));

        if (elapsed >= AUTOPLAY_DURATION) {
          show(index + 1);
          return;
        }
        autoplayRaf = requestAnimationFrame(tick);
      }

      autoplayRaf = requestAnimationFrame(tick);
    }

    function show(newIndex) {
      index = (newIndex + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle("is-active", i === index);
      });
      scrollThumbIntoView(index);
      if (counter) counter.textContent = String(index + 1).padStart(2, "0");
      if (total) total.textContent = String(slides.length).padStart(2, "0");
      if (label) label.textContent = slides[index].getAttribute("data-label") || "";
      startAutoplay();
    }

    function bindThumb(thumb, i) {
      thumb.addEventListener("click", function () { show(i); });
    }

    // Rola a coluna de miniaturas isoladamente (sem afetar o scroll da página).
    function scrollThumbIntoView(i) {
      const thumb = thumbs[i];
      if (!thumb || !thumbsList) return;
      if (thumbsList.scrollHeight <= thumbsList.clientHeight) return;

      const thumbTop = thumb.offsetTop;
      const thumbBottom = thumbTop + thumb.offsetHeight;
      const viewTop = thumbsList.scrollTop;
      const viewBottom = viewTop + thumbsList.clientHeight;

      if (thumbTop < viewTop) {
        thumbsList.scrollTo({ top: thumbTop, behavior: "smooth" });
      } else if (thumbBottom > viewBottom) {
        thumbsList.scrollTo({ top: thumbBottom - thumbsList.clientHeight, behavior: "smooth" });
      }
    }

    function loadCampus(campusKey) {
      const photos = CAMPUS_GALLERIES[campusKey];
      if (!photos || !viewport || !thumbsList) return;

      const overlay = viewport.querySelector(".campus-gallery__overlay");
      const labelEl = viewport.querySelector("[data-gallery-label]");
      const counterEl = viewport.querySelector(".campus-gallery__counter");
      const navEl = viewport.querySelector(".campus-gallery__nav");

      viewport.querySelectorAll("[data-gallery-slide]").forEach(function (el) { el.remove(); });
      photos.forEach(function (photo, i) {
        const slide = document.createElement("div");
        slide.className = "campus-gallery__image" + (i === 0 ? " is-active" : "") + (photo.type === "video" ? " campus-gallery__image--video" : "");
        slide.setAttribute("data-gallery-slide", "");
        slide.setAttribute("data-label", photo.label);
        if (photo.type === "video") slide.setAttribute("data-video-url", photo.videoUrl);

        const img = document.createElement("img");
        img.className = "campus-gallery__photo";
        img.src = photo.src;
        img.alt = photo.alt;
        img.loading = "lazy";
        slide.appendChild(img);

        if (photo.type === "video") {
          const playIcon = document.createElement("img");
          playIcon.className = "campus-gallery__play";
          playIcon.src = "/UAM/public/icons/icon-play-white.svg";
          playIcon.alt = "";
          playIcon.setAttribute("aria-hidden", "true");
          slide.appendChild(playIcon);
        }

        viewport.insertBefore(slide, overlay);
      });

      thumbsList.innerHTML = "";
      photos.forEach(function (photo, i) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "campus-thumb" + (i === 0 ? " is-active" : "") + (photo.type === "video" ? " campus-thumb--video" : "");
        btn.setAttribute("data-gallery-thumb", String(i));
        const playIconHtml = photo.type === "video" ? '<img class="campus-thumb__play" src="/UAM/public/icons/icon-play-white.svg" alt="" aria-hidden="true" />' : "";
        btn.innerHTML = '<img class="campus-thumb__photo" src="' + photo.src + '" alt="" loading="lazy" />' + playIconHtml + '<span class="campus-thumb__label">' + photo.label + "</span>";
        thumbsList.appendChild(btn);
      });

      slides = Array.prototype.slice.call(root.querySelectorAll("[data-gallery-slide]"));
      thumbs = Array.prototype.slice.call(root.querySelectorAll("[data-gallery-thumb]"));
      thumbs.forEach(bindThumb);
      index = 0;
      show(0);
    }

    if (prevBtn) prevBtn.addEventListener("click", function () { show(index - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { show(index + 1); });
    thumbs.forEach(bindThumb);

    // Clicar na imagem/vídeo em destaque: vídeo abre o YouTube em nova aba,
    // imagem abre em um overlay (lightbox) ampliado.
    if (viewport) {
      viewport.addEventListener("click", function (event) {
        if (event.target.closest(".campus-gallery__nav")) return;
        const activeSlide = slides[index];
        if (!activeSlide) return;

        const videoUrl = activeSlide.getAttribute("data-video-url");
        if (videoUrl) {
          window.open(videoUrl, "_blank", "noopener");
          return;
        }

        const img = activeSlide.querySelector("img");
        if (img) openLightbox(img.src, img.alt);
      });
    }

    root.loadCampus = loadCampus;
    loadCampus("mooca");
  });

  // Lightbox simples para ampliar a imagem clicada.
  const lightbox = document.querySelector("[data-campus-lightbox]");
  const lightboxImg = lightbox ? lightbox.querySelector("[data-campus-lightbox-image]") : null;
  const lightboxClose = lightbox ? lightbox.querySelector("[data-campus-lightbox-close]") : null;

  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    lightbox.hidden = false;
    requestAnimationFrame(function () {
      lightbox.classList.add("is-open");
    });
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
    setTimeout(function () {
      lightbox.hidden = true;
    }, 250);
  }

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeLightbox();
  });

  // Alternância entre as unidades (chips "Mooca", "Piracicaba", "São José dos Campos").
  document.querySelectorAll(".campus-layout").forEach(function (root) {
    const chips = root.querySelectorAll("[data-campus-chip]");
    const cityEl = root.querySelector("[data-campus-city]");
    const addressEl = root.querySelector("[data-campus-address]");
    const ctaEl = root.querySelector("[data-campus-cta]");
    const gallery = root.querySelector("[data-campus-gallery]");
    if (!chips.length) return;

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) {
          const isActive = c === chip;
          c.classList.toggle("campus-chip--active", isActive);
          c.classList.toggle("campus-chip--inactive", !isActive);
          c.setAttribute("aria-pressed", String(isActive));
        });

        if (cityEl) cityEl.textContent = chip.getAttribute("data-city") || "";
        if (addressEl) addressEl.textContent = chip.getAttribute("data-address") || "";
        if (ctaEl) ctaEl.href = chip.getAttribute("data-cta") || "#";
        if (gallery && gallery.loadCampus) gallery.loadCampus(chip.getAttribute("data-campus"));
      });
    });
  });
})();
