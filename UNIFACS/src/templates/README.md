# UNIFACS/src/templates/ — Tema HubSpot (IBCMED - UNIFACS)

Conversão da página estática (`UNIFACS/src/pages/index.html` + `UNIFACS/src/modules/`)
para um tema HubSpot CMS (HubL), no mesmo padrão do tema da UAM
(`UAM/src/templates/`). **Nada foi enviado ao HubSpot** — o upload só acontece depois de
autenticar a CLI e com aprovação explícita (ver "Próximos passos").

## Estrutura

```
UNIFACS/src/templates/
  theme.json                 # metadados do tema ("IBCMED - UNIFACS")
  fields.json                # campos globais de estilo (cores/fonte da UNIFACS)
  templates/
    layouts/
      base.html              # <head> (Montserrat via Google Fonts), CSS do design system, mark.min.js, header/footer/page-search/video-modal
    medicina-unifacs.html    # template de página ("Medicina - UNIFACS") — monta os módulos de seção em ordem
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
    tokens.css, base.css, components/*.css   # cópia fiel de UNIFACS/src/css/ (carregada 1x em base.html)
  vendor/
    mark.min.js              # cópia de UNIFACS/src/vendor/mark.min.js
  public/
    icons/                   # ícones fixos referenciados via get_asset_url()
    images/shared/           # watermark-m.svg (financiamentos)
```

Cada `*.module/` segue o padrão HubSpot: `meta.json`, `fields.json` (campos editáveis),
`module.html` (HubL + `require_css`/`require_js` do próprio módulo), `module.css` e
`module.js` (quando a seção tem interatividade). A ordem das seções em
`medicina-unifacs.html` é a mesma de `UNIFACS/src/pages/index.html`.

## Decisões de conversão (iguais às da UAM)

- Todo texto, link e imagem é editável via `fields.json`; listas repetidas (links do
  header/rodapé, abas de ingresso, itens do modal de editais, pilares do DNA, unidades e
  disciplinas da matriz, coordenadores, fotos do campus, slides, programas de financiamento,
  estatísticas/linha do tempo/logos do Grupo Inspirali, cartões de pós-graduação e perguntas
  do FAQ) usam campos `group` com `occurrence`.
- **Formulário de contato (FAQ)** segue desativado por padrão (`show_form = false`), com HTML
  pronto usando o módulo nativo de formulário do HubSpot. A UNIFACS **não tem**
  `floating-contact` no `src` (o "Tem alguma dúvida?" também está desativado), então esse
  módulo não existe aqui e `base.html` não o carrega.
- **Campus**: a UNIFACS tem uma única unidade (Salvador — Professor Barros), sem chips de
  troca de campus e sem vídeo. As fotos vêm do grupo `photos` e são serializadas em
  `<script type="application/json" data-campus-json>` para o `module.js`. O endereço tem o
  link "Ver no mapa" como campos separados (`address_text`, `map_label`, `map_url`).
- **Matriz Curricular**: PDFs são campos `file` com os links reais (`estaticos.animaeducacao.com.br`)
  já preenchidos. As abas usam `unit-<índice>` como chave (a UAM usa `unit_key`, que não é um
  campo declarado).
- **Financiamentos**: um único slide de valor (sem setas); os indicadores só aparecem se for
  cadastrado um 2º campus. O card "Programa Bolsa Permanência" é só um link ("Veja mais", hoje
  com `#`) — sem o modal de documentos da UAM.
- **Header**: a logo da UNIFACS é uma única imagem combinada (ícone + nome + Excelência
  Acadêmica Einstein), igual à UNA — não há logo separada de parceiro nem logo mobile.
- **Seu Futuro / ícones de navegação**: os ícones de seta (ativo/desabilitado) vão para o JS via
  `window.UNIFACS_CARD_NAV_ICONS`; o ícone de play da galeria de campus via
  `window.UNIFACS_PLAY_ICON_URL` (ambos resolvidos com `get_asset_url`).
- **Grupo Inspirali**: o CSS usa `grupo-inspirali-broto-unifacs.png` como máscara
  (`mask-image`); a URL aponta para o File Manager (ver tabela abaixo).
- Tokens: marca `#4e8d97` (teal), escuro `#313132`, claro `#edf1f0`; fonte **Montserrat**
  (200–800), títulos grandes em ExtraBold — ver `css/tokens.css`.

## Pontos de atenção herdados do `src`

- **Modal de editais**: o conteúdo vem de `UNIFACS/src/modules/sections/processo-seletivo/edital-modal.html`
  (links finais, ícones `icon-plus-teal`/`icon-minus-teal`). `processo-seletivo.html` e
  `pages/index.html` ainda embutem uma versão antiga do modal (links `#` e ícones azuis) —
  **o tema usa a versão de `edital-modal.html`**.
- Os PDFs do modal de editais ainda são **`Uam_*`, herdados da UAM** (e o link de upload de
  documentos da Transferência Externa aponta para `www.anhembi.br`). Foram mantidos como estão
  no `src`; precisam ser trocados pelos documentos da UNIFACS quando disponíveis.
