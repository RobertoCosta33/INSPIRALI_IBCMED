// Carrossel simples da galeria de ambientes do campus + alternância entre
// as unidades (Buritis, Vespasiano).
(function () {
  // Cada foto usa o próprio nome do arquivo (sem extensão) como legenda da
  // miniatura — ex.: "sala-de-aula.jpg" exibe "Sala de aula". O selo verde
  // em cima da imagem grande continua mostrando o nome do campus
  // (`campusLabel`), não o nome do arquivo.
  function buildGallery(folder, name, files) {
    return files.map(function (entry) {
      return {
        src: "/UNIBH/src/public/images/campus-gallery/" + folder + "/" + entry[1],
        label: entry[0],
        campusLabel: name,
        alt: entry[0] + " — campus " + name,
      };
    });
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
      campusLabel: name,
      alt: "Vídeo institucional do campus " + name,
    };
  }

  const CAMPUS_GALLERIES = {
    buritis: buildGallery('buritis', 'Buritis', [
      ['Entrada do campus', 'entrada-do-campus.jpg'],
      ['Recepção e acesso ao campus', 'recepcao-e-acesso-ao-campus.jpg'],
      ['Espaço de estudos', 'espaco-de-estudos.png'],
      ['Sala de aula em auditório', 'sala-de-aula-em-auditorio.jpg'],
      ['Laboratório morfofuncional', 'laboratorio-morfofuncional.jpg'],
      ['Laboratório com mesa anatômica digital', 'laboratorio-com-mesa-anatomica-digital.png'],
      ['Laboratório de simulação avançada', 'laboratorio-de-simulacao-avancada.jpg'],
      ['Sala de procedimentos', 'sala-de-procedimentos.png'],
    ]),
    vespasiano: buildGallery('vespasiano', 'Vespasiano', [
      ['Hall de entrada', 'hall-de-entrada.jpg'],
      ['Biblioteca', 'biblioteca.jpg'],
      ['Sala de estudos em grupo', 'sala-de-estudos-em-grupo.jpg'],
      ['Laboratório de anatomia', 'laboratorio-de-anatomia.jpg'],
      ['Laboratório de habilidades clínicas', 'laboratorio-de-habilidades-clinicas.jpg'],
      ['Laboratório de simulação clínica', 'laboratorio-de-simulacao-clinica.jpg'],
      ['Sala de observação da simulação clínica', 'sala-de-observacao-da-simulacao-clinica.jpg'],
    ]),
  };

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
          show(index + 1, { scrollThumb: false });
          return;
        }
        autoplayRaf = requestAnimationFrame(tick);
      }

      autoplayRaf = requestAnimationFrame(tick);
    }

    function show(newIndex, options) {
      index = (newIndex + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle("is-active", i === index);
      });
      // A troca automática (autoplay) não deve rolar a coluna de miniaturas —
      // só a navegação manual (clique em seta/miniatura) faz isso.
      if (!options || options.scrollThumb !== false) {
        scrollThumbIntoView(index);
      }
      if (counter) counter.textContent = String(index + 1).padStart(2, "0");
      if (total) total.textContent = String(slides.length).padStart(2, "0");
      if (label) label.textContent = slides[index].getAttribute("data-label") || "";
      // "Anterior" fica de fato desabilitado (não clicável, sem dar a volta
      // para a última foto) só na primeira foto; das demais em diante usa o
      // mesmo destaque do botão "Próxima". "Próxima" nunca desabilita — ao
      // chegar na última foto, volta para a primeira (loop).
      if (prevBtn) {
        prevBtn.classList.toggle("is-enabled", index !== 0);
        // Usa aria-disabled em vez de `disabled`: desabilitar via atributo
        // HTML um botão que está com foco (ex.: o usuário acabou de clicar
        // nele para chegar na 1ª foto) força o navegador a tirar o foco, o
        // que em alguns navegadores dispara um scroll indesejado da página.
        prevBtn.setAttribute("aria-disabled", String(index === 0));
      }
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

      // Usa getBoundingClientRect() em vez de offsetTop: como a lista de
      // miniaturas não tem `position` próprio, offsetTop seria relativo a
      // um ancestral posicionado bem mais acima (ou ao <body>), dando um
      // valor enorme e fazendo o scroll sempre pular pro final da lista.
      const thumbRect = thumb.getBoundingClientRect();
      const listRect = thumbsList.getBoundingClientRect();
      const viewTop = thumbsList.scrollTop;
      const thumbTop = viewTop + (thumbRect.top - listRect.top);
      const thumbBottom = thumbTop + thumb.offsetHeight;
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
      const counterEl = root.querySelector(".campus-gallery__counter");
      const navEl = root.querySelector(".campus-gallery__nav");

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
          playIcon.src = "/UNIBH/src/public/icons/icon-play-white.svg";
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
        const playIconHtml = photo.type === "video" ? '<img class="campus-thumb__play" src="/UNIBH/src/public/icons/icon-play-white.svg" alt="" aria-hidden="true" />' : "";
        btn.innerHTML = '<img class="campus-thumb__photo" src="' + photo.src + '" alt="" loading="lazy" />' + playIconHtml + '<span class="campus-thumb__label">' + photo.label + "</span>";
        thumbsList.appendChild(btn);
      });

      slides = Array.prototype.slice.call(root.querySelectorAll("[data-gallery-slide]"));
      thumbs = Array.prototype.slice.call(root.querySelectorAll("[data-gallery-thumb]"));
      thumbs.forEach(bindThumb);
      index = 0;
      show(0);
    }

    if (prevBtn) prevBtn.addEventListener("click", function () {
      if (prevBtn.getAttribute("aria-disabled") === "true") return;
      show(index - 1);
    });
    if (nextBtn) nextBtn.addEventListener("click", function () { show(index + 1); });
    thumbs.forEach(bindThumb);

    // Clicar na imagem/vídeo em destaque: vídeo abre o YouTube em nova aba,
    // imagem abre em um overlay (lightbox) ampliado.
    if (viewport) {
      // Arrastar (swipe) sobre a imagem para trocar de foto, no mobile/tablet.
      let touchStartX = null;
      let didSwipe = false;

      viewport.addEventListener("click", function (event) {
        if (didSwipe) { didSwipe = false; return; }
        if (event.target.closest(".campus-gallery__nav")) return;
        const activeSlide = slides[index];
        if (!activeSlide) return;

        const videoUrl = activeSlide.getAttribute("data-video-url");
        if (videoUrl) {
          if (typeof window.openVideoModal === "function") {
            window.openVideoModal(videoUrl);
          } else {
            window.open(videoUrl, "_blank", "noopener");
          }
          return;
        }

        const img = activeSlide.querySelector("img");
        if (img) openLightbox(img.src, img.alt);
      });

      viewport.addEventListener("touchstart", function (event) {
        touchStartX = event.touches[0].clientX;
        didSwipe = false;
      }, { passive: true });

      viewport.addEventListener("touchmove", function (event) {
        if (touchStartX === null) return;
        if (Math.abs(event.touches[0].clientX - touchStartX) > 10) didSwipe = true;
      }, { passive: true });

      viewport.addEventListener("touchend", function (event) {
        if (touchStartX === null) return;
        const deltaX = event.changedTouches[0].clientX - touchStartX;
        if (Math.abs(deltaX) > 40) {
          didSwipe = true;
          show(index + (deltaX < 0 ? 1 : -1));
        }
        touchStartX = null;
      });
    }

    // A galeria (viewport + miniaturas) precisa ter exatamente a mesma
    // altura da coluna esquerda inteira (título + chips + endereço + botão
    // "Conheça mais da unidade"), como no Figma. CSS puro (grid/flex
    // stretch) cria um loop de auto-sizing com a galeria tentando crescer
    // para caber o próprio conteúdo das miniaturas — por isso medimos a
    // altura real da coluna esquerda em JS e aplicamos no viewport.
    const layout = root.closest(".campus-layout");
    const panelTop = layout ? layout.querySelector(".campus-panel--top") : null;
    const panelBottom = layout ? layout.querySelector(".campus-panel--bottom") : null;

    function syncGalleryHeight() {
      if (!layout || !panelTop || !panelBottom || !viewport) return;
      if (window.innerWidth <= 860) {
        viewport.style.height = "";
        if (thumbsList) thumbsList.style.maxHeight = "";
        return;
      }
      const layoutStyles = window.getComputedStyle(layout);
      const rowGap = parseFloat(layoutStyles.rowGap || layoutStyles.gap || "0") || 0;
      const height = panelTop.offsetHeight + rowGap + panelBottom.offsetHeight;
      viewport.style.height = height + "px";
      // Miniaturas acompanham exatamente a mesma altura do viewport —
      // o excesso de fotos rola dentro da própria coluna.
      if (thumbsList) thumbsList.style.maxHeight = height + "px";
    }

    window.addEventListener("resize", syncGalleryHeight);
    if (window.ResizeObserver && panelTop && panelBottom) {
      const ro = new ResizeObserver(syncGalleryHeight);
      ro.observe(panelTop);
      ro.observe(panelBottom);
    }
    root.syncGalleryHeight = syncGalleryHeight;

    root.loadCampus = loadCampus;
    loadCampus("buritis");
    syncGalleryHeight();
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

  // Alternância entre as unidades (chips "Buritis", "Vespasiano").
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

          // O ícone precisa trocar de cor junto com o estado — senão fica
          // branco sobre fundo branco (inativo) ou teal sobre fundo teal
          // (ativo), ou seja, invisível.
          const icon = c.querySelector("img");
          if (icon) {
            icon.src = isActive
              ? "/UNIBH/src/public/icons/icon-building-white.svg"
              : "/UNIBH/src/public/icons/icon-building-teal.svg";
          }
        });

        if (cityEl) cityEl.textContent = chip.getAttribute("data-city") || "";
        if (addressEl) addressEl.textContent = chip.getAttribute("data-address") || "";
        if (ctaEl) ctaEl.href = chip.getAttribute("data-cta") || "#";
        if (gallery && gallery.loadCampus) gallery.loadCampus(chip.getAttribute("data-campus"));
        // O endereço muda de tamanho entre unidades (quebra de linha
        // diferente) — re-sincroniza a altura do viewport com a coluna
        // esquerda depois da troca.
        if (gallery && gallery.syncGalleryHeight) requestAnimationFrame(gallery.syncGalleryHeight);
      });
    });
  });
})();
