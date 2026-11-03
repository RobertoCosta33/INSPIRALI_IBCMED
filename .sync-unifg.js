const fs = require('fs');
const path = require('path');

const INDEX = 'UNIFG/src/pages/index.html';
let html = fs.readFileSync(INDEX, 'utf8');

function findBlock(src, openRe, tag) {
  const m = src.match(openRe);
  if (!m) return null;
  const start = m.index;
  const re = new RegExp(`<${tag}[ \n>]|<\\/${tag}>`, 'g');
  re.lastIndex = start;
  let depth = 0, mm;
  while ((mm = re.exec(src))) {
    const tok = mm[0];
    if (tok.startsWith('</')) {
      depth--;
      if (depth === 0) return { start, end: mm.index + tok.length };
    } else {
      depth++;
    }
  }
  return null;
}

const jobs = [
  ['modules/shared/header/header.html', /<header class="site-header">/, 'header'],
  ['modules/sections/processo-seletivo/processo-seletivo.html', /<section[^>]*id="processos-seletivos"/, 'section'],
  ['modules/sections/sobre-instituicao/sobre-instituicao.html', /<section[^>]*id="sobre-a-/, 'section'],
  ['modules/sections/nosso-dna/nosso-dna.html', /<section[^>]*id="nosso-dna"/, 'section'],
  ['modules/sections/matriz-curricular/matriz-curricular.html', /<section[^>]*id="matriz-curricular"/, 'section'],
  ['modules/sections/corpo-docente/corpo-docente.html', /<section[^>]*id="corpo-docente"/, 'section'],
  ['modules/sections/campus/campus.html', /<section[^>]*id="nossos-campus"/, 'section'],
  ['modules/sections/metodologia/metodologia.html', /<section[^>]*id="metodologia"/, 'section'],
  ['modules/sections/ecossistema/ecossistema.html', /<section[^>]*id="ecossistema-de-cuidado"/, 'section'],
  ['modules/sections/financiamentos/financiamentos.html', /<section[^>]*id="investimento-e-financiamentos"/, 'section'],
  ['modules/sections/grupo-inspirali/grupo-inspirali.html', /<section[^>]*id="grupo-inspirali"/, 'section'],
  ['modules/sections/seu-futuro/seu-futuro.html', /<section[^>]*id="seu-futuro-na-medicina"/, 'section'],
  ['modules/sections/faq-contato/faq-contato.html', /<section[^>]*id="faq-e-contato"/, 'section'],
  ['modules/shared/footer/footer.html', /<footer class="site-footer">/, 'footer'],
  ['modules/shared/page-search/page-search.html', /<div class="page-search"/, 'div'],
  ['modules/shared/floating-contact/floating-contact.html', /<div class="floating-contact"/, 'div'],
];

// Process from bottom to top so offsets stay valid
const edits = [];
for (const [file, re, tag] of jobs) {
  const modPath = path.join('UNIFG/src', file);
  let mod = fs.readFileSync(modPath, 'utf8');
  // strip everything before the root tag (leading comments/whitespace)
  const rootIdx = mod.search(new RegExp(`<${tag}[ \n>]`));
  if (rootIdx < 0) { console.log('NO ROOT TAG', file); continue; }
  mod = mod.slice(rootIdx).trimEnd();
  const block = findBlock(html, re, tag);
  if (!block) { console.log('NOT FOUND in index:', file); continue; }
  edits.push({ ...block, mod, file });
}
edits.sort((a, b) => b.start - a.start);
for (const e of edits) {
  html = html.slice(0, e.start) + e.mod + html.slice(e.end);
  console.log('replaced', e.file);
}
fs.writeFileSync(INDEX, html);
console.log('done');
