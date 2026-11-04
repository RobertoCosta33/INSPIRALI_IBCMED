// Extratores: lê o HTML estático de INST e popula fields.json do template.
const fs = require('fs');
const path = require('path');
const C = require('./convert.js');

const { ROOT, INST, TP, MODS, hub, rj, wj, read, write, link, linkf, strip, inner, image, fieldsOf, setDefault } = C;

const clean = (s) => (s || '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'");
const innerText = (html) => clean(strip(html));
// pega innerHTML da 1a ocorrência de <tag ...> em html a partir de um marcador
function block(html, re) { const m = html.match(re); return m ? m[0] : ''; }
function innerOf(html, re) { const m = html.match(re); return m ? clean(inner(m[1] || m[0])) : ''; }

// ---------- HEADER ----------
function header() {
  const { p, j } = fieldsOf('header');
  const s = read(`${MODS}/shared/header/header.html`);

  const logoSrc = s.match(/institutional-header__brand[^>]*>[\s\S]*?src="([^"]+)"/);
  const logoAlt = s.match(/institutional-header__brand[^>]*>[\s\S]*?alt="([^"]*)"/);
  if (logoSrc) setDefault(j, 'logo', image(logoSrc[1], logoAlt ? logoAlt[1] : ''));

  const home = s.match(/class="institutional-header__brand"[^>]*href="([^"]+)"|href="([^"]+)"[^>]*class="institutional-header__brand"/);
  if (home) setDefault(j, 'home_url', link(home[1] || home[2]));

  const cta = s.match(/header-cta-dropdown__trigger-full[^>]*>([^<]+)/);
  if (cta) setDefault(j, 'enrollment_cta_label', innerText(cta[1]));
  const ctaS = s.match(/header-cta-dropdown__trigger-short[^>]*>([^<]+)/);
  if (ctaS) setDefault(j, 'enrollment_cta_label_short', innerText(ctaS[1]));

  const items = [...s.matchAll(/class="header-cta-dropdown__item"[^>]*href="([^"]+)"[^>]*>([^<]+)/g)]
    .map(m => ({ url: link(m[1]), item_label: innerText(m[2]) }));
  if (items.length) setDefault(j, 'enrollment_items', items);

  const nav = [...s.matchAll(/<a[^>]*class="course-nav__link"[^>]*href="([^"]+)"[^>]*>([^<]+)/g)]
    .map(m => ({ url: link(m[1]), link_label: innerText(m[2]) }));
  if (nav.length) setDefault(j, 'course_nav_links', nav);

  wj(p, j); console.log('  header ok');
}

