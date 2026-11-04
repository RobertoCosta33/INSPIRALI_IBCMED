// Limpeza final dos templates convertidos: remove resíduos de conteúdo UAM.
const fs = require('fs');
const path = require('path');
const C = require('./convert.js');
const { ROOT, INST, TP, MODS } = C;

const DISP = { AGES: 'AGES', UNIFG: 'UNIFG', USJT: 'São Judas', UNP: 'UnP', UNIBH: 'UniBH' }[INST];

// 1) ícones de navegação do carrossel de financiamentos (referenciados pelo
// module.html da UAM) — copia para a instituição se ausentes
const FIN_ICONS = [
  'icon-chevron-left-financing.svg',
  'icon-chevron-left-financing-active.svg',
  'icon-chevron-right-financing.svg',
  'icon-chevron-right-financing-disabled.svg',
];
for (const ic of FIN_ICONS) {
  for (const dest of [`${INST}/src/public/icons/${ic}`, `${TP}/public/icons/${ic}`]) {
    const src = `UAM/src/public/icons/${ic}`;
    if (!fs.existsSync(path.join(ROOT, dest)) && fs.existsSync(path.join(ROOT, src))) {
      fs.copyFileSync(path.join(ROOT, src), path.join(ROOT, dest));
      console.log('ícone copiado:', dest);
    }
  }
}

// 2) URLs anhembi -> '#' em todos os fields.json (estático usa '#' para
//    socials/canal de privacidade/portais)
const ANHEMBI_URL = /https?:\/\/[^"'\\\s]*anhembi[^"'\\\s]*/g;
function scrubStr(v) {
  return typeof v === 'string'
    ? v.replace(ANHEMBI_URL, '#')
      .replace(/Anhembi Morumbi/g, DISP).replace(/Anhembi/g, DISP)
      .replace(/\bUAM\b(?!-assets)/g, INST)
    : v;
}
function walk(node, key) {
  if (Array.isArray(node)) return node.map(x => walk(x));
  if (node && typeof node === 'object') {
    const o = {};
    for (const k in node) o[k] = walk(node[k], k);
    return o;
  }
  return ['name', 'type', 'id', 'field_type', 'occurrence'].includes(key) ? node : scrubStr(node);
}
const modDir = path.join(ROOT, TP, 'modules');
for (const d of fs.readdirSync(modDir)) {
  const fp = path.join(modDir, d, 'fields.json');
  if (fs.existsSync(fp)) {
    const j = JSON.parse(fs.readFileSync(fp, 'utf8'));
    fs.writeFileSync(fp, JSON.stringify(walk(j), null, 2) + '\n');
  }
}

// 3) comentários em css do tema
(function walkDir(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) { walkDir(p); continue; }
    if (!f.endsWith('.css') && !f.endsWith('.js') && !f.endsWith('.html')) continue;
    const c = fs.readFileSync(p, 'utf8');
    const n = c.replace(/\bUAM\b(?!-assets)/g, INST).replace(/Anhembi Morumbi/g, DISP).replace(/Anhembi/g, DISP);
    if (n !== c) { fs.writeFileSync(p, n); }
  }
})(path.join(ROOT, TP));

// 4) svgs de marca da UAM não referenciados -> remove
const sharedDir = path.join(ROOT, TP, 'public/images/shared');
if (fs.existsSync(sharedDir)) {
  const allContent = (function cat(d, acc = []) {
    for (const f of fs.readdirSync(d)) {
      const p = path.join(d, f);
      if (fs.statSync(p).isDirectory()) cat(p, acc);
      else if (/\.(html|js|json|css)$/.test(f)) acc.push(fs.readFileSync(p, 'utf8'));
    }
    return acc;
  })(modDir).join('\n');
  for (const f of fs.readdirSync(sharedDir)) {
    if (/anhembi/i.test(f) && !allContent.includes(f)) {
      fs.unlinkSync(path.join(sharedDir, f));
      console.log('svg removido:', f);
    }
  }
}

console.log('scrub ok');
