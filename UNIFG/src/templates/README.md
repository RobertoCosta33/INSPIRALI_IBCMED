# UNIFG/src/templates/ — Tema HubSpot (IBCMED - UNIFG)

Conversão da página estática (`UNIFG/src/pages/index.html` + `UNIFG/src/modules/`)
para um tema HubSpot CMS (HubL), pronta para upload quando houver uma conta/
Personal Access Key configurada (ver seção "Próximos passos").

## Estrutura

```
UNIFG/src/templates/
  theme.json                 # metadados do tema
  fields.json                 # campos globais de estilo (cores/fonte)
  templates/
    layouts/
      base.html                # <head>, header/footer/widgets, CSS/JS globais
    medicina-unifg.html           # template de página — monta os módulos de seção em ordem
  modules/
    header.module/              # compartilhado
    footer.module/               # compartilhado
    floating-contact.module/     # compartilhado — "Ligue já!" + WhatsApp (+ "Tem alguma dúvida?" desativável)
    page-search.module/          # compartilhado — busca Ctrl+F (mark.js)
    processo-seletivo.module/    # inclui o modal de editais
    sobre-instituicao.module/
    nosso-dna.module/
    matriz-curricular.module/
    corpo-docente.module/
    campus.module/
    metodologia.module/
    ecossistema.module/
    financiamentos.module/
    grupo-inspirali.module/
    seu-futuro.module/
    faq-contato.module/          # inclui o formulário (desativável)
  css/
    tokens.css, base.css, components/*.css   # cópia de UNIFG/src/css/ (design system compartilhado, carregado 1x em base.html; paleta/fonte Inspirali — Montserrat)
  vendor/
    mark.min.js
```

Cada `*.module/` segue o padrão HubSpot: `meta.json` (metadados do módulo),
`fields.json` (campos editáveis no editor de conteúdo) e `module.html`
(HubL + `require_css`/`require_js` apontando para `module.css`/`module.js`
do próprio módulo, via `get_asset_url('./module.css')`).

## Decisões de conversão

- **Todo conteúdo de texto, imagem e link é editável via `fields.json`**
  (títulos, textos, CTAs, imagens, itens de listas/carrosséis) — grupos
  repetíveis (`type: "group"`, `occurrence`) são usados para listas como
  pilares do DNA, estatísticas do Grupo Inspirali, coordenadores, fotos de
  campus, disciplinas da matriz curricular, perguntas do FAQ, etc.
- **Formulário de contato (seção FAQ) e botão flutuante "Tem alguma
  dúvida?"** seguem desativados por padrão (`show_form` / `show_doubt_button`
  = `false` no `fields.json`), com HTML pronto usando o módulo nativo de
  formulário do HubSpot (`{% form form_to_use=module.form_id %}`). Para
  reativar: marque o campo booleano no editor e informe o GUID do formulário
  (criado em Marketing > Formulários no HubSpot).
- **Matriz Curricular e Campus** usam grupos aninhados (unidade → grupo →
  disciplina; campus → fotos) e um pequeno bloco de dados serializados em
  JSON (`<script type="application/json">`) para alimentar o `module.js` do
  carrossel de campus — assim o JS genérico de carrossel continua
  reaproveitável, mas os dados (fotos, vídeo do YouTube, endereço, etc.)
  vêm 100% dos campos do módulo.
- **PDFs da Matriz Curricular** usam campos do tipo `file` — serão
  apontados para o arquivo certo assim que forem enviados ao File Manager
  do HubSpot.
- **Imagens**: os campos de imagem (`type: "image"`) ficam com `src` vazio
  no `fields.json` até as imagens serem enviadas ao Design Manager/File
  Manager do HubSpot — nesse momento, edite o conteúdo da página pelo
  editor visual (ou atualize os defaults) apontando para a URL final.
  Ícones decorativos fixos (que não variam por instituição) continuam
  referenciados via `get_asset_url()` direto no `module.html`.

## Próximos passos (antes de publicar)

1. Autenticar a HubSpot CLI (`hs init` / `hs auth`) com a conta de destino.
2. Enviar `UNIFG/src/templates/` para o Design Manager (`hs cms upload` —
   nunca usar `--clean`; sempre buscar/comparar o conteúdo remoto antes).
3. Fazer upload das imagens/PDFs para o Design Manager/File Manager e
   atualizar os campos de imagem/arquivo com as URLs reais.
4. Criar a página em Marketing > Website > Páginas usando o template
   `medicina-unifg.html` e revisar visualmente no preview do HubSpot antes
   de publicar.
5. Quando o formulário de contato for aprovado, criar o formulário no
   HubSpot, ativar `show_form`/`show_doubt_button` e preencher o GUID.

## Estado da sincronização

Sincronizado com `UNIFG/src` após a segunda rodada de cores do Figma (paleta
Inspirali com dourado `#b09435` / `#313132` / areia `#898177` / cinza claro
`#f3f4f6`, fonte Montserrat 200–800, setas dos carrosséis `icon-arrow-*-btn`).
O header usa uma única imagem de logo (`public/images/shared/header-logo.png`,
campo `logo`), exatamente como no Figma. `css/`, `module.css`, `module.js` e os ícones de
`public/icons` são cópia do `src`; `campus`, `financiamentos` e `seu-futuro`
mantêm o JS adaptado (dados via JSON / `data-*` / `window.<INST>_CARD_NAV_ICONS`)
e `processo-seletivo/module.css` inclui o CSS do `edital-modal`. Ícones de
campos de imagem (`field-icons/*` no File Manager) precisam ser reenviados com as
versões recoloridas de `UNIFG/src/public/icons/`.
