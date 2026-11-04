// Converte INST/src/modules (estático) -> INST/src/templates (HubL, padrão UAM).
// Uso: node .convert/convert.js AGES
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INST = process.argv[2];
const SLUG = { AGES: 'ages', UNIFG: 'unifg', USJT: 'usjt', UNP: 'unp', UNIBH: 'unibh' }[INST];
const NAME = { AGES: 'AGES', UNIFG: 'UNIFG', USJT: 'USJT', UNP: 'UNP', UNIBH: 'UNIBH' }[INST];
if (!INST) throw new Error('informe a instituição');

const HUB = `https://51397625.fs1.hubspotusercontent-na1.net/hubfs/51397625/${INST}-assets`;
const TP = `${INST}/src/templates`;
const MODS = `${INST}/src/modules`;

const hub = (p) => {
  // /INST/src/public/images/<sub>/<file> -> HUB/<sub>/<file>
  // /INST/src/public/icons/<file>      -> HUB/field-icons/<file>
  // /INST/src/public/docs/<file>       -> HUB/docs/<file>
  let m = p.match(new RegExp(`/${INST}/src/public/images/(.+)$`));
  if (m) return `${HUB}/${m[1]}`;
  m = p.match(new RegExp(`/${INST}/src/public/icons/(.+)$`));
  if (m) return `${HUB}/field-icons/${m[1]}`;
  m = p.match(new RegExp(`/${INST}/src/public/docs/(.+)$`));
  if (m) return `${HUB}/docs/${m[1]}`;
  return p;
};
const rj = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const wj = (p, j) => fs.writeFileSync(path.join(ROOT, p), JSON.stringify(j, null, 2) + '\n');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const write = (p, s) => fs.writeFileSync(path.join(ROOT, p), s);
const link = (href, extra) => ({ url: { href, type: 'EXTERNAL', content_id: null }, open_in_new_tab: false, no_follow: false, ...extra });
const linkf = (href, label) => ({ url: link(href), link_label: label });
const strip = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
// converte HTML interno de um elemento para o formato richtext dos fields
const inner = (html) => html.trim().replace(/\s*\n\s*/g, '');
const image = (src, alt) => ({ src: hub(src), alt: alt || '', loading: 'lazy', width: 0, height: 0, max_width: 0, max_height: 0 });

// ---------- utilidades de extração ----------
function fieldsOf(module) {
  const p = `${TP}/modules/${module}.module/fields.json`;
  return { p, j: rj(p) };
}
function setDefault(j, name, value) {
  const f = j.find(x => x.name === name);
  if (!f) throw new Error('campo não existe: ' + name);
  f.default = value;
}
function getDefault(j, name) {
  const f = j.find(x => x.name === name);
  return f ? f.default : undefined;
}

// ---------- scaffolding ----------
function scaffold() {
  write(`${TP}/theme.json`, JSON.stringify({ label: `IBCMED - ${NAME}`, enable_domain_stylesheet_evaluation: true, version: 1 }, null, 2) + '\n');
  const tpl = `${TP}/templates/medicina-${SLUG}.html`;
  const uamTpl = `${TP}/templates/medicina-uam.html`;
  let t = fs.existsSync(path.join(ROOT, uamTpl)) ? read(uamTpl) : read(tpl);
  if (fs.existsSync(path.join(ROOT, uamTpl))) fs.unlinkSync(path.join(ROOT, uamTpl));
  t = t.replace('label: Medicina - UAM', `label: Medicina - ${NAME}`);
  if (INST === 'UNP') {
    // no Figma da UNP o Nosso DNA vem antes do Institucional
    t = t.replace(
      /(\{% module "sobre_instituicao"[^\n]*\n)(\s*)(\{% module "nosso_dna"[^\n]*\n)/,
      '$3$2$1'
    );
  }
  write(tpl, t);
  // meta.json: troca "UAM" no label
  for (const dir of fs.readdirSync(path.join(ROOT, `${TP}/modules`))) {
    const mp = `${TP}/modules/${dir}/meta.json`;
    if (!fs.existsSync(path.join(ROOT, mp))) continue;
    let m = read(mp).replace(/UAM/g, NAME).replace(/Anhembi Morumbi/g, NAME);
    write(mp, m);
  }
  console.log('scaffold ok');
}

module.exports = { ROOT, INST, SLUG, NAME, HUB, TP, MODS, hub, rj, wj, read, write, link, linkf, strip, inner, image, fieldsOf, setDefault, getDefault, scaffold };

if (require.main === module) scaffold();
