# Como editar textos e conteúdo no painel do HubSpot

> Guia de como os módulos HubL do tema IBCMED expõem campos editáveis e como alterá-los no editor do HubSpot — sem precisar de desenvolvedor para trocar textos, imagens e links.

## 1. O conceito: `fields.json` → campos do editor

Cada módulo (`<secao>.module/`) tem um **`fields.json`** que declara todos os campos editáveis. O HubSpot transforma cada item desse JSON em um campo no painel lateral do editor de páginas.

```jsonc
// exemplo de campo (fields.json)
{
  "name": "title",          // identificador usado no código
  "label": "Título",        // nome exibido no painel do HubSpot
  "type": "text",           // tipo do campo
  "default": "Onde a Medicina Acontece"   // valor inicial
}
```

E o `module.html` renderiza o valor com HubL:

```hubl
<h2 class="section-intro__title">{{ module.title }}</h2>
```

**Resultado:** quem edita a página vê um campo "Título" no painel; o que for digitado ali substitui `{{ module.title }}` no HTML final.

## 2. Tipos de campo usados no tema

| Tipo (`"type"`) | O que aparece no editor | Uso no tema |
|---|---|---|
| `text` | Caixa de texto simples | Títulos, eyebrows, legendas, números de estatísticas |
| `richtext` | Editor com formatação (negrito, parágrafo, link) | Textos de apoio, introduções, corpo de seções |
| `image` | Seletor de imagem do File Manager + alt text | Fotos de campus, capa de vídeo, ícones de pilares |
| `link` | Campo de URL + "abrir em nova aba" | Botões/CTAs, "Ver no mapa", link do vídeo |
| `file` | Seletor de arquivo (PDF) | Matrizes curriculares, editais |
| `boolean` | Toggle liga/desliga | `show_form`, `show_doubt_button` (formulários ainda não aprovados) |
| `group` + `occurrence` | Lista repetível de itens (adicionar/remover/reordenar) | Pilares do DNA, slides do ecossistema, fotos de campus, disciplinas, perguntas do FAQ, estatísticas |
| `color` / `font` | Seletor de cor / fonte | Só no `fields.json` global do tema (cores da marca, tipografia) |

## 3. Listas repetidas (`group`)

Itens que se repetem (ex.: slides do carrossel "Onde a Medicina Acontece") são um campo `group` com `occurrence`:

```jsonc
{
  "name": "slides",
  "type": "group",
  "occurrence": { "min": 1, "max": 8, "default": 4 },
  "children": [
    { "name": "image", "type": "image", ... },
    { "name": "eyebrow", "type": "text", ... },
    { "name": "subtitle", "type": "text", ... },
    { "name": "value", "type": "text", ... },
    { "name": "support_text", "type": "richtext", ... }
  ]
}
```

No editor isso vira uma lista onde cada item tem seus próprios campos — dá para **adicionar** um slide novo, **remover** ou **reordenar** arrastando, sem tocar em código. O `module.html` itera com `{% for slide in module.slides %}`.

## 4. Onde editar no painel

### Pela página (editor de conteúdo)

1. *Marketing → Website → Páginas* (ou Landing Pages).
2. Abra a página criada com o template `medicina-<inst>.html`.
3. Clique na seção da página → no painel lateral aparecem todos os campos daquele módulo (título, textos, botão, imagens, listas).
4. Edite e salve/publique.

> **Importante:** editar na página altera só aquela instância. O `default` do `fields.json` é o valor inicial de novas páginas — páginas já criadas guardam os valores próprios.

### Pelo Design Manager (default do módulo)

1. *Marketing → Arquivos e modelos → Ferramentas de design*.
2. Abra `modules/<secao>.module/fields.json` → ajuste o `"default"`.
3. Afeta apenas **novas instâncias** do módulo (e instâncias que ainda usam o default).

### Configurações globais do tema

O `fields.json` da raiz do tema (`<INST>/src/templates/fields.json`) tem cores da marca e fonte. No editor: *Editar → Tema → Editar configurações do tema*.

## 5. Mapa dos campos por seção (UNIFACS — mesmo padrão das demais)

| Seção / módulo | Campos principais |
|---|---|
| `processo-seletivo` | eyebrow, título, textos, abas de formas de ingresso, editais (modal), CTA de inscrição |
| `sobre-instituicao` | `video_cover_image`, `video_url`, `eyebrow`, `title`, `body_text` (richtext), `cta_label`, `cta_url` |
| `nosso-dna` | `eyebrow`, `title`, `intro_text`, `pillars` (grupo: foto, ícone, título, texto) |
| `matriz-curricular` | título, intro, grupo de unidades → disciplinas por período, PDFs (`file`) |
| `corpo-docente` | título, intro, grupo de docentes (foto, nome, titulação) |
| `campus` | `title`, `intro_text`, `panel_title`, `panel_text`, `campus_name`, `city`, `address_text`, `address_note`, `map_label`, `map_url`, `cta_label`, `cta_url`, `photos` (grupo de fotos da galeria) |
| `metodologia` | título, intro, itens/accordion da metodologia |
| `ecossistema` | `eyebrow`, `title`, `intro_text`, `slides` (grupo: imagem, eyebrow, subtitle, value, support_text) |
| `financiamentos` | título, intro, cards de financiamento/bolsas |
| `grupo-inspirali` | título, texto, estatísticas (grupo), logo |
| `seu-futuro` | título, intro, carrossel de cards de carreira |
| `faq-contato` | título, perguntas/respostas (grupo), `show_form` (boolean), `form_id` (GUID do formulário) |
| `header` / `footer` / `floating-contact` | logo, links de navegação, telefone, WhatsApp, `show_doubt_button` |

## 6. Casos especiais

- **Endereço do campus em 3 linhas:** `address_text` (linha 1), `address_note` (linha 2 — "Em Salvador, com transporte..."), `map_label` + `map_url` (linha 3 — "Ver no mapa"). Para mudar o destino do mapa, basta trocar a URL no campo `map_url`.
- **"Ver no mapa" some sozinho:** se `map_url` ficar vazio, o link não é renderizado (`{% if module.map_url.url.href %}`).
- **Formulário de contato:** não foi publicado. Para ativar: crie o formulário em *Marketing → Formulários*, copie o GUID, marque `show_form` = true e cole o GUID em `form_id`.
- **Imagens:** sempre suba para a pasta `<INST>-assets/` no File Manager antes e selecione pelo campo — não cole URLs externas.
- **JS dos carrosséis:** os dados (fotos, legendas, slides) são serializados pelo `module.html` em `<script type="application/json">` — o JS não precisa ser tocado ao editar conteúdo.

## 7. Fluxo para alterar um texto (resumo)

1. Texto novo chega (Figma ou time de conteúdo).
2. Se for ajuste pontual numa página já publicada → editar direto no editor da página.
3. Se for mudança do conteúdo-base → alterar `default` no `fields.json` (via Design Manager ou via `hs upload` do repo) **e** replicar no `modules/sections/<secao>/<secao>.html` + `pages/index.html` para manter a versão estática sincronizada.
4. Revisar no preview do HubSpot antes de publicar.
