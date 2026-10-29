# UNISUL/src/templates/ — Tema HubSpot (IBCMED - UNISUL)

Conversão da página estática (`UNISUL/src/pages/index.html` + `UNISUL/src/modules/`)
para um tema HubSpot CMS (HubL), no mesmo padrão dos temas da UAM, UNA e UNIFACS
(`<INSTITUICAO>/src/templates/`). **Nada foi enviado ao HubSpot** — o upload só acontece depois de
autenticar a CLI e com aprovação explícita (ver "Próximos passos").

## Estrutura

```
UNISUL/src/templates/
  theme.json                 # metadados do tema ("IBCMED - UNISUL")
  fields.json                # campos globais de estilo (cores/fonte da UNISUL)
  templates/
    layouts/
      base.html              # <head> (Bricolage Grotesque via Google Fonts), CSS do design system, mark.min.js, header/footer/page-search/video-modal
    medicina-unisul.html     # template de página ("Medicina - UNISUL") — monta os módulos de seção em ordem
  modules/
    header.module/           # compartilhado
    footer.module/           # compartilhado
    page-search.module/      # compartilhado — busca Ctrl+F (mark.js)
    video-modal.module/      # compartilhado — vídeo do YouTube em modal
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
    faq-contato.module/      # inclui o formulário (desativado por padrão)
  css/
    tokens.css, base.css, components/*.css   # cópia fiel de UNISUL/src/css/ (carregada 1x em base.html)
  vendor/
    mark.min.js              # cópia de UNISUL/src/vendor/mark.min.js
  public/
    icons/                   # ícones fixos referenciados via get_asset_url()
    images/shared/           # watermark-m.svg (financiamentos)
```

Cada `*.module/` segue o padrão HubSpot: `meta.json`, `fields.json` (campos editáveis),
`module.html` (HubL + `require_css`/`require_js` do próprio módulo), `module.css` e
`module.js` (quando a seção tem interatividade). A ordem das seções em
`medicina-unisul.html` é a mesma de `UNISUL/src/pages/index.html`.

## Decisões de conversão

- Todo texto, link e imagem é editável via `fields.json`; listas repetidas (links do
  header/rodapé, abas de ingresso, itens do modal de editais, pilares do DNA, unidades e
  disciplinas da matriz, coordenadores, fotos do campus, slides, programas de financiamento,
  estatísticas/linha do tempo/logos do Grupo Inspirali, cartões de pós-graduação e perguntas
  do FAQ) usam campos `group` com `occurrence`.
- **Tipografia diferente da UAM/UNA/UNIFACS**: a UNISUL mantém **Bricolage Grotesque**
  (estilos "ANIMA/\*" do Figma — títulos ExtraBold, corpo Light/Regular). As demais
  instituições usam Montserrat. Os pesos de fonte dos CSS seguem o Figma da UNISUL.
- **Paleta própria**: marca `#507b82` (teal acinzentado), escuro `#313132`, claro `#edf1f0`,
  apoio/areia `#7a6f66` (CTAs sólidos, fundo do Ecossistema, convite do rodapé) — ver
  `css/tokens.css` e `fields.json` do tema.
- **Formulário de contato (FAQ)** segue desativado por padrão (`show_form = false`), com HTML
  pronto usando o módulo nativo de formulário do HubSpot. A UNISUL **não tem**
  `floating-contact` no `src`, então esse módulo não existe aqui e `base.html` não o carrega.
- **Campus**: duas unidades (Palhoça e Tubarão), com chips de troca. As fotos vêm do grupo de
  campi e são serializadas em `<script type="application/json" data-campus-json>` para o
  `module.js`, de modo que o carrossel genérico continua reaproveitável.
- **Ícones de navegação / play**: os ícones de seta do carrossel (ativo/desabilitado) vão para
  o JS via `window.UNISUL_CARD_NAV_ICONS` e o ícone de play da galeria de campus via
  `window.UNISUL_PLAY_ICON_URL` (ambos resolvidos com `get_asset_url`).
- **Matriz Curricular**: PDFs são campos `file` com os links reais (`estaticos.animaeducacao.com.br`)
  já preenchidos; `UNISUL/src/public/docs/` está vazio, então não há PDFs para enviar.

## Pontos de atenção herdados do `src`