- Os campos "Investimento: 12 parcelas de R$XXX" das abas de ingresso ainda são placeholders no `src`.
- `UNIFACS/src/public/images/campus/UNIFACS/*` (nomes acentuados) e
  `images/shared/grupo-inspirali-broto-unifacs.png`: só o segundo é usado (máscara do CSS);
  as imagens de `campus/UNIFACS/` não são referenciadas por nenhum módulo.
- Os comentários dos CSS copiados ainda mencionam "UAM"/"Anhembi" (cópia fiel do `src`).

## Assets: enviar ao File Manager em `UNIFACS-assets/`

Os campos `image` usam, como default, URLs do File Manager no mesmo host/conta da UAM
(`https://51397625.fs1.hubspotusercontent-na1.net/hubfs/51397625/UNIFACS-assets/<caminho>`).
**Nada foi enviado ainda.** Envie os arquivos de `UNIFACS/src/public/` preservando a estrutura
abaixo (mesma convenção da UAM: `images/shared|docente|campus` mantêm a pasta; demais imagens
vão para `misc/`; ícones usados em campos de imagem vão para `field-icons/`):

| Origem | Destino no File Manager |
|---|---|
| `UNIFACS/src/public/images/campus/area-de-convivencia.jpg` | `UNIFACS-assets/campus/area-de-convivencia.jpg` |
| `UNIFACS/src/public/images/campus/biblioteca.jpg` | `UNIFACS-assets/campus/biblioteca.jpg` |
| `UNIFACS/src/public/images/campus/laboratorio-de-anatomia.jpg` | `UNIFACS-assets/campus/laboratorio-de-anatomia.jpg` |
| `UNIFACS/src/public/images/campus/laboratorio-de-simulacao-clinica.jpg` | `UNIFACS-assets/campus/laboratorio-de-simulacao-clinica.jpg` |
| `UNIFACS/src/public/images/campus/laboratorio-morfofuncional.jpg` | `UNIFACS-assets/campus/laboratorio-morfofuncional.jpg` |
| `UNIFACS/src/public/images/campus/simulacao-cuidados-neonatais.jpg` | `UNIFACS-assets/campus/simulacao-cuidados-neonatais.jpg` |
| `UNIFACS/src/public/images/docente/marcos-vinicius-silva.png` | `UNIFACS-assets/docente/marcos-vinicius-silva.png` |
| `UNIFACS/src/public/images/docente/mauricio-campos.png` | `UNIFACS-assets/docente/mauricio-campos.png` |
| `UNIFACS/src/public/icons/icon-award.svg` | `UNIFACS-assets/field-icons/icon-award.svg` |
| `UNIFACS/src/public/icons/icon-favourite.svg` | `UNIFACS-assets/field-icons/icon-favourite.svg` |
| `UNIFACS/src/public/icons/icon-infinity.svg` | `UNIFACS-assets/field-icons/icon-infinity.svg` |
| `UNIFACS/src/public/icons/icon-license-active.svg` | `UNIFACS-assets/field-icons/icon-license-active.svg` |
| `UNIFACS/src/public/icons/icon-license-inactive.svg` | `UNIFACS-assets/field-icons/icon-license-inactive.svg` |
| `UNIFACS/src/public/icons/icon-location-star.svg` | `UNIFACS-assets/field-icons/icon-location-star.svg` |
| `UNIFACS/src/public/icons/icon-map-pin.svg` | `UNIFACS-assets/field-icons/icon-map-pin.svg` |
| `UNIFACS/src/public/icons/icon-school-active.svg` | `UNIFACS-assets/field-icons/icon-school-active.svg` |
| `UNIFACS/src/public/icons/icon-school-inactive.svg` | `UNIFACS-assets/field-icons/icon-school-inactive.svg` |
| `UNIFACS/src/public/icons/icon-shield-check.svg` | `UNIFACS-assets/field-icons/icon-shield-check.svg` |
| `UNIFACS/src/public/icons/icon-sync-alt-active.svg` | `UNIFACS-assets/field-icons/icon-sync-alt-active.svg` |
| `UNIFACS/src/public/icons/icon-sync-alt-inactive.svg` | `UNIFACS-assets/field-icons/icon-sync-alt-inactive.svg` |
| `UNIFACS/src/public/icons/icon-teacher.svg` | `UNIFACS-assets/field-icons/icon-teacher.svg` |
| `UNIFACS/src/public/icons/icon-users.svg` | `UNIFACS-assets/field-icons/icon-users.svg` |
| `UNIFACS/src/public/images/dna-pillar-1-unifacs.png` | `UNIFACS-assets/misc/dna-pillar-1-unifacs.png` |
| `UNIFACS/src/public/images/dna-pillar-2-unifacs.png` | `UNIFACS-assets/misc/dna-pillar-2-unifacs.png` |
| `UNIFACS/src/public/images/dna-pillar-3-unifacs.png` | `UNIFACS-assets/misc/dna-pillar-3-unifacs.png` |
| `UNIFACS/src/public/images/ecosystem-carousel-1.jpg` | `UNIFACS-assets/misc/ecosystem-carousel-1.jpg` |
| `UNIFACS/src/public/images/ecosystem-carousel-2.jpg` | `UNIFACS-assets/misc/ecosystem-carousel-2.jpg` |
| `UNIFACS/src/public/images/ecosystem-carousel-3.jpg` | `UNIFACS-assets/misc/ecosystem-carousel-3.jpg` |
| `UNIFACS/src/public/images/ecosystem-carousel-4.jpg` | `UNIFACS-assets/misc/ecosystem-carousel-4.jpg` |
| `UNIFACS/src/public/images/metodologia/learning-environment.jpg` | `UNIFACS-assets/misc/learning-environment.jpg` |
| `UNIFACS/src/public/images/posgrad-unifacs-1.jpg` | `UNIFACS-assets/misc/posgrad-unifacs-1.jpg` |
| `UNIFACS/src/public/images/posgrad-unifacs-2.jpg` | `UNIFACS-assets/misc/posgrad-unifacs-2.jpg` |
| `UNIFACS/src/public/images/posgrad-unifacs-3.jpg` | `UNIFACS-assets/misc/posgrad-unifacs-3.jpg` |
| `UNIFACS/src/public/images/posgrad-unifacs-4.jpg` | `UNIFACS-assets/misc/posgrad-unifacs-4.jpg` |
| `UNIFACS/src/public/images/processo-seletivo-bg.png` | `UNIFACS-assets/misc/processo-seletivo-bg.png` |
| `UNIFACS/src/public/images/institucional/video-cover.png` | `UNIFACS-assets/misc/video-cover.png` |
| `UNIFACS/src/public/images/shared/emec-qrcode.png` | `UNIFACS-assets/shared/emec-qrcode.png` |
| `UNIFACS/src/public/images/shared/grupo-inspirali-broto-unifacs.png` | `UNIFACS-assets/shared/grupo-inspirali-broto-unifacs.png` |
| `UNIFACS/src/public/images/shared/inspirali-einstein-lockup-unifacs.png` | `UNIFACS-assets/shared/inspirali-einstein-lockup-unifacs.png` |
| `UNIFACS/src/public/images/shared/logo-ages.svg` | `UNIFACS-assets/shared/logo-ages.svg` |
| `UNIFACS/src/public/images/shared/logo-anhembi-small.svg` | `UNIFACS-assets/shared/logo-anhembi-small.svg` |
| `UNIFACS/src/public/images/shared/logo-saojudas.svg` | `UNIFACS-assets/shared/logo-saojudas.svg` |
| `UNIFACS/src/public/images/shared/logo-una.svg` | `UNIFACS-assets/shared/logo-una.svg` |
| `UNIFACS/src/public/images/shared/logo-unibh.svg` | `UNIFACS-assets/shared/logo-unibh.svg` |
| `UNIFACS/src/public/images/shared/logo-unifacs.svg` | `UNIFACS-assets/shared/logo-unifacs.svg` |
| `UNIFACS/src/public/images/shared/logo-unifg.svg` | `UNIFACS-assets/shared/logo-unifg.svg` |
| `UNIFACS/src/public/images/shared/logo-unisul.svg` | `UNIFACS-assets/shared/logo-unisul.svg` |
| `UNIFACS/src/public/images/shared/logo-unp.svg` | `UNIFACS-assets/shared/logo-unp.svg` |
| `UNIFACS/src/public/images/shared/unifacs-header-logo.png` | `UNIFACS-assets/shared/unifacs-header-logo.png` |

