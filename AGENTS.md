# Regras e Comandos do Projeto IBCMED (HubSpot CMS)

Este arquivo reúne o fluxo de trabalho para desenvolvedores que colaborarem no tema do site **IBCMED** (Inspirali) no HubSpot CMS. O processo: construir páginas localmente em HTML/CSS/JS simples a partir do **Figma**, revisar, depois converter para templates/módulos HubL e publicar via CLI.

---

## 1. Sobre o projeto

O IBCMED reúne páginas de divulgação do curso de Medicina em diferentes faculdades parceiras da Inspirali. Cada página apresenta o curso de Medicina de uma instituição específica, e **cada instituição vive em sua própria pasta na raiz do repositório** (ver seção 3) — hoje só `UAM/` existe; `UNIFACS/` e as demais serão criadas seguindo exatamente o mesmo padrão (ver seção 3.2).

### Fonte da verdade: Figma (não mais os sites públicos das instituições)

> **Mudança de processo:** o projeto deixou de usar as páginas públicas de cada instituição como fonte da verdade. A partir de agora, toda página nasce do arquivo Figma **"Redesign - Páginas IES"**:
> `https://www.figma.com/design/IiZ3Zct5TP6nxPirunSyhk/Redesign---P%C3%A1ginas-IES`
>
> Cada instituição tem (ou terá) sua própria página dentro desse arquivo Figma, com conteúdo, imagens e textos já definidos pelo time de design. O trabalho de implementação consiste em:
> 1. Localizar o node-id da página da instituição no Figma (pedir ao responsável o link com `node-id` se não estiver disponível).
> 2. Usar o MCP do Figma (`figma-remote-mcp-server`) — `get_metadata` para mapear a estrutura de seções, `get_design_context` (com a skill `figma-design-to-code` carregada antes) para extrair textos, tokens de design e assets de cada seção, e `get_screenshot` para conferência visual.
> 3. Baixar todos os assets (imagens/ícones) referenciados pelo Figma para `<INSTITUICAO>/src/public/images/` — nunca deixar URLs temporárias do Figma (`figma.com/api/mcp/asset/...`) no código.
> 4. Reconstruir a página em HTML/CSS/JS próprios (ver estrutura de pastas abaixo), seguindo fielmente layout, hierarquia, cores, tipografia e espaçamento do Figma — sem usar Tailwind nem o código React gerado pelo MCP diretamente (ele é só referência).
> 5. Aplicar responsividade (o Figma normalmente só tem o desktop desenhado) seguindo boas práticas de breakpoints (ver seção 5).
>
> Páginas já implementadas:
>
> | Instituição | Node-id Figma | Status |
> |---|---|---|
> | UAM (Anhembi Morumbi) | `523:29919` ("Desktop", página "Redesign - Páginas IES") | HTML/CSS/JS aprovado em `UAM/src/pages/` + `UAM/src/modules/sections/*` — **piloto/referência de estrutura para as próximas instituições**. Convertido para tema HubSpot (HubL) em `UAM/src/templates/` (ver `UAM/src/templates/README.md`); ainda não publicado — falta autenticar a HubSpot CLI, enviar imagens/PDFs ao Design Manager/File Manager e revisar no preview antes de publicar. |
> | UNIFACS | — | A definir com o time de design |
> | AGES, UNIFG, FASEH, USJT, UNP, UNA, UNIBH, UNISUL | — | A definir com o time de design |

---

## 2. Extraindo uma página do Figma

Antes de construir qualquer página nova:

1. Peça/confirme o link do Figma com `node-id` da página da instituição.
2. Rode `get_metadata` no node para mapear todas as seções (frames) filhas.
3. Para cada seção principal, rode `get_design_context` (sempre após carregar a skill `figma-design-to-code`) para obter texto, tokens (`cor`, `spacing`, `radius`, `font`) e URLs de assets.
4. Baixe os assets com `curl` para `<INSTITUICAO>/src/public/images/` (fotos) e `<INSTITUICAO>/src/public/icons/` (ícones/SVGs).
5. Nunca edite os arquivos de referência brutos (prints, metadados) — eles só servem de apoio durante a implementação.

---

## 3. Estrutura do projeto