- O modal de editais ainda contém documentos **`Uam_*` herdados da UAM** e três inscrições
  (Portador de Diploma, Certificações, Retorno) que apontam para concursos da UAM
  (`18429`, `18436`, `18441`). A UNISUL só tem inscrição própria para **Enem (`18400`)** e
  **Transferência Externa (`18505`)**; as demais precisam ser trocadas ou removidas.
- Os campos "Investimento: 12 parcelas de R$XXX" das abas de ingresso ainda são placeholders.
- O "X (Twitter)" do rodapé fica com `#`: o link do arquivo de redirecionamentos para a UNISUL
  aponta para o YouTube, então não há URL válida.
- Os comentários dos CSS copiados ainda mencionam "UAM" (cópia fiel do `src`).

## Assets: enviar ao File Manager em `UNISUL-assets/`

Os campos `image` usam, como default, URLs do File Manager no mesmo host/conta da UAM
(`https://51397625.fs1.hubspotusercontent-na1.net/hubfs/51397625/UNISUL-assets/<caminho>`).
**Nada foi enviado ainda.** Envie os arquivos de `UNISUL/src/public/` com este mapeamento:

| Origem (`UNISUL/src/public/`)                                                                                                                                                                                                                                                                                | Destino no File Manager                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| `images/campus-gallery/palhoca/*.jpg` (6)                                                                                                                                                                                                                                                                    | `UNISUL-assets/campus-gallery/palhoca/`       |
| `images/campus-gallery/tubarao/*.jpg` (7)                                                                                                                                                                                                                                                                    | `UNISUL-assets/campus-gallery/tubarao/`       |
| `images/docente/*.jpg` (4: fabiana-gama, jefferson-traebert, thais-sousa, thami-souza)                                                                                                                                                                                                                       | `UNISUL-assets/docente/`                      |
| `images/shared/` — `emec-qrcode.png`, `inspirali-einstein-lockup-unisul.png`, `unisul-header-logo.png`, `logo-ages.svg`, `logo-anhembi-small.svg`, `logo-saojudas.svg`, `logo-una.svg`, `logo-unibh.svg`, `logo-unifacs.svg`, `logo-unifg.svg`, `logo-unisul.svg`, `logo-unp.svg`                            | `UNISUL-assets/shared/`                       |
| `icons/` — `icon-award`, `icon-favourite`, `icon-infinity`, `icon-license-active`, `icon-license-inactive`, `icon-location-star`, `icon-map-pin`, `icon-school-active`, `icon-school-inactive`, `icon-shield-check`, `icon-sync-alt-active`, `icon-sync-alt-inactive`, `icon-teacher`, `icon-users` (`.svg`) | `UNISUL-assets/field-icons/`                  |
| `images/dna-pillar-1-unisul.png`, `dna-pillar-2-unisul.png`, `dna-pillar-3-unisul.png`, `ecosystem-carousel-1..4.jpg`, `posgrad-unisul-1..4.jpg`, `processo-seletivo-bg.png`                                                                                                                                 | `UNISUL-assets/misc/`                         |
| `images/metodologia/learning-environment.jpg`                                                                                                                                                                                                                                                                | `UNISUL-assets/misc/learning-environment.jpg` |
| `images/institucional/video-cover.png`                                                                                                                                                                                                                                                                       | `UNISUL-assets/misc/video-cover.png`          |

Ícones fixos (SVG/PNG referenciados por `get_asset_url()` nos `module.html`) já estão copiados
em `public/icons/`, e `watermark-m.svg` em `public/images/shared/`; vão no upload do tema.

## Próximos passos (antes de publicar)

1. Autenticar a HubSpot CLI (`hs init` / `hs auth`) com a conta de destino.
2. Enviar as imagens ao File Manager (`UNISUL-assets/`, tabela acima) e conferir se as URLs
   dos defaults batem (ajustar nos `fields.json` ou direto no editor, se necessário).
3. Antes de qualquer `hs cms upload`: buscar/comparar o conteúdo remoto (fetch + diff) e trazer
   para o projeto o que existir só no HubSpot. **Nunca usar `--clean`.**
4. Enviar `UNISUL/src/templates/` ao Design Manager, criar a página com o template
   `medicina-unisul.html` e revisar no preview antes de publicar.
5. Trocar os documentos `Uam_*` e os concursos herdados da UAM no modal de editais, e preencher
   os valores de investimento (R$XXX).
6. Quando o formulário for aprovado, criar o formulário no HubSpot, ativar `show_form` e
   selecionar o formulário no campo "Formulário HubSpot".
