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
> | UAM (Anhembi Morumbi) | `181:3627` ("Medicina Anhembi Morumbi • Desktop", dentro da página "UAM - LP") | Implementado em `pages/uam/` |
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

```
ibcmed/
  AGENTS.md                      # este arquivo
  pages/
    uam/index.html                # preview estático da página (HTML puro, pronta para revisão visual)
    <instituicao>/index.html
  src/
    css/
      tokens.css                  # cores, tipografia, espaçamento e radius extraídos do Figma
      base.css                    # reset + estilos base + utilitários (botões, links, container)
      components/                 # CSS reutilizável entre instituições (header, footer, accordion, cards, forms)
      pages/
        uam.css                   # CSS específico do layout da página UAM
    js/
      header.js                   # menu mobile
      accordion.js                # disclosures (metodologia, FAQ)
      form.js                     # validação simples do formulário de contato
  public/
    images/
      shared/                     # logos e selos comuns a todas as instituições (Inspirali, e-MEC, etc.)
      uam/, <instituicao>/        # fotos específicas de cada instituição
    icons/                        # ícones SVG reutilizáveis (setas, +/-, etc.)
    docs/                         # PDFs (matrizes curriculares, editais) quando existirem
  templates/                      # reservado para a conversão em tema HubSpot (ver templates/README.md)
    README.md
  ibcmed-theme/                   # tema HubSpot de verdade (Design Manager) — criado na fase de conversão
```

### Regras de modularização

- Um bloco de CSS (`src/css/pages/<instituicao>.css`) + seções semânticas (`<section>`) por página; seções compartilhadas (header, footer, accordion, cards, forms) vivem em `src/css/components/` para reuso entre instituições.
- Inglês para nomes de pastas, arquivos, classes CSS e variáveis. Português apenas no conteúdo visível.
- Imagens com `get_asset_url('../images/arquivo.png')` nos módulos HubL (fase de conversão), e caminho relativo simples (`../../public/images/...`) nas páginas em `pages/`.
- Antes de ir para o HubSpot, toda página nasce como HTML/CSS/JS simples em `pages/`, revisada visualmente, só depois convertida em módulos HubL dentro de `templates/`/`ibcmed-theme/`.
- Ao converter para HubL, cada `<section>` da página vira um módulo (`ibcmed-theme/modules/<secao>.module/`), mantendo a mesma divisão usada em `pages/<instituicao>/index.html`.

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
- [ ] Header e footer compartilhados reaproveitados (`src/css/components/header.css`, `footer.css`).
- [ ] Responsividade testada (desktop, tablet, mobile).
- [ ] HTML semântico, com `alt` descritivo em imagens e hierarquia de headings (`h1` único, `h2`/`h3` em sequência).
- [ ] SEO: `<title>`, meta descrição, `canonical`, Open Graph e dados estruturados (`schema.org/Course`) definidos.
- [ ] Imagens via `get_asset_url` no HubL (fase de conversão).
- [ ] Formulário de contato/inscrição (se aplicável) configurado com o endpoint correto.
- [ ] Testado no preview do HubSpot antes de publicar.

---

## 8. Próximos passos

1. Revisar visualmente `pages/uam/index.html` (piloto, construído a partir do Figma) com o time responsável.
2. Definir e autenticar as contas HubSpot (sandbox e produção) do IBCMED na CLI.
3. Após aprovação do piloto, criar a estrutura inicial de `ibcmed-theme/` (layout base, header, footer) e converter `pages/uam/` em módulos HubL dentro de `templates/`.
4. Repetir o fluxo Figma → `pages/<instituicao>/` → aprovação → conversão HubL → upload para as demais instituições, conforme as telas forem disponibilizadas no Figma.