### 3.1 Regra principal: uma pasta por instituição na raiz

Cada instituição é **autocontida**: todo o código, estilos, módulos e assets dela vivem dentro da sua própria pasta na raiz do repositório (`IBCMED/<INSTITUICAO>/...`). Não existe uma pasta "shared" na raiz — se um dia duas instituições precisarem literalmente do mesmo arquivo (ex.: o mesmo ícone), ele é copiado para dentro da pasta de cada uma, não referenciado de um lugar central. Isso mantém cada instituição 100% independente (pode ser movida, arquivada ou entregue sozinha sem quebrar nada).

```
ibcmed/
  AGENTS.md                          # este arquivo
  README.md
  UAM/                                # tudo da Anhembi Morumbi vive aqui dentro
    src/
      pages/
        index.html                   # monta a página colando o HTML de cada módulo — pronta para revisão visual
      modules/
        shared/                      # módulos de "chrome" da página, reaproveitados entre as seções desta instituição
          header/
            header.html
            header.css
            header.js
          footer/
            footer.html
            footer.css
          floating-contact/          # widget flutuante "Ligue já!" / "Tem alguma dúvida?" / WhatsApp
          page-search/               # busca "Ctrl+F" customizada (mark.js)
        sections/                    # um módulo por seção principal da página (1:1 com os frames do Figma)
          processo-seletivo/
            processo-seletivo.html
            processo-seletivo.css
            processo-seletivo.js     # só quando a seção tem interatividade própria
            edital-modal.html/.css   # sub-componentes da seção ficam juntos dela
          sobre-instituicao/
          nosso-dna/
          matriz-curricular/
          corpo-docente/
          campus/
          metodologia/
          ecossistema/
          financiamentos/
          grupo-inspirali/
          seu-futuro/
          faq-contato/
      css/
        tokens.css                   # cores, tipografia, espaçamento e radius extraídos do Figma (ver seção 4)
        base.css                     # reset + estilos base + `.section` genérica + utilitários (botões, links, container)
        components/                  # CSS de padrões de UI reaproveitados por várias seções desta instituição
          accordion.css              # disclosures (ex.: Metodologia, FAQ, modal de editais)
          cards.css                  # cartões (info-card, discipline-card, stat-card, posgrad-card...)
          tabs.css                   # abas (Processo seletivo, Matriz Curricular)
          carousel.css               # carrosséis (Ecossistema, Seu Futuro na Medicina)
      vendor/
        mark.min.js                  # bibliotecas de terceiros vendorizadas localmente (nunca via CDN)
      public/
        images/
          shared/                    # logos/selos usados em mais de uma seção desta instituição (Inspirali, e-MEC, parceiros)
          campus-gallery/, docente/, institucional/, ...   # fotos específicas de cada seção
        icons/                       # ícones SVG usados nesta instituição
        docs/                        # PDFs (matrizes curriculares, editais)
      templates/                     # reservado para a fase de conversão HubSpot desta instituição (ver 3.3)

  UNIFACS/                           # futura instituição — mesma estrutura exata de UAM/ (ver 3.2)
    src/
      pages/
      modules/
        shared/
        sections/
      css/
      vendor/
      public/
      templates/
```

Todos os caminhos referenciados em HTML/CSS/JS são **absolutos a partir da raiz do site**, sempre prefixados pela pasta da instituição e por `src/`: `/UAM/src/css/...`, `/UAM/src/modules/...`, `/UAM/src/public/...`, `/UAM/src/vendor/...`. Isso é o que permite servir `UAM/` e `UNIFACS/` lado a lado sem colisão de rotas.

### 3.2 Regra obrigatória: analisar a estrutura da UAM antes de criar uma nova instituição

**`UAM/` é o modelo de referência estrutural para todas as próximas instituições.** Antes de começar a implementar uma nova instituição (ex.: UNIFACS), é obrigatório:

