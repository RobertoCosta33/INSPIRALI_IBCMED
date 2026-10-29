# UNA/src/templates/ — Tema HubSpot (IBCMED - UNA)

Conversão da página estática (`UNA/src/pages/index.html` + `UNA/src/modules/`) para um
tema HubSpot CMS (HubL), no mesmo padrão do tema da UAM (`UAM/src/templates/`).
Nada foi enviado ao HubSpot: o tema está pronto para upload quando a CLI estiver
autenticada e houver aprovação explícita (ver "Próximos passos").

## Estrutura

```
UNA/src/templates/
  theme.json                  # label "IBCMED - UNA"
  fields.json                 # campos globais (cores/fonte da UNA, lidos de css/tokens.css)
  templates/
    layouts/base.html          # <head> (Google Fonts Montserrat), CSS do design system, mark.min.js, header/footer/busca/modal de vídeo
    medicina-una.html          # template de página "Medicina - UNA" — 12 módulos de seção, mesma ordem de pages/index.html
  modules/
    header.module/  footer.module/  page-search.module/  video-modal.module/   # compartilhados
    processo-seletivo.module/    # inclui o modal de editais
    sobre-instituicao.module/  nosso-dna.module/  matriz-curricular.module/  corpo-docente.module/
    campus.module/  metodologia.module/  ecossistema.module/  financiamentos.module/
    grupo-inspirali.module/  seu-futuro.module/  faq-contato.module/
  css/   tokens.css, base.css, components/*.css     # cópia fiel de UNA/src/css (carregada 1x em base.html)
  vendor/mark.min.js                                # cópia de UNA/src/vendor
  public/icons, public/images/shared                # só o que module.html/base.html referenciam via get_asset_url
```

Cada `*.module/` tem `meta.json` ("<Nome> - UNA"), `fields.json`, `module.html`,
`module.css` e, quando existe na versão estática, `module.js`.

## Decisões específicas da UNA

- **Identidade**: cor de marca (dourado) `#B09435`, neutro escuro `#313132`, areia `#898177`, cinza claro `#f3f4f6`, fonte **Montserrat** (Google Fonts,
  pesos 200–800), paleta "Inspirali" de `UNA/src/css/tokens.css`. O link de fonte em `base.html` é o mesmo de `pages/index.html`.
- **Sem widget flutuante**: `UNA/src` não tem `floating-contact`, então não existe esse módulo e ele não é chamado em `base.html`.
- **Header**: a logo da UNA é uma imagem única (ícone + "UNA MEDICINA" + "Excelência Acadêmica Einstein"). Por isso
  `institution_subtitle`, `partner_logo` e `mobile_logo` ficam vazios por padrão (o HubL oculta quando vazio).
- **Campus** (Tucuruí, unidade única): campos planos (`campus_name`, `campus_text`, `city`, `address` com link "Ver no mapa",
  `cta_*`) + grupo `photos`; sem chips de unidade. `module.js` lê as fotos de `<script type="application/json" data-campus-json>`
  e há `video_id` opcional (vira o último item da galeria). As fotos usadas são as de `public/images/campus-gallery/tucurui/*.jpg`
  (as que o HTML estático referencia). A pasta `campus-gallery/UNA/*.JPG` (originais, ainda não referenciados) **não** foi usada.
- **Corpo docente**: 2 coordenadores, sem setas/indicadores do carrossel (a versão estática da UNA não os tem); o campo `more_url` da UAM foi removido (não era usado).
- **Matriz curricular**: 9 abas (8 unidades + internato) com grupos visíveis/extras ("Ver mais +"). As chaves das abas passam a ser
  geradas por índice (`unit-0`, `unit-1`…) em vez do campo `unit_key`, que na UAM não existia em `fields.json`. Os dois PDFs
  usam os links já preenchidos em `UNA/src` (matriz 2026 em `estaticos.animaeducacao.com.br`; matriz atual ainda `#`).
- **Financiamentos**: 1 unidade (`campus_name` vazio = oculto; setas/bolinhas só aparecem com 2+ unidades), 3 programas (FIES, Prouni, Pravaler)
  e **sem** o modal "Bolsa Permanência" (a UNA não o tem; `bolsa_modal_*` e `opens_modal` removidos).
- **Grupo Inspirali**: lockup único (`inspirali-einstein-lockup-una.png`), sem a linha de lockup mobile da UAM; novo booleano
  `no_value_style` nos cartões de estatística (só o cartão "Solidez Ecossistema Ânima" usa a borda clara). A máscara decorativa
  (`grupo-inspirali-broto-una.png`) é uma URL do File Manager dentro de `module.css`.
- **Seu futuro**: setas do carrossel usam `icon-chevron-*-nav-(active|disabled).svg`; `module.js` lê os ícones de `window.UNA_CARD_NAV_ICONS`.
- **FAQ**: 9 perguntas; formulário atrás de `show_form` (= `false`, como na UAM) — usa o módulo nativo de formulário
  (`{% form %}`); informe o GUID do formulário ao reativar.
- **Links**: todos os links reais já presentes em `UNA/src` (inscrição por aba, rodapé, redes sociais, matriz, Pravaler, mapa…) estão como defaults.
  Os `#` do modal de editais permanecem `#` (ainda sem URL final em `UNA/src`) e o valor de investimento ("R$XXX") também segue como no HTML estático.

## Imagens e PDFs: enviar ao File Manager antes de publicar