PDFs: a matriz curricular e os editais usam links externos (`estaticos.animaeducacao.com.br`),
então não há PDFs para enviar (`UNIFACS/src/public/docs/` está vazio).

Ícones fixos (SVG/PNG referenciados por `get_asset_url()` nos `module.html`) já estão copiados
em `public/icons/`, e `watermark-m.svg` em `public/images/shared/`; vão no upload do tema.

## Próximos passos (antes de publicar)

1. Autenticar a HubSpot CLI (`hs init` / `hs auth`) com a conta de destino.
2. Enviar as imagens ao File Manager (`UNIFACS-assets/`, tabela acima) e conferir se as URLs
   dos defaults batem (ajustar nos `fields.json` ou direto no editor, se necessário).
3. Antes de qualquer `hs cms upload`: buscar/comparar o conteúdo remoto (fetch + diff) e trazer
   para o projeto o que existir só no HubSpot. **Nunca usar `--clean`.**
4. Enviar `UNIFACS/src/templates/` ao Design Manager, criar a página com o template
   `medicina-unifacs.html` e revisar no preview antes de publicar.
5. Trocar os PDFs `Uam_*` do modal de editais pelos da UNIFACS e preencher os valores de
   investimento (R$XXX).
6. Quando o formulário for aprovado, criar o formulário no HubSpot, ativar `show_form` e
   selecionar o formulário no campo "Formulário HubSpot".
