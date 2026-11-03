const fs=require('fs');
const path='USJT/src/';
const read=f=>fs.readFileSync(path+f,'utf8');
let idx=read('pages/index.html');
const headEnd=idx.indexOf('<body>');
const scriptsStart=idx.indexOf('<script src=');
// build new head
let head=idx.slice(0,headEnd);
head=head.replace(/<title>[^<]*<\/title>/,'<title>Medicina São Judas (USJT) | Excelência Acadêmica Einstein | Inspirali</title>');
head=head.replace(/content="Medicina Anhembi Morumbi:[^"]*"/,'content="Medicina São Judas: formação com nota máxima no MEC e Excelência Acadêmica Einstein, integrada ao ecossistema Inspirali. Conheça o processo seletivo, a matriz curricular, o campus e as formas de financiamento."');
head=head.replace('https://www.ibcmed.com.br/anhembi-morumbi/medicina','https://www.ibcmed.com.br/sao-judas/medicina');
head=head.replace(/property="og:title" content="[^"]*"/,'property="og:title" content="Medicina São Judas | Excelência Acadêmica Einstein"');
head=head.replace(/property="og:description"[\s\S]*?content="[^"]*"/,m=>m.replace(/content="[^"]*"/,'content="Medicina São Judas: formação com nota máxima no MEC, integrada ao ecossistema Inspirali."'));
head=head.replace('https://www.ibcmed.com.br/images/anhembi-morumbi/','https://www.ibcmed.com.br/images/sao-judas/');
head=head.replace('https://www.ibcmed.com.br/anhembi-morumbi/medicina','https://www.ibcmed.com.br/sao-judas/medicina');
head=head.replace(/"description": "[^"]*"/,'"description": "Curso de Medicina da Universidade São Judas Tadeu (USJT), unidade do Grupo Inspirali com colaboração do Einstein Hospital Israelita."');
head=head.replace('"name": "Universidade Anhembi Morumbi"','"name": "Universidade São Judas Tadeu"');
head=head.replace('"sameAs": "https://portal.anhembi.br/faculdade-de-medicina-em-sao-paulo/"','"sameAs": "https://www.usjt.br/"');
const M='modules/';
const mod=f=>read(M+f).trim();
const sections=[
 'sections/processo-seletivo/processo-seletivo.html',
 'sections/sobre-instituicao/sobre-instituicao.html',
 'sections/nosso-dna/nosso-dna.html',
 'sections/matriz-curricular/matriz-curricular.html',
 'sections/corpo-docente/corpo-docente.html',
 'sections/campus/campus.html',
 'shared/video-modal/video-modal.html',
 'sections/metodologia/metodologia.html',
 'sections/ecossistema/ecossistema.html',
 'sections/financiamentos/financiamentos.html',
 'sections/grupo-inspirali/grupo-inspirali.html',
 'sections/seu-futuro/seu-futuro.html',
 'sections/faq-contato/faq-contato.html',
].map(mod).join('\n\n');
const body=[
 '  <body>',
 '    <a class="skip-link" href="#conteudo-principal">Ir para o conteúdo principal</a>',
 mod('shared/header/header.html'),
 '    <main id="conteudo-principal">',
 sections,
 '    </main>',
 mod('shared/footer/footer.html'),
 mod('shared/page-search/page-search.html'),
 mod('shared/floating-contact/floating-contact.html'),
 '  </body>',
 '</html>',
].join('\n');
// keep scripts block from old file (inside </body> tail)
const tail=idx.slice(scriptsStart);
const tailEnd=tail.indexOf('</body>');
const scripts=tail.slice(0,tailEnd).trimEnd();
const newHtml=head+body.slice(0,body.lastIndexOf('  </body>'))+'\n    '+scripts.split('\n').join('\n    ')+'\n  </body>\n</html>\n';
fs.writeFileSync('USJT/src/pages/index.html',newHtml);
console.log('written',newHtml.split('\n').length,'lines; anhembi refs:',(/anhembi/i.test(newHtml)));
