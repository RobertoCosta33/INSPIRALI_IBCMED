# Regras e Comandos do Projeto IBCMED (HubSpot CMS)

Este arquivo reúne o fluxo de trabalho para desenvolvedores que colaborarem no tema do site **IBCMED** (Inspirali) no HubSpot CMS. O processo: construir páginas localmente em HTML/CSS/JS simples a partir do **Figma**, revisar, depois converter para templates/módulos HubL e publicar via CLI.

---

## 1. Sobre o projeto

O IBCMED reúne páginas de divulgação do curso de Medicina em diferentes faculdades parceiras da Inspirali. Cada página apresenta o curso de Medicina de uma instituição específica.

### Fonte da verdade: Figma (não mais os sites públicos das instituições)

> **Mudança de processo:** o projeto deixou de usar as páginas públicas de cada instituição como fonte da verdade. A partir de agora, toda página nasce do arquivo Figma **"Redesign - Páginas IES"**:
> `https://www.figma.com/design/IiZ3Zct5TP6nxPirunSyhk/Redesign---P%C3%A1ginas-IES`
>
> Cada instituição tem (ou terá) sua própria página dentro desse arquivo Figma, com conteúdo, imagens e textos já definidos pelo time de design. O trabalho de implementação consiste em:
> 1. Localizar o node-id da página da instituição no Figma (pedir ao responsável o link com `node-id` se não estiver disponível).
> 2. Usar o MCP do Figma (`figma-remote-mcp-server`) — `get_metadata` para mapear a estrutura de seções, `get_design_context` (com a skill `figma-design-to-code` carregada antes) para extrair textos, tokens de design e assets de cada seção, e `get_screenshot` para conferência visual.
> 3. Baixar todos os assets (imagens/ícones) referenciados pelo Figma para `public/images/<instituicao>/` ou `public/images/shared/` — nunca deixar URLs temporárias do Figma (`figma.com/api/mcp/asset/...`) no código.
> 4. Reconstruir a página em HTML/CSS/JS próprios (ver estrutura de pastas abaixo), seguindo fielmente layout, hierarquia, cores, tipografia e espaçamento do Figma — sem usar Tailwind nem o código React gerado pelo MCP diretamente (ele é só referência).
> 5. Aplicar responsividade (o Figma normalmente só tem o desktop desenhado) seguindo boas práticas de breakpoints (ver seção 4).
>
> Páginas já implementadas:
>
> | Instituição | Node-id Figma | Status |
> |---|---|---|
> | UAM (Anhembi Morumbi) | `21:7901` ("Desktop", dentro da página "Protótipo [em construção] - Anhembi Morumbi") | Implementado em `src/pages/uam/` + `src/modules/uam/*` |
> | UNIFACS | — | A definir com o time de design |
> | AGES, UNIFG, FASEH, USJT, UNP, UNA, UNIBH, UNISUL | — | A definir com o time de design |

---

## 2. Extraindo uma página do Figma

Antes de construir qualquer página nova:

1. Peça/confirme o link do Figma com `node-id` da página da instituição.
2. Rode `get_metadata` no node para mapear todas as seções (frames) filhas.
3. Para cada seção principal, rode `get_design_context` (sempre após carregar a skill `figma-design-to-code`) para obter texto, tokens (`cor`, `spacing`, `radius`, `font`) e URLs de assets.
4. Baixe os assets com `curl` para `public/images/<instituicao>/` (fotos) e `public/icons/` (ícones/SVGs reaproveitáveis entre instituições) ou `public/images/shared/` (logos/selos institucionais comuns).
5. Nunca edite os arquivos de referência brutos (prints, metadados) — eles só servem de apoio durante a implementação.

---

## 3. Estrutura do projeto

Tudo o que é pré-HubSpot vive dentro de `src/`. `public/` guarda assets estáticos. `ibcmed-theme/` só nasce na fase de conversão para HubL.

```
ibcmed/
  AGENTS.md                        # este arquivo
  src/
    css/
      tokens.css                   # cores, tipografia, espaçamento e radius extraídos do Figma
      base.css                     # reset + estilos base + seções genéricas + utilitários (botões, links, container)
      components/                  # CSS de padrões de UI reaproveitados por vários módulos
        accordion.css              # disclosures (ex.: Metodologia)
        cards.css                  # cartões (info-card, discipline-card, stat-card, posgrad-card...)
        tabs.css                   # abas (Processo seletivo, Matriz Curricular)
        carousel.css               # carrosséis (Ecossistema, Seu Futuro na Medicina)
    modules/
      shared/                      # módulos reaproveitados por todas as instituições
        header/
          header.html
          header.css
          header.js
        footer/
          footer.html
          footer.css
      <instituicao>/               # um módulo por seção principal da página daquela instituição
        <secao>/
          <secao>.html
          <secao>.css
          <secao>.js                # apenas quando a seção tem interatividade própria
    pages/
      <instituicao>/
        index.html                 # monta a página colando o HTML de cada módulo e referenciando
                                    # os respectivos <secao>.css/<secao>.js — pronta para revisão visual
  public/
    images/
      shared/                      # logos e selos comuns a todas as instituições (Inspirali, e-MEC, etc.)
      <instituicao>/               # fotos específicas de cada instituição
    icons/                         # ícones SVG reutilizáveis (setas, +/-, etc.)
    docs/                          # PDFs (matrizes curriculares, editais) quando existirem
  src/templates/                   # reservado para a conversão em tema HubSpot (ver src/templates/README.md)
    README.md
  ibcmed-theme/                    # tema HubSpot de verdade (Design Manager) — criado na fase de conversão
```