1. **Ler a árvore completa de `UAM/`** (`modules/shared/*`, `modules/sections/*`, `css/*`, `public/*`) para entender quais seções/módulos existem e como cada um é organizado (HTML + CSS + JS separados, nomes de classes, convenções de `data-*` para JS).
2. **Reaproveitar a mesma divisão de seções** sempre que o Figma da nova instituição tiver conteúdo equivalente (ex.: toda instituição deve ter `processo-seletivo/`, `matriz-curricular/`, `campus/`, `faq-contato/`, etc., mesmo que o conteúdo interno mude). Só crie uma seção nova se o Figma realmente tiver algo sem equivalente na UAM.
3. **Copiar os módulos `shared/` da UAM como ponto de partida** (`header`, `footer`, `floating-contact`, `page-search`) e ajustar apenas conteúdo/identidade visual (logo, cores de marca se a instituição tiver outra, links) — a estrutura de arquivos e o comportamento em JS devem continuar os mesmos.
4. **Copiar `src/css/tokens.css`, `src/css/base.css` e `src/css/components/*` como ponto de partida**, atualizando só os valores de tokens que o Figma da nova instituição definir diferente (cor de marca, fonte, etc.) — a lista de variáveis e a nomenclatura devem continuar idênticas (ver seção 4) para manter a conversão para HubL previsível.
5. **Seguir o mesmo padrão de composição**: `pages/index.html` cola o HTML de cada módulo em ordem e referencia os respectivos `.css`/`.js` com cache-busting (`?v=<timestamp>`), exatamente como em `UAM/src/pages/index.html`.
6. Só depois de replicar a estrutura, aplicar as diferenças reais de conteúdo/design que o Figma da nova instituição trouxer.

Resumindo: **a estrutura é sempre a mesma — só as informações, mídias e eventualmente os tokens de cor/fonte mudam entre instituições.**

### 3.3 Templates HubSpot: um por instituição

Diferente de uma versão anterior deste documento, **não existe mais uma pasta `templates/` compartilhada na raiz**. Cada instituição tem sua própria `src/templates/` (ex.: `UAM/src/templates/`), reservada para a fase de conversão HubSpot daquela instituição especificamente. Enquanto a página está em construção/aprovação como HTML/CSS/JS puro, essa pasta fica praticamente vazia (só com um `README.md` explicando o destino). Quando a página for aprovada visualmente, ela é portada para lá seguindo a estrutura de tema do HubSpot (`theme.json`, `fields.json`, `templates/layouts/base.html`, `modules/<secao>.module/...`), uma seção por módulo, espelhando `src/modules/sections/` da mesma instituição.

**`UAM/src/templates/` já está convertida e serve de referência/modelo para a conversão das próximas instituições** (ver `UAM/src/templates/README.md` para detalhes de cada decisão). Pontos a replicar ao converter uma nova instituição:
- Um `*.module/` por seção (`meta.json` + `fields.json` + `module.html` + `module.css`/`module.js` quando houver), 1:1 com `src/modules/sections/<secao>/`.
- Todo texto/imagem/link vira campo editável (`fields.json`); listas repetidas (pilares, estatísticas, fotos de campus, disciplinas da matriz, perguntas do FAQ, etc.) usam campos `group` com `occurrence`.
- CSS/JS de design system (`tokens.css`, `base.css`, `components/*.css`, `vendor/mark.min.js`) são copiados para `templates/css/` e `templates/vendor/` e carregados uma única vez em `templates/layouts/base.html` — não duplicar em cada módulo.
- Formulários ainda não aprovados ficam atrás de um campo booleano (`show_form`/`show_doubt_button` = `false`) em vez de comentados no HTML, para que o cliente possa reativá-los pelo editor do HubSpot sem precisar de um desenvolvedor.
- Upload ao HubSpot só acontece depois de autenticar a CLI e com aprovação explícita — ver seção 6.

### Regras de modularização