// ---------- FOOTER ----------
function footer() {
  const { p, j } = fieldsOf('footer');
  const s = read(`${MODS}/shared/footer/footer.html`);

  const inv = s.match(/footer-invitation__title">([\s\S]*?)<\/p>/);
  if (inv) setDefault(j, 'invitation_title', innerText(inv[1]));
  const invCta = s.match(/footer-invitation__cta"[^>]*href="([^"]+)"[^>]*>([^<]+)/);
  if (invCta) { setDefault(j, 'invitation_cta_label', innerText(invCta[2])); setDefault(j, 'invitation_cta_url', link(invCta[1])); }

  // colunas de links
  const cols = [];
  const colRe = /<div class="footer-col">([\s\S]*?)<\/div>\s*<\/div>/g;
  for (const m of s.matchAll(/<p class="footer-col__title">([^<]+)<\/p>\s*<div class="footer-col__links">([\s\S]*?)<\/div>/g)) {
    const links = [...m[2].matchAll(/<a href="([^"]+)"[^>]*>([\s\S]*?)<span class="footer-col__links-arrow">/g)]
      .map(a => linkf(a[1], innerText(a[2])));
    cols.push({ title: innerText(m[1]), links });
  }
  if (cols.length) setDefault(j, 'link_columns', cols);

  const contacts = [...s.matchAll(/footer-col__contact-label">\s*([^<]+?)\s*<\/p>\s*<p class="footer-col__contact-value">([^<]+)<\/p>/g)]
    .map(m => ({ contact_label: innerText(m[1]), value: innerText(m[2]) }));
  if (contacts.length) setDefault(j, 'contact_items', contacts);

  const ct = s.match(/footer-col__title footer-col__title--lg">([^<]+)/) || s.match(/footer-col__contact">[\s\S]*?footer-col__title[^>]*>([^<]+)/);
  if (ct) setDefault(j, 'contact_title', innerText(ct[1]));

  const soc = {};
  const mapDom = { 'facebook.com': 'facebook_url', 'instagram.com': 'instagram_url', 'linkedin.com': 'linkedin_url', 'tiktok.com': 'tiktok_url', 'x.com': 'x_url', 'youtube.com': 'youtube_url' };
  for (const m of s.matchAll(/footer-social">\s*<a href="([^"]+)"|footer-social[^>]*>[\s\S]*?<\/div>/g)) {
    for (const a of m[0].matchAll(/<a href="([^"]+)"/g)) {
      for (const d in mapDom) if (a[1].includes(d)) soc[mapDom[d]] = link(a[1]);
    }
  }
  if (Object.keys(soc).length) setDefault(j, 'social_links', soc);

  const qr = s.match(/footer-emec-qr">\s*<img src="([^"]+)"[^>]*alt="([^"]*)"/);
  if (qr) setDefault(j, 'emec_qr_image', image(qr[1], qr[2]));
  const qrA = s.match(/footer-emec-qr">[\s\S]*?<a href="([^"]+)"[^>]*>([^<]+)<\/a>/);
  if (qrA) { setDefault(j, 'emec_qr_url', link(qrA[1])); setDefault(j, 'emec_qr_label', innerText(qrA[2])); }

  const priv = s.match(/footer-bottom__link" href="([^"]+)"[^>]*>Canal de privacidade/);
  if (priv) setDefault(j, 'privacy_channel_url', link(priv[1]));
  const copy = s.match(/footer-copyright">([\s\S]*?)<\/p>/);
  if (copy) setDefault(j, 'copyright_text', innerText(copy[1]));

  wj(p, j); console.log('  footer ok');
}

// ---------- FLOATING CONTACT ----------
function floatingContact() {
  const { p, j } = fieldsOf('floating-contact');
  const f = `${MODS}/shared/floating-contact/floating-contact.html`;
  if (!fs.existsSync(path.join(ROOT, f))) { console.log('  floating-contact: sem arquivo, mantido'); return; }
  const s = read(f);
  const wa = s.match(/whatsapp[^"]*"[^>]*href="([^"]+)"|href="(https:\/\/wa\.me[^"]*)"/i);
  if (wa) setDefault(j, 'whatsapp_url', link(wa[1] || wa[2]));
  const tel = s.match(/tel:([+\d]+)/);
  if (tel) setDefault(j, 'call_phone_tel', 'tel:' + tel[1]);
  const num = s.match(/call-phone[^>]*>([^<]+)|(\(\d{2}\)\s*[\d-]+)/);
  wj(p, j); console.log('  floating-contact ok');
}

// ---------- SOBRE ----------
function sobre() {
  const { p, j } = fieldsOf('sobre-instituicao');
  const s = read(`${MODS}/sections/sobre-instituicao/sobre-instituicao.html`);

  const img = s.match(/institutional-about__video-image"[^>]*src="([^"]+)"[^>]*alt="([^"]*)"/) ||
              s.match(/src="([^"]+)"[^>]*class="institutional-about__video-image"/);
  if (img) setDefault(j, 'video_cover_image', image(img[1], img[2] || ''));
  const vid = s.match(/data-open-video-modal="([^"]+)"/);
  if (vid) setDefault(j, 'video_url', link(/youtube|youtu\.be/.test(vid[1]) ? vid[1] : `https://www.youtube.com/watch?v=${vid[1]}`));
  const eb = s.match(/class="eyebrow">([^<]+)/);
  if (eb) setDefault(j, 'eyebrow', innerText(eb[1]));
  const ttl = s.match(/institutional-about__title"[^>]*>([\s\S]*?)<\/h2>/);
  if (ttl) setDefault(j, 'title', clean(inner(ttl[1])));
  const body = s.match(/institutional-about__text">([\s\S]*?)<\/div>/);
  if (body) setDefault(j, 'body_text', clean(inner(body[1])));
  const cta = s.match(/institutional-about__cta"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<img/);
  if (cta) { setDefault(j, 'cta_url', link(cta[1])); setDefault(j, 'cta_label', innerText(cta[2])); }

  wj(p, j); console.log('  sobre ok');
}

// ---------- FAQ ----------
function faq() {
  const { p, j } = fieldsOf('faq-contato');
  const s = read(`${MODS}/sections/faq-contato/faq-contato.html`);
  const eb = s.match(/class="eyebrow">([^<]+)/); if (eb) setDefault(j, 'eyebrow', innerText(eb[1]));
  const ttl = s.match(/id="faq-title">([\s\S]*?)<\/h2>/); if (ttl) setDefault(j, 'title', innerText(ttl[1]));
  const items = [...s.matchAll(/<div class="faq-item" data-accordion-item>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g)]
    .map(m => {
      const q = m[1].match(/<span>([^<]+)<\/span>/);
      const a = m[1].match(/faq-item__panel-inner">([\s\S]*?)<\/div>\s*$/);
      return { question: innerText(q ? q[1] : ''), answer: a ? clean(inner(a[1])) : '' };
    }).filter(i => i.question);
  if (items.length) setDefault(j, 'faq_items', items);
  wj(p, j); console.log('  faq ok:', items.length);
}

module.exports = { header, footer, floatingContact, sobre, faq };