Os campos de imagem têm como default URLs de `https://51397625.fs1.hubspotusercontent-na1.net/hubfs/51397625/UNA-assets/<pasta>/<arquivo>`
(mesmo host/ID da UAM, pasta `UNA-assets`). **Nada foi enviado**: é preciso subir os arquivos de `UNA/src/public/`
para o File Manager em `UNA-assets/` com este mapeamento (o mesmo da UAM):

| Origem em `UNA/src/public/`                                                  | Destino no File Manager                                                                          |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `images/shared/*`                                                            | `UNA-assets/shared/`                                                                             |
| `images/*` (raiz) e `images/institucional/*`                                 | `UNA-assets/misc/`                                                                               |
| `images/campus-gallery/**`                                                   | `UNA-assets/campus-gallery/**`                                                                   |
| `images/docente/*`                                                           | `UNA-assets/docente/`                                                                            |
| `icons/*` usados em campos editáveis (ícones de abas, pilares, estatísticas) | `UNA-assets/field-icons/`                                                                        |
| `docs/*`                                                                     | `UNA-assets/docs/` (hoje vazio: os PDFs da matriz apontam para `estaticos.animaeducacao.com.br`) |

Arquivos referenciados (49):

- `UNA-assets/campus-gallery/` (5): `tucurui/enfermaria-simulada.jpg`, `tucurui/espaco-de-estudos.jpg`, `tucurui/laboratorio-morfofuncional-realidade-virtual.jpg`, `tucurui/laboratorio-morfofuncional.jpg`, `tucurui/sala-de-aprendizagem-ativa.jpg`
- `UNA-assets/docente/` (2): `daniel-voloski-guasselli.png`, `leonardo-savio-creao.png`
- `UNA-assets/field-icons/` (14): `icon-award.svg`, `icon-favourite.svg`, `icon-infinity.svg`, `icon-license-active.svg`, `icon-license-inactive.svg`, `icon-location-star.svg`, `icon-map-pin.svg`, `icon-school-active.svg`, `icon-school-inactive.svg`, `icon-shield-check.svg`, `icon-sync-alt-active.svg`, `icon-sync-alt-inactive.svg`, `icon-teacher.svg`, `icon-users.svg`
- `UNA-assets/misc/` (14): `dna-pillar-1-una.png`, `dna-pillar-2.png`, `dna-pillar-3.png`, `ecosystem-carousel-1.jpg`, `ecosystem-carousel-2.jpg`, `ecosystem-carousel-3.jpg`, `ecosystem-carousel-4.jpg`, `learning-environment.png`, `posgrad-1.jpg`, `posgrad-2.jpg`, `posgrad-3.jpg`, `posgrad-4.jpg`, `processo-seletivo-bg.png`, `video-cover.png`
- `UNA-assets/shared/` (14): `emec-qrcode.png`, `grupo-inspirali-broto-una.png`, `inspirali-einstein-lockup-una.png`, `logo-ages.svg`, `logo-anhembi-small.svg`, `logo-saojudas.svg`, `logo-una.svg`, `logo-unibh.svg`, `logo-unifacs.svg`, `logo-unifg.svg`, `logo-unisul.svg`, `logo-unp.svg`, `una-65-anos-badge.png`, `una-header-logo.png`

Ícones fixos (setas, redes sociais, busca, etc.) e `watermark-m.svg` continuam via `get_asset_url()` a partir de `templates/public/`
(Design Manager) — não precisam ir ao File Manager. Lembrete: `.webp`/`.ico` e vídeos não são aceitos pelo Design Manager.

## Estado da sincronização

Sincronizado com `UNA/src` após a segunda rodada de cores do Figma (paleta Inspirali com dourado `#b09435` /
`#313132` / areia `#898177` / cinza claro `#f3f4f6`; `#f7f8f8` só na Metodologia e no botão "Conheça a Una", como no Figma da UNA).
`css/`, `module.css` e os ícones de `public/icons` são cópia do `src` (os `module.css` mantêm só as URLs do File Manager
no lugar dos caminhos locais). O header continua com a logo única (`una-header-logo.png`, agora 72px de altura no desktop,
busca só com contorno `#313132` e CTA escuro `#313132`). Os ícones recoloridos que são lidos de campos
(`field-icons/`: `icon-school-active`, `icon-sync-alt-active`, `icon-license-active`, `icon-award`, `icon-users`, `icon-map-pin`,
`icon-shield-check`, `icon-teacher`, `icon-favourite`, `icon-location-star`) precisam ser reenviados ao File Manager.

## Próximos passos (antes de publicar)

1. Autenticar a HubSpot CLI (`hs init` / `hs auth`) na conta de destino.
2. Antes de qualquer `hs cms upload`: buscar/comparar o conteúdo remoto (fetch + diff) e **nunca** usar `--clean`.
3. Enviar as imagens ao File Manager conforme a tabela acima e conferir se as URLs dos defaults batem (principalmente nomes com acento/espaço).
4. Subir `UNA/src/templates/` ao Design Manager, criar a página com o template "Medicina - UNA" e revisar no preview do HubSpot.
5. Preencher título/meta descrição/canonical da página (o `base.html` usa `page_meta`; os valores da versão estática foram:
   título "Medicina UNA: Excelência Acadêmica Einstein | Inspirali", canonical `https://www.ibcmed.com.br/una/medicina`).
6. Quando o formulário for aprovado: criar no HubSpot, marcar `show_form` e informar o GUID.
