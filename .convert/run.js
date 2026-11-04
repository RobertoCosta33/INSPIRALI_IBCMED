// Runner: scaffold + todos os extratores + swaps globais + assets.
const fs = require('fs');
const path = require('path');
const C = require('./convert.js');
const M1 = require('./modules.js');
const M2 = require('./modules2.js');
const { ROOT, INST, SLUG, NAME, TP, MODS, hub, wj, read, write, rj, fieldsOf, setDefault } = C;

// 1) scaffold
C.scaffold();

// 2) swap global UAM-assets -> INST-assets em TODOS os fields.json
for (const dir of fs.readdirSync(path.join(ROOT, `${TP}/modules`))) {
  const fp = path.join(ROOT, `${TP}/modules/${dir}/fields.json`);
  if (!fs.existsSync(fp)) continue;
  let s = fs.readFileSync(fp, 'utf8');
  s = s.replace(/UAM-assets/g, `${INST}-assets`);
  fs.writeFileSync(fp, s);
}
console.log('assets prefix ok');

// 3) extratores por módulo
M1.header();
M1.footer();
M1.floatingContact();
M1.sobre();
M1.faq();
M2.corpoDocente();
M2.campus();
M2.financiamentos();
M2.processoSeletivo();
M2.metodologia();
M2.ecossistema();
M2.nossoDna();
M2.matriz();
M2.grupo();

// 4) module.html: patches institution-specific
const patch = (file, fn) => { const p = path.join(ROOT, file); let s = fs.readFileSync(p, 'utf8'); const n = fn(s); if (n !== s) fs.writeFileSync(p, n); };

// sobre-instituicao: id da section + aria-label + video id
patch(`${TP}/modules/sobre-instituicao.module/module.html`, s => {
  const st = read(`${MODS}/sections/sobre-instituicao/sobre-instituicao.html`);
  const id = (st.match(/<section[^>]*id="([^"]+)"/) || [])[1];
  if (id) s = s.replace(/id="sobre-a-anhembi-morumbi"/, `id="${id}"`);
  const al = (st.match(/aria-label="(Assistir ao vídeo[^"]+)"/) || [])[1];
  if (al) s = s.replace(/aria-label="Assistir ao vídeo institucional da Anhembi Morumbi"/, `aria-label="${al}"`);
  return s;
});

// window.UAM_* -> window.INST_* (html + js)
for (const dir of fs.readdirSync(path.join(ROOT, `${TP}/modules`))) {
  for (const f of ['module.html', 'module.js']) {
    const p = path.join(ROOT, `${TP}/modules/${dir}/${f}`);
    if (fs.existsSync(p)) {
      let s = fs.readFileSync(p, 'utf8');
      s = s.replace(/window\.UAM_/g, `window.${INST}_`);
      fs.writeFileSync(p, s);
    }
  }
}

// 5) assets: ícones e imagens shared da instituição
const iconsDst = path.join(ROOT, `${TP}/public/icons`);
fs.rmSync(iconsDst, { recursive: true, force: true });
fs.mkdirSync(iconsDst, { recursive: true });
for (const f of fs.readdirSync(path.join(ROOT, `${MODS}/../public/icons`))) {
  fs.copyFileSync(path.join(ROOT, `${MODS}/../public/icons/${f}`), path.join(iconsDst, f));
}
const sharedDst = path.join(ROOT, `${TP}/public/images/shared`);
fs.rmSync(sharedDst, { recursive: true, force: true });
fs.mkdirSync(sharedDst, { recursive: true });
const sharedSrc = path.join(ROOT, `${MODS}/../public/images/shared`);
if (fs.existsSync(sharedSrc)) {
  for (const f of fs.readdirSync(sharedSrc)) {
    const fp = path.join(sharedSrc, f);
    if (fs.statSync(fp).isFile()) fs.copyFileSync(fp, path.join(sharedDst, f));
  }
}
console.log('assets copiados');

// 6) sanitiza resíduos institucionais da UAM em defaults/css
const DISP = { AGES: 'AGES', UNIFG: 'UNIFG', USJT: 'São Judas', UNP: 'UnP', UNIBH: 'UniBH' }[INST];
const cleanStr = (v) => typeof v === 'string' ? v
  .replace(/Anhembi Morumbi/g, DISP).replace(/Anhembi/g, DISP)
  .replace(/\bUAM\b(?!-assets)/g, INST) : v;
function walkFields(node, key) {
  if (Array.isArray(node)) return node.map(x => walkFields(x));
  if (node && typeof node === 'object') {
    const o = {};
    for (const k in node) o[k] = walkFields(node[k], k);
    return o;
  }
  // limpa textos, mas preserva chaves estruturais
  return ['name', 'type', 'id', 'field_type', 'occurrence'].includes(key) ? node : cleanStr(node);
}
for (const dir of fs.readdirSync(path.join(ROOT, `${TP}/modules`))) {
  const fp = path.join(ROOT, `${TP}/modules/${dir}/fields.json`);
  if (!fs.existsSync(fp)) continue;
  const j = JSON.parse(fs.readFileSync(fp, 'utf8'));
  fs.writeFileSync(fp, JSON.stringify(walkFields(j), null, 2) + '\n');
  const cp = path.join(ROOT, `${TP}/modules/${dir}/module.css`);
  if (fs.existsSync(cp)) fs.writeFileSync(cp, fs.readFileSync(cp, 'utf8').replace(/\(UAM\)/g, `(${INST})`));
}
console.log('sanitização ok');

// 7) resíduos de marca nos fields/module.html que escaparam
const leftovers = [];
for (const dir of fs.readdirSync(path.join(ROOT, `${TP}/modules`))) {
  for (const f of fs.readdirSync(path.join(ROOT, `${TP}/modules/${dir}`))) {
    const p = path.join(ROOT, `${TP}/modules/${dir}/${f}`);
    const s = fs.readFileSync(p, 'utf8');
    const m = s.match(/Anhembi|UAM(?!-assets)/g);
    if (m) leftovers.push(`${dir}/${f}: ${m.length}x`);
  }
}
console.log('leftovers UAM:', leftovers);