### Regras de modularização

- **Um módulo por seção principal da página** (ex.: `processo-seletivo`, `nosso-dna`, `matriz-curricular`, `campus`, `metodologia`, `ecossistema`, `financiamentos`, `seu-futuro`, `grupo-inspirali`), cada um com seu próprio `<secao>.html` + `<secao>.css` (+ `<secao>.js` quando necessário), em `src/modules/<instituicao>/<secao>/`.
- Header e footer são módulos **compartilhados** entre todas as instituições: `src/modules/shared/header/` e `src/modules/shared/footer/`.
- Padrões de UI reaproveitados por múltiplos módulos (botões, abas, carrosséis, accordions, cartões) ficam em `src/css/components/` — evita duplicar CSS igual em vários módulos. Tokens de design e reset ficam em `src/css/tokens.css`/`base.css`.
- Inglês para nomes de pastas, arquivos, classes CSS e variáveis. Português apenas no conteúdo visível.
- Imagens com `get_asset_url('../images/arquivo.png')` nos módulos HubL (fase de conversão), e caminho absoluto a partir da raiz (`/public/images/...`) nas páginas em `src/pages/`.
- Antes de ir para o HubSpot, toda página nasce como módulos HTML/CSS/JS simples em `src/modules/`, compostos em `src/pages/<instituicao>/index.html` para revisão visual, só depois convertida em módulos HubL dentro de `src/templates/`/`ibcmed-theme/`.
- Ao converter para HubL, cada módulo de `src/modules/<instituicao>/<secao>/` vira um módulo HubL (`ibcmed-theme/modules/<secao>.module/`) — a estrutura já nasce 1:1 com o destino final.

---

## 4. Responsividade

- O Figma normalmente só define o layout desktop (1440px). Não copie pixel a pixel sem adaptar: aplique breakpoints padrão (`1280px`, `1024px`, `860px`, `640px`) usando `flex-wrap`, reordenação de colunas e ajuste de paddings (`--page-gutter` → `--page-gutter-tablet` → `--page-gutter-mobile`, definidos em `src/css/tokens.css`).
- Teste sempre em desktop, tablet e mobile antes de considerar a página pronta.
- Caso o Figma tenha telas mobile/tablet específicas para a instituição, priorize-as sobre a adaptação automática.

---

## 5. Contas HubSpot

| Conta | Tipo | Uso |
|---|---|---|
| *(a definir)* | Sandbox | Ambiente de testes do IBCMED |
| *(a definir)* | Produção | Conta de produção do IBCMED |

> Preencher esta tabela assim que as contas forem criadas/autenticadas. Ver o projeto MedRoom (`medroom-site-testes/AGENTS.md`) para o passo a passo completo de autenticação via Personal Access Key — o processo de instalação e autenticação da CLI é idêntico, só muda a conta de destino.

---

## 6. Regras obrigatórias (idênticas ao projeto MedRoom)

- **Nunca envie nada para o HubSpot sem perguntar ao desenvolvedor responsável se está tudo pronto.**
- **Antes de qualquer `hs cms upload`, verifique se há algo no HubSpot que não existe no projeto local** (fetch + diff) e traga para o projeto antes de subir.
- **Nunca use `hs cms upload --clean`** — a flag apaga a pasta inteira no Design Manager antes de subir, destruindo qualquer arquivo que exista só no HubSpot.
- Salve todos os arquivos do tema em **UTF-8 sem BOM** (BOM impede o HubSpot de ler as anotações do topo dos templates).
- `.webp` e `.ico` não são aceitos pelo Design Manager — converta para `.png`/`.jpg` antes de subir.
- Vídeos não são aceitos pelo Design Manager — suba pelo File Manager (`hs filemanager upload`) e referencie a URL fixa resultante diretamente, sem `get_asset_url`.
- Sempre valide a página no preview do HubSpot antes de publicar.

---

## 7. Checklist por página

Para cada instituição, ao criar a página:

- [ ] Conteúdo, textos e imagens fiéis ao Figma daquela instituição.
- [ ] Nenhuma URL temporária do Figma (`figma.com/api/mcp/asset/...`) restante no código — todos os assets baixados para `public/`.
- [ ] Header e footer compartilhados reaproveitados (`src/modules/shared/header/`, `src/modules/shared/footer/`).
- [ ] Responsividade testada (desktop, tablet, mobile).
- [ ] HTML semântico, com `alt` descritivo em imagens e hierarquia de headings (`h1` único, `h2`/`h3` em sequência).
- [ ] SEO: `<title>`, meta descrição, `canonical`, Open Graph e dados estruturados (`schema.org/Course`) definidos.
- [ ] Imagens via `get_asset_url` no HubL (fase de conversão).
- [ ] Formulário de contato/inscrição (se aplicável) configurado com o endpoint correto.
- [ ] Testado no preview do HubSpot antes de publicar.

---

## 8. Próximos passos

1. Revisar visualmente `src/pages/uam/index.html` (piloto, construído a partir do Figma) com o time responsável.
2. Definir e autenticar as contas HubSpot (sandbox e produção) do IBCMED na CLI.
3. Após aprovação do piloto, criar a estrutura inicial de `ibcmed-theme/` (layout base, header, footer) e converter cada módulo de `src/modules/uam/` em um módulo HubL dentro de `src/templates/`.
4. Repetir o fluxo Figma → `src/modules/<instituicao>/` → `src/pages/<instituicao>/` → aprovação → conversão HubL → upload para as demais instituições, conforme as telas forem disponibilizadas no Figma.
