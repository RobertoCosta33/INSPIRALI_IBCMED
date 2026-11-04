// Extratores dos módulos de seção — parte 2.
const fs = require('fs');
const path = require('path');
const C = require('./convert.js');
const { ROOT, INST, TP, MODS, hub, rj, wj, read, link, strip, inner, image, fieldsOf, setDefault } = C;

const clean = (s) => (s || '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'");
const T = (s) => clean(strip(s));   // texto puro
const R = (s) => clean(inner(s));   // richtext (innerHTML achatado)
const G = (b, re) => { const x = b.match(re); return x ? x[1] : ''; };

// ---------- CORPO DOCENTE ----------
function corpoDocente() {
  const { p, j } = fieldsOf('corpo-docente');
  const s = read(`${MODS}/sections/corpo-docente/corpo-docente.html`);
  const eb = s.match(/class="eyebrow">([^<]+)/); if (eb) setDefault(j, 'eyebrow', T(eb[1]));
  const ttl = s.match(/section-intro__title"[^>]*>([\s\S]*?)<\/h2>/); if (ttl) setDefault(j, 'title', T(ttl[1]));
  const intro = s.match(/section-intro__text[^>]*>([\s\S]*?)<\/p>/); if (intro) setDefault(j, 'intro_text', `<p>${R(intro[1])}</p>`);
  const coords = [...s.matchAll(/<article class="docente-card">([\s\S]*?)<\/article>/g)].map(m => {
    const b = m[1];
    const ph = b.match(/docente-card__photo" src="([^"]+)"[^>]*alt="([^"]*)"/);
    const role = b.match(/docente-card__role">([^<]+)/);
    const name = b.match(/docente-card__name">([^<]+)/);
    const bio = b.match(/docente-card__bio">([\s\S]*?)<\/p>/);
    return {
      photo: ph ? image(ph[1], ph[2]) : undefined,
      role: role ? T(role[1]) : '',
      person_name: name ? T(name[1]) : '',
      bio: bio ? `<p>${R(bio[1])}</p>` : '',
      more_url: link('#'),
    };
  });
  if (coords.length) setDefault(j, 'coordinators', coords);
  wj(p, j); console.log('  corpo-docente ok:', coords.length);
}

// ---------- CAMPUS ----------
function campus() {
  const { p, j } = fieldsOf('campus');
  const s = read(`${MODS}/sections/campus/campus.html`);
  const js = read(`${MODS}/sections/campus/campus.js`);

  const eb = s.match(/class="eyebrow">([^<]+)/); if (eb) setDefault(j, 'eyebrow', T(eb[1]));
  const ttl = s.match(/campus-title"[^>]*>([\s\S]*?)<\/h2>/) || s.match(/section-intro__title"[^>]*>([\s\S]*?)<\/h2>/);
  if (ttl) setDefault(j, 'title', T(ttl[1]));
  const intro = s.match(/section-intro__text[^>]*>([\s\S]*?)<\/p>/); if (intro) setDefault(j, 'intro_text', `<p>${R(intro[1])}</p>`);
  const pt = s.match(/campus-panel__title">([^<]+)/); if (pt) setDefault(j, 'panel_title', T(pt[1]));
  const ptx = s.match(/campus-panel__text">([\s\S]*?)<\/(?:p|div)>/); if (ptx) setDefault(j, 'panel_text', `<p>${R(ptx[1])}</p>`);
  const cta = s.match(/campus-panel__cta"[^>]*>([^<]+)/); if (cta) setDefault(j, 'cta_label', T(cta[1]));

  let galleries = {};
  try {
    let pre = js.slice(0, js.indexOf('document.querySelectorAll'));
    pre = pre.replace(/\(\s*function\s*\(\s*\)\s*\{/, ''); // remove abertura do IIFE
    galleries = (new Function(pre + '\n; return CAMPUS_GALLERIES;'))();
  } catch (e) { console.log('  campus.js eval falhou:', e.message); }

  const chipRe = /<button[\s\S]*?data-campus-chip[\s\S]*?data-campus="([^"]+)"[\s\S]*?data-city="([^"]*)"[\s\S]*?data-address="([^"]*)"[\s\S]*?data-cta="([^"]*)"[\s\S]*?>([\s\S]*?)<\/button>/g;
  const campuses = [...s.matchAll(chipRe)].map(m => {
    const g = galleries[m[1]] || [];
    const photos = g.filter(x => !x.type).map(x => ({ image: image(x.src, x.alt), caption: x.label }));
    const vid = g.find(x => x.type === 'video');
    const chipLabel = T(m[5]);
    const label = (g[0] && g[0].campusLabel) || chipLabel.split('—')[0].trim();
    return {
      campus_key: m[1], chip_label: chipLabel, display_name: label,
      city: m[2], address: m[3], cta_url: link(m[4]),
      video_id: vid ? vid.videoId : '', photos,
    };
  });
  if (campuses.length) setDefault(j, 'campuses', campuses);
  wj(p, j); console.log('  campus ok:', campuses.map(c => c.campus_key + '(' + c.photos.length + 'f)').join(' '));
}

// ---------- FINANCIAMENTOS ----------
function financiamentos() {
  const { p, j } = fieldsOf('financiamentos');
  const s = read(`${MODS}/sections/financiamentos/financiamentos.html`);
  const eb = s.match(/class="eyebrow">([^<]+)/); if (eb) setDefault(j, 'eyebrow', T(eb[1]));
  const ttl = s.match(/section-intro__title"[^>]*>([\s\S]*?)<\/h2>/); if (ttl) setDefault(j, 'title', T(ttl[1]));
  const intro = s.match(/financing-intro__text[^>]*>([\s\S]*?)<\/p>/) || s.match(/section-intro__text[^>]*>([\s\S]*?)<\/p>/);
  if (intro) setDefault(j, 'intro_text', `<p>${R(intro[1])}</p>`);

  const priceBlocks = [...s.matchAll(/data-financing-slide[^>]*>([\s\S]*?)<\/div>/g)].map(m => m[1]);
  const prices = (priceBlocks.length ? priceBlocks : [...s.matchAll(/financing-highlight__slide[^>]*>([\s\S]*?)<\/div>/g)].map(m => m[1]))
    .map(b => ({
      campus_name: T(G(b, /financing-highlight__campus">([\s\S]*?)<\/p>/)),
      price_label: T(G(b, /financing-highlight__label">([\s\S]*?)<\/p>/)),
      price_value: T(G(b, /financing-highlight__value">([\s\S]*?)<\/p>/)),
      price_note: T(G(b, /financing-highlight__note">([\s\S]*?)<\/p>/)),
      price_disclaimer: T(G(b, /financing-highlight__disclaimer">([\s\S]*?)<\/p>/)),
    })).filter(c => c.price_value);
  // fallback: instituições com um campus só não exibem o nome no card — usa o
  // display_name do módulo de campus para manter o campo editável
  const fp = `${TP}/modules/campus.module/fields.json`;
  const fallback = (() => { try { const c = rj(fp).find(x => x.name === 'campuses').default; return c.length === 1 ? `${INST} - ${c[0].display_name}` : ''; } catch { return ''; } })();
  prices.forEach(c => { if (!c.campus_name) c.campus_name = fallback; });
  if (prices.length) setDefault(j, 'campus_prices', prices);

  const programs = [...s.matchAll(/<article class="info-card">([\s\S]*?)<\/article>/g)].map(m => {
    const b = m[1];
    const a = b.match(/info-card__link"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
    const opensModal = /data-open-bolsa-modal|data-bolsa-modal|data-modal/.test(b);
    return {
      title: T(G(b, /info-card__title">([\s\S]*?)<\/p>/)),
      subtitle: T(G(b, /info-card__subtitle">([\s\S]*?)<\/p>/)),
      text: `<p>${R(G(b, /info-card__text">([\s\S]*?)<\/p>/))}</p>`,
      note: T(G(b, /info-card__note">([\s\S]*?)<\/p>/)),
      link_label: a ? T(a[2]) : '',
      opens_modal: opensModal,
      url: a && !opensModal ? link(a[1]) : link('#'),
    };
  });
  if (programs.length) setDefault(j, 'programs', programs);
  const bolsaList = s.match(/bolsa-modal__list[^>]*>([\s\S]*?)<\/ul>/);
  if (bolsaList) {
    const docs = [...bolsaList[1].matchAll(/href="([^"]+)"[^>]*>([\s\S]*?)<\/a\s*>/g)]
      .map(m => ({ doc_label: T(m[2]), url: link(m[1]) })).filter(d => d.doc_label);
    setDefault(j, 'bolsa_modal_documents', docs);
  } else {
    setDefault(j, 'bolsa_modal_documents', []);
  }
  const bt = s.match(/bolsa-modal-title[^>]*>([\s\S]*?)<\/p>/);
  if (bt) setDefault(j, 'bolsa_modal_title', T(bt[1]));
  wj(p, j); console.log('  financiamentos ok:', prices.length, 'preços,', programs.length, 'programas');
}

// ---------- PROCESSO SELETIVO ----------
function processoSeletivo() {
  const { p, j } = fieldsOf('processo-seletivo');
  const s = read(`${MODS}/sections/processo-seletivo/processo-seletivo.html`);
  const eb = s.match(/class="eyebrow">([^<]+)/); if (eb) setDefault(j, 'eyebrow', T(eb[1]));
  const h = s.match(/selection-hero__title[^>]*>([\s\S]*?)<\/h1>/) || s.match(/section-intro__title"[^>]*>([\s\S]*?)<\/h1>/);
  if (h) {
    const spans = [...h[1].matchAll(/<span[^>]*>([\s\S]*?)<\/span>/g)].map(x => x[1]);
    setDefault(j, 'title_line_1', T(spans[0] || h[1]));
    if (spans[1]) setDefault(j, 'title_line_2', R(spans[1]));
  }
  const intro = s.match(/selection-hero__text[^>]*>([\s\S]*?)<\/p>/) || s.match(/section-intro__text[^>]*>([\s\S]*?)<\/p>/);
  if (intro) setDefault(j, 'intro_text', `<p>${R(intro[1])}</p>`);
  const guide = s.match(/selection-hero__guidance[^>]*>([\s\S]*?)<\/p>/);
  if (guide) setDefault(j, 'guidance_text', `<p>${R(guide[1])}</p>`);
  const bg = s.match(/selection-card__bg[^>]*src="([^"]+)"|card-bg[^>]*src="([^"]+)"/);
  if (bg) setDefault(j, 'card_bg_image', image(bg[1] || bg[2], ''));
  const cey = s.match(/selection-card__eyebrow">([^<]+)/); if (cey) setDefault(j, 'card_eyebrow', T(cey[1]));
  const clead = s.match(/selection-card__lead">([^<]+)/); if (clead) setDefault(j, 'card_lead', T(clead[1]));

  const tabBtns = [...s.matchAll(/<button[\s\S]*?data-tab="([^"]+)"[\s\S]*?role="tab"[\s\S]*?>([\s\S]*?)<\/button>/g)];
  const tabs = tabBtns.map(tb => {
    const key = tb[1], b = tb[2];
    const icA = b.match(/tab-icon--active"[^>]*src="([^"]+)"/);
    const icI = b.match(/tab-icon--inactive"[^>]*src="([^"]+)"/);
    const label = T(b.replace(/<img[^>]*>/g, ''));
    const pre = new RegExp(`data-tab-panel="${key}"[^>]*>([\\s\\S]*?)(?=<div class="selection-card__panel|<div class="edital-modal)`);
    const panel = s.match(pre);
    const pb = panel ? panel[1] : '';
    const ctaA = pb.match(/selection-card__cta"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<img/);
    const edital = pb.match(/selection-card__link"[^>]*data-open-edital-modal[^>]*>([\s\S]*?)<\/a>/);
    return {
      icon: icA ? image(icA[1]) : undefined,
      icon_inactive: icI ? image(icI[1]) : undefined,
      tab_label: label,
      status_label: T(G(pb, /selection-status">([\s\S]*?)<\/span>/)),
      modality_name: T(G(pb, /selection-card__name">([\s\S]*?)<\/p>/)),
      description: `<p>${R(G(pb, /selection-card__description">([\s\S]*?)<\/p>/))}</p>`,
      facts: R(G(pb, /selection-card__facts">([\s\S]*?)<\/div>/)),
      cta_label: ctaA ? T(ctaA[2]) : '',
      cta_url: ctaA ? link(ctaA[1]) : link('#'),
      edital_link_label: edital ? T(edital[1]) : 'Consultar Edital',
    };
  });
  if (tabs.length) setDefault(j, 'tabs', tabs);
  const conv = s.match(/selection-card__link"[^>]*href="([^"]+)"[^>]*>\s*Lista Convocados/);
  if (conv) { setDefault(j, 'show_convocados_link', true); setDefault(j, 'convocados_url', link(conv[1])); }
  else setDefault(j, 'show_convocados_link', false);

  // modal de editais: prefere edital-modal.html (mais atualizado); fallback no embutido
  let ms = s;
  const mf = `${MODS}/sections/processo-seletivo/edital-modal.html`;
  if (fs.existsSync(path.join(ROOT, mf))) ms = read(mf);
  const mt = ms.match(/id="edital-modal-title">([^<]+)/); if (mt) setDefault(j, 'modal_title', T(mt[1]));
  const msub = ms.match(/edital-modal__subtitle">([\s\S]*?)<\/p>/) || ms.match(/edital-modal__header-text[^>]*>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/);
  if (msub) setDefault(j, 'modal_subtitle', `<p>${R(msub[1])}</p>`);
  const items = [...ms.matchAll(/<div class="edital-item"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g)].map(m => {
    const b = m[1];
    const title = b.match(/edital-item__trigger[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/);
    const links = [...b.matchAll(/edital-item__link"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]
      .map(a => ({ url: link(a[1]), link_label: T(a[2]) }));
    return { title: title ? T(title[1]) : '', links };
  }).filter(i => i.title);
  if (items.length) setDefault(j, 'modal_items', items);
  wj(p, j); console.log('  processo-seletivo ok:', tabs.length, 'abas,', items.length, 'modal');
}

// ---------- METODOLOGIA ----------
function metodologia() {
  const { p, j } = fieldsOf('metodologia');
  const s = read(`${MODS}/sections/metodologia/metodologia.html`);
  const eb = s.match(/class="eyebrow">([^<]+)/); if (eb) setDefault(j, 'eyebrow', T(eb[1]));
  const ttl = s.match(/metodologia-title"[^>]*>([\s\S]*?)<\/h2>/) || s.match(/section-intro__title"[^>]*>([\s\S]*?)<\/h2>/);
  if (ttl) setDefault(j, 'title', T(ttl[1]));
  const intro = s.match(/section-intro__text[^>]*>([\s\S]*?)<\/p>/); if (intro) setDefault(j, 'intro_text', `<p>${R(intro[1])}</p>`);
  const img = s.match(/methodology__image"[^>]*src="([^"]+)"[^>]*alt="([^"]*)"/);
  if (img) setDefault(j, 'media_image', image(img[1], img[2]));
  const items = [...s.matchAll(/<div class="accordion-item"[^>]*>([\s\S]*?)(?=<div class="accordion-item"|<\/div>\s*<\/div>\s*<\/section>)/g)].map(m => {
    const b = m[1];
    const t = b.match(/accordion-trigger__title">([\s\S]*?)<\/span>/);
    const x = b.match(/accordion-panel__inner[^>]*>([\s\S]*?)<\/div>\s*<\/div>/);
    return { title: t ? T(t[1]) : '', text: x ? R(x[1]) : '' };
  }).filter(i => i.title);
  if (items.length) setDefault(j, 'accordion_items', items);
  wj(p, j); console.log('  metodologia ok:', items.length);
}

// ---------- ECOSSISTEMA ----------
function ecossistema() {
  const { p, j } = fieldsOf('ecossistema');
  const s = read(`${MODS}/sections/ecossistema/ecossistema.html`);
  const eb = s.match(/class="eyebrow">([^<]+)/); if (eb) setDefault(j, 'eyebrow', T(eb[1]));
  const ttl = s.match(/section-intro__title"[^>]*>([\s\S]*?)<\/h2>/); if (ttl) setDefault(j, 'title', T(ttl[1]));
  const intro = s.match(/section-intro__text[^>]*>([\s\S]*?)<\/p>/); if (intro) setDefault(j, 'intro_text', `<p>${R(intro[1])}</p>`);
  const slides = [...s.matchAll(/evidence-carousel__slide[^>]*>([\s\S]*?)(?=<div class="evidence-carousel__slide|<div class="carousel-controls)/g)].map(m => {
    const b = m[1];
    const img = b.match(/evidence-carousel__image[^>]*src="([^"]+)"[^>]*alt="([^"]*)"/) || b.match(/<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"/);
    return {
      image: img ? image(img[1], img[2]) : undefined,
      eyebrow: T(G(b, /evidence-carousel__eyebrow">([\s\S]*?)<\/p>/)),
      subtitle: T(G(b, /evidence-carousel__subtitle">([\s\S]*?)<\/p>/)),
      value: T(G(b, /evidence-carousel__value">([\s\S]*?)<\/p>/)),
      support_text: `<p>${R(G(b, /evidence-carousel__label">([\s\S]*?)<\/p>/))}</p>`,
    };
  });
  if (slides.length) setDefault(j, 'slides', slides);
  wj(p, j); console.log('  ecossistema ok:', slides.length);
}

// ---------- NOSSO DNA ----------
function nossoDna() {
  const { p, j } = fieldsOf('nosso-dna');
  const s = read(`${MODS}/sections/nosso-dna/nosso-dna.html`);
  const eb = s.match(/class="eyebrow">([^<]+)/); if (eb) setDefault(j, 'eyebrow', T(eb[1]));
  const ttl = s.match(/dna-title"[^>]*>([\s\S]*?)<\/h2>/) || s.match(/section-intro__title"[^>]*>([\s\S]*?)<\/h2>/);
  if (ttl) setDefault(j, 'title', T(ttl[1]));
  const intro = s.match(/section-intro__text[^>]*>([\s\S]*?)<\/p>/); if (intro) setDefault(j, 'intro_text', `<p>${R(intro[1])}</p>`);
  const pillars = [...s.matchAll(/<div class="dna-pillar">([\s\S]*?)<\/div>(?=\s*<div class="dna-pillar|\s*<div class="dna-pillars-dots)/g)].map(m => {
    const b = m[1];
    const ph = b.match(/dna-pillar__photo" src="([^"]+)"[^>]*alt="([^"]*)"/);
    const ic = b.match(/dna-pillar__icon" src="([^"]+)"/);
    const t = b.match(/dna-pillar__title">([^<]+)/);
    const x = b.match(/dna-pillar__text">([\s\S]*?)<\/p>/);
    return {
      photo: ph ? image(ph[1], ph[2]) : undefined,
      icon: ic ? image(ic[1]) : undefined,
      title: t ? T(t[1]) : '',
      text: x ? `<p>${R(x[1])}</p>` : '',
    };
  });
  if (pillars.length) setDefault(j, 'pillars', pillars);
  wj(p, j); console.log('  nosso-dna ok:', pillars.length);
}

// ---------- MATRIZ ----------
function matriz() {
  const { p, j } = fieldsOf('matriz-curricular');
  const s = read(`${MODS}/sections/matriz-curricular/matriz-curricular.html`);
  const eb = s.match(/class="eyebrow">([^<]+)/); if (eb) setDefault(j, 'eyebrow', T(eb[1]));
  const ttl = s.match(/section-intro__title"[^>]*>([\s\S]*?)<\/h2>/); if (ttl) setDefault(j, 'title', T(ttl[1]));
  const intro = s.match(/section-intro__text[^>]*>([\s\S]*?)<\/p>/); if (intro) setDefault(j, 'intro_text', `<p>${R(intro[1])}</p>`);
  const hrs = s.match(/([\d.]+)\s*horas totais/i); if (hrs) setDefault(j, 'status_total_hours', hrs[0]);

  const tabs = [...s.matchAll(/class="unit-tab[^"]*"[^>]*data-tab="([^"]+)"[^>]*>([\s\S]*?)<\/button>/g)];
  const parseGroups = (part) => [...part.matchAll(/unit-panel__group-title">([\s\S]*?)<\/p>([\s\S]*?)(?=unit-panel__group-title|<\/div>\s*<\/div>|$)/g)]
    .map(gm => ({
      group_title: T(gm[1]),
      disciplines: [...gm[2].matchAll(/unit-panel__discipline-name">([\s\S]*?)<\/p>\s*<p class="unit-panel__discipline-hours">([^<]+)<\/p>/g)]
        .map(d => ({ discipline_name: T(d[1]), hours: T(d[2]) })),
    })).filter(g => g.disciplines.length || g.group_title);
  const units = tabs.map(t => {
    const panel = s.match(new RegExp(`data-tab-panel="${t[1]}"[^>]*>([\\s\\S]*?)(?=<div class="unit-panel|</section>)`));
    const pb = panel ? panel[1] : '';
    const extraIdx = pb.search(/unit-panel__extra/);
    return {
      unit_key: t[1],
      tab_label: T(t[2]),
      eyebrow: T(G(pb, /unit-panel__eyebrow">([^<]+)/)),
      total_hours: T(G(pb, /unit-panel__hours">([^<]+)/)),
      title: T(G(pb, /unit-panel__title">([\s\S]*?)<\/p>/)),
      visible_groups: parseGroups(extraIdx >= 0 ? pb.slice(0, extraIdx) : pb),
      extra_groups: parseGroups(extraIdx >= 0 ? pb.slice(extraIdx) : ''),
    };
  });
  if (units.length) setDefault(j, 'units', units);

  const dl = s.match(/matriz-download[^>]*>([\s\S]*?)<\/p>|downloads[^>]*>([\s\S]*?)<\/p>/);
  const d26 = s.match(/href="([^"]+)"[^>]*>[^<]*2026/i);
  const dcur = s.match(/href="([^"]+)"[^>]*>(?![^<]*2026)[^<]*matriz curricular/i);
  const ppc = s.match(/href="([^"]+)"[^>]*>[^<]*pedagógico/i);
  if (d26) setDefault(j, 'download_2026_file', hub(d26[1]));
  if (dcur) setDefault(j, 'download_current_file', hub(dcur[1]));
  if (ppc) setDefault(j, 'ppc_url', link(ppc[1]));
  wj(p, j); console.log('  matriz ok:', units.length, 'unidades');
}

// ---------- GRUPO INSPIRALI ----------
function grupo() {
  const { p, j } = fieldsOf('grupo-inspirali');
  const s = read(`${MODS}/sections/grupo-inspirali/grupo-inspirali.html`);
  const logo = s.match(/inspirali-header__logo[^>]*src="([^"]+)"[^>]*alt="([^"]*)"/) || s.match(/<img[^>]*src="([^"]*inspirali[^"]*)"[^>]*alt="([^"]*)"/);
  if (logo) setDefault(j, 'inspirali_logo', image(logo[1], logo[2]));
  const ttl = s.match(/inspirali-header__title[^>]*>([\s\S]*?)<\/h2>/) || s.match(/section-intro__title"[^>]*>([\s\S]*?)<\/h2>/);
  if (ttl) setDefault(j, 'title', T(ttl[1]));
  const txt = s.match(/inspirali-header__text[^>]*>([\s\S]*?)<\/p>/); if (txt) setDefault(j, 'text', `<p>${R(txt[1])}</p>`);
  const stats = [...s.matchAll(/stat-card[^>]*>([\s\S]*?)(?=<div class="stat-card|<\/div>\s*<\/div>\s*<div class="lifelong|lifelong)/g)].map(m => {
    const b = m[1];
    const ic = b.match(/stat-card__icon[^>]*src="([^"]+)"/) || b.match(/<img[^>]*src="([^"]*icon[^"]*)"/);
    return {
      icon: ic ? image(ic[1]) : undefined,
      value: T(G(b, /stat-card__value">([\s\S]*?)<\/p>/)),
      title: T(G(b, /stat-card__title">([\s\S]*?)<\/p>/)),
      text: `<p>${R(G(b, /stat-card__text">([\s\S]*?)<\/p>/))}</p>`,
    };
  }).filter(i => i.title || i.value);
  if (stats.length) setDefault(j, 'stats', stats);
  const ll = s.match(/lifelong__label[^>]*>([^<]+)/); if (ll) setDefault(j, 'lifelong_label', T(ll[1]));
  const ls = s.match(/lifelong__sublabel[^>]*>([^<]+)/); if (ls) setDefault(j, 'lifelong_sublabel', T(ls[1]));
  const lt = s.match(/lifelong__text[^>]*>([\s\S]*?)<\/p>/); if (lt) setDefault(j, 'lifelong_text', `<p>${R(lt[1])}</p>`);
  const steps = [...s.matchAll(/timeline-step[^>]*>([\s\S]*?)(?=<div class="timeline-step|<\/div>\s*<\/div>\s*<div class="partner|partner)/g)].map(m => {
    const b = m[1];
    const ic = b.match(/timeline-step__icon[^>]*src="([^"]+)"/) || b.match(/timeline-step__dot[^>]*src="([^"]+)"/) || b.match(/<img[^>]*src="([^"]*icon[^"]*)"/);
    return {
      icon: ic ? image(ic[1]) : undefined,
      title: T(G(b, /timeline-step__title">([\s\S]*?)<\/p>/)),
      text: `<p>${R(G(b, /timeline-step__text">([\s\S]*?)<\/p>/))}</p>`,
    };
  }).filter(i => i.title);
  if (steps.length) setDefault(j, 'timeline_steps', steps);
  const partners = [...s.matchAll(/partner-logo[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"|<img[^>]*class="partner[^"]*"[^>]*src="([^"]+)"[^>]*alt="([^"]*)"/g)]
    .map(m => ({ logo: image(m[1] || m[3], m[2] || m[4] || '') }));
  if (partners.length) setDefault(j, 'partner_logos', partners);
  wj(p, j); console.log('  grupo-inspirali ok:', stats.length, 'stats,', steps.length, 'steps,', partners.length, 'logos');
}

module.exports = { corpoDocente, campus, financiamentos, processoSeletivo, metodologia, ecossistema, nossoDna, matriz, grupo };