- **Um módulo por seção principal da página** (1:1 com os frames do Figma), cada um com seu próprio `<secao>.html` + `<secao>.css` (+ `<secao>.js` quando necessário), em `<INSTITUICAO>/src/modules/sections/<secao>/`.
- Header, footer, widget de contato flutuante e busca em página são módulos **compartilhados dentro da instituição**: `<INSTITUICAO>/src/modules/shared/<modulo>/`.
- Padrões de UI reaproveitados por múltiplas seções (botões, abas, carrosséis, accordions, cartões) ficam em `<INSTITUICAO>/src/css/components/` — evita duplicar CSS igual em vários módulos. Tokens de design e reset ficam em `<INSTITUICAO>/src/css/tokens.css`/`base.css`.
- Bibliotecas de terceiros (ex.: `mark.js`) são **vendorizadas localmente** em `<INSTITUICAO>/src/vendor/` — nunca carregadas via CDN externo (consistência offline, sem dependência de terceiros em produção).
- Inglês para nomes de pastas, arquivos, classes CSS e variáveis. Português apenas no conteúdo visível.
- Imagens com `get_asset_url('../images/arquivo.png')` nos módulos HubL (fase de conversão), e caminho absoluto a partir da raiz (`/UAM/src/public/images/...`) nas páginas estáticas.
- Antes de ir para o HubSpot, toda página nasce como módulos HTML/CSS/JS simples em `<INSTITUICAO>/src/modules/`, compostos em `<INSTITUICAO>/src/pages/index.html` para revisão visual, só depois convertida em módulos HubL dentro de `<INSTITUICAO>/src/templates/`/`ibcmed-theme/`.
- Ao converter para HubL, cada módulo de `<INSTITUICAO>/src/modules/sections/<secao>/` vira um módulo HubL (`ibcmed-theme/modules/<secao>.module/`) — a estrutura já nasce 1:1 com o destino final.

---

## 4. Design system (tokens, componentes e padrões visuais)

Estes valores vêm de `UAM/src/css/tokens.css` e `UAM/src/css/base.css`, extraídos do Figma. **Toda nova instituição parte destes mesmos tokens e nomes de variável**, ajustando apenas os valores que o Figma dela definir diferente (ex.: outra cor de marca), nunca a nomenclatura.

### 4.1 Cores (`--surface-*`, `--text-*`, `--border-*`)

| Papel | Variável | Valor (UAM) |
|---|---|---|
| Superfície invertida/branca | `--surface-inverted`, `--surface-primary` | `#ffffff` |
| Superfície sutil (seções alternadas) | `--surface-primary-subtle` | `#f4f7f6` |
| Superfície sutil secundária (cards) | `--surface-secondary-subtle` | `#edf1f0` |
| Cor de marca (teal) | `--surface-brand-primary` / `--text-brand` / `--border-brand-primary` | `#00796a` |
| Marca — tom escuro (hover de botões) | `--surface-brand-primary-dark` | `#002924` |
| Marca — tom claro (fundos de destaque) | `--surface-brand-primary-light` | `#ddeae6` |
| Marca — tint leve (fundo de seção) | `--surface-brand-tint` / `--surface-brand-tint-strong` | `rgba(221,234,230,.25)` / `.75` |
| Marca — fundo suave (hover sutil) | `--surface-brand-soft` | `rgba(0,121,106,.12)` |
| Texto de título | `--text-heading` | `#111827` |
| Texto de corpo | `--text-primary-dark` | `#555046` |
| Texto secundário | `--text-secondary-dark` | `#83746a` |
| Texto sobre fundo escuro (footer) | `--text-footer` / `--text-footer-muted` | `#f5f5f5` / `#cccccc` |
| Borda neutra | `--border-primary-light` | `#c9c8be` |
| Borda de marca (soft) | `--border-brand-soft` | `rgba(0,121,106,.2)` |

### 4.2 Tipografia

- **Fonte base**: `Marcellus` (serifada) para **tudo** no site da UAM — títulos, corpo, labels, botões — por decisão explícita do responsável, mesmo quando o Figma usa `Figtree` em rótulos/corpo. Essa decisão é específica da UAM; confirme com o responsável se a próxima instituição deve seguir o mesmo caminho ou usar duas fontes como o Figma dela indicar.
- Escala de tamanho (`--font-size-*`): `xxs 12px · xs 14px · sm 16px · md 18px · lg 20px · xl 24px · 2xl 32px · 3xl 40px · 4xl 48px`.
- Alturas de linha: `tight 1.16` (títulos) · `snug 1.2` · `relaxed 1.4` (corpo de texto).
- Pesos disponíveis: `regular 400 · bold 700 · extrabold 800` — **títulos grandes em Marcellus usam sempre `regular`** (o Figma define os títulos como Marcellus Regular; aplicar `bold`/`extrabold` neles gera negrito sintético e destoa do Figma). `bold`/`extrabold` ficam para eyebrows, labels de pill, abas ativas e botões.

### 4.3 Espaçamento (`--spacing-*`)

Escala em múltiplos de 4px: `micro 4px · extra-small 8px · small 12px · medium 16px · large 24px · extra-large 32px`. Use sempre essas variáveis em vez de valores fixos — gaps, paddings e margins de módulos novos devem se encaixar nessa escala.

### 4.4 Raio de borda (`--radius-*`)

`extra-small 4px · small 8px · medium 16px · large 24px · total 999px (pill/círculo)`.

- Botões e cards "quadriculados" (menos arredondados): `--radius-small` (8px) — ex.: CTAs, cards de financiamento, painéis do widget flutuante.
- Chips, badges, carrosséis em destaque: `--radius-medium`/`--radius-large`.
- Botões/pills totalmente arredondados (chip de campus, dots): `--radius-total`.

### 4.5 Grid / container

- Largura máxima de conteúdo: `--page-max-width: 1440px`.
- Gutter lateral: `--page-gutter: 112px` (desktop) → `--page-gutter-tablet: 48px` (≤1280px) → `--page-gutter-mobile: 20px` (≤640px).
- `.section` (classe base de toda seção) já aplica `padding: 64px <gutter responsivo>` e centraliza o conteúdo — não reinvente isso em módulos novos, estenda com `.section--subtle`/`.section--tint`/`.section--tint-strong` para variações de fundo.

### 4.6 Botões (`.btn`, `.spiral-cta`, `.financing-highlight`...)

- Botão base `.btn`: `padding: 12px 24px` (`--spacing-small --spacing-large`), `border-radius: var(--radius-small)`, `font-weight: bold`, `transition: 0.4s ease` em `background-color`/`color`/`border-color` (toda transição de hover do site usa **0.4s**, nunca instantâneo nem mais rápido que isso).
  - `.btn-primary`: fundo `--surface-brand-primary`, texto branco; hover escurece para `--surface-brand-primary-dark`.
  - `.btn-outline`: transparente com borda `--border-brand-primary`; hover preenche com `--surface-brand-primary-light`.
  - `.btn-pill`: mesma lógica do `.btn-primary`, mas `border-radius: var(--radius-total)` e padding menor — usado em chips/tags.
- CTAs grandes (ex.: "Baixar matriz curricular", "Conheça mais da unidade"): altura fixa de **64px**, padding `20px 24px`, `border-radius: var(--radius-small)`, ícone à direita. Hover padrão dessas CTAs: fundo `#C9D1DC`, texto `#545B8E` — a **borda original não muda no hover**, a menos que o Figma peça explicitamente uma cor de borda de hover diferente (ex.: `#212872`, usado em "Baixar matriz curricular"/"Conheça mais da unidade").
- Nunca deixe uma transição de hover sem `transition` declarada — todo elemento interativo (botão, link, chip, aba) precisa de transição suave.

### 4.7 Cards, abas e accordions

- Cards informativos (`info-card`, `discipline-card` etc. em `src/css/components/cards.css`) usam `--surface-secondary-subtle` como fundo e `--radius-small`.
- Abas (`src/css/components/tabs.css`) seguem o padrão: aba ativa em `bold`/cor de marca, abas inativas em `regular`/cinza, conteúdo trocado via `[hidden]` + JS (`data-tab`/`data-tab-panel`).
- Accordions (`src/css/components/accordion.css`) usam animação de altura via `grid-template-rows: 0fr → 1fr` (preferir a técnica de `max-height`/`grid-template-rows` com `overflow: hidden` no wrapper interno — **nunca** com padding direto no elemento que anima, isso vaza conteúdo durante a transição).

---

## 5. Responsividade

- O Figma normalmente só define o layout desktop (1440px). Não copie pixel a pixel sem adaptar: aplique breakpoints padrão (`1280px`, `1024px`, `860px`, `640px`) usando `flex-wrap`, reordenação de colunas e ajuste de paddings (`--page-gutter` → `--page-gutter-tablet` → `--page-gutter-mobile`, definidos em `src/css/tokens.css`).
- Teste sempre em desktop, tablet e mobile antes de considerar a página pronta.
- Caso o Figma tenha telas mobile/tablet específicas para a instituição, priorize-as sobre a adaptação automática.

---

## 6. Contas HubSpot

| Conta | Tipo | Uso |
|---|---|---|
| *(a definir)* | Sandbox | Ambiente de testes do IBCMED |
| *(a definir)* | Produção | Conta de produção do IBCMED |

> Preencher esta tabela assim que as contas forem criadas/autenticadas. Ver o projeto MedRoom (`medroom-site-testes/AGENTS.md`) para o passo a passo completo de autenticação via Personal Access Key — o processo de instalação e autenticação da CLI é idêntico, só muda a conta de destino.

---

## 7. Regras obrigatórias (idênticas ao projeto MedRoom)

- **Nunca envie nada para o HubSpot sem perguntar ao desenvolvedor responsável se está tudo pronto.**
- **Antes de qualquer `hs cms upload`, verifique se há algo no HubSpot que não existe no projeto local** (fetch + diff) e traga para o projeto antes de subir.
- **Nunca use `hs cms upload --clean`** — a flag apaga a pasta inteira no Design Manager antes de subir, destruindo qualquer arquivo que exista só no HubSpot.
- Salve todos os arquivos do tema em **UTF-8 sem BOM** (BOM impede o HubSpot de ler as anotações do topo dos templates).
- `.webp` e `.ico` não são aceitos pelo Design Manager — converta para `.png`/`.jpg` antes de subir.
- Vídeos não são aceitos pelo Design Manager — suba pelo File Manager (`hs filemanager upload`) e referencie a URL fixa resultante diretamente, sem `get_asset_url`.
- Sempre valide a página no preview do HubSpot antes de publicar.

---

## 8. Checklist por instituição

Para cada instituição nova, ao criar a página:

- [ ] **Analisou a estrutura de `UAM/` (seção 3.2) antes de começar** e reaproveitou a mesma divisão de módulos/seções.
- [ ] Conteúdo, textos e imagens fiéis ao Figma daquela instituição.
- [ ] Nenhuma URL temporária do Figma (`figma.com/api/mcp/asset/...`) restante no código — todos os assets baixados para `<INSTITUICAO>/src/public/`.
- [ ] Nenhuma biblioteca de terceiros via CDN — tudo vendorizado em `<INSTITUICAO>/src/vendor/`.
- [ ] Header, footer, widget de contato e busca reaproveitados a partir de `UAM/src/modules/shared/*` (ajustando só conteúdo/identidade).
- [ ] Tokens de design (`src/css/tokens.css`) partindo dos valores da UAM, só trocando o que o Figma da instituição define diferente.
- [ ] Responsividade testada (desktop, tablet, mobile).
- [ ] HTML semântico, com `alt` descritivo em imagens e hierarquia de headings (`h1` único, `h2`/`h3` em sequência).
- [ ] SEO: `<title>`, meta descrição, `canonical`, Open Graph e dados estruturados (`schema.org/Course`) definidos.
- [ ] Imagens via `get_asset_url` no HubL (fase de conversão).
- [ ] Formulário de contato/inscrição (se aplicável) configurado com o endpoint correto.
- [ ] Testado no preview do HubSpot antes de publicar.

---

## 9. Próximos passos

1. Revisar visualmente `UAM/src/pages/index.html` (piloto, construído a partir do Figma) com o time responsável.
2. Definir e autenticar as contas HubSpot (sandbox e produção) do IBCMED na CLI.
3. Após aprovação do piloto, criar a estrutura inicial de `ibcmed-theme/` (layout base, header, footer) e converter cada módulo de `UAM/src/modules/sections/*` em um módulo HubL dentro de `UAM/src/templates/`.
4. Repetir o fluxo Figma → `<INSTITUICAO>/src/modules/` → `<INSTITUICAO>/src/pages/` → aprovação → conversão HubL → upload para as demais instituições, conforme as telas forem disponibilizadas no Figma — **sempre partindo da estrutura de `UAM/` como modelo** (seção 3.2).
