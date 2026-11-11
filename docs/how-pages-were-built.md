# Como as páginas do IBCMED foram construídas

> Documentação do fluxo de construção das landing pages de Medicina das instituições Inspirali (UAM, UNA, UNIFACS, UNISUL, AGES, UNIFG, FASEH, USJT, UNP, UNIBH) — do Figma ao HubSpot CMS.

## 1. Visão geral do fluxo

```
Figma (fonte da verdade)
   ↓  extração via MCP do Figma
HTML/CSS/JS estático por instituição (<INST>/src/)
   ↓  revisão visual via preview na Vercel
Conversão para tema HubL (<INST>/src/templates/)
   ↓  upload via HubSpot CLI (hs)
HubSpot CMS (Design Manager + editor de páginas)
```

## 2. Fonte da verdade: Figma

- Arquivo: **"Redesign - Páginas IES"** (`figma.com/design/IiZ3Zct5TP6nxPirunSyhk`).
- Cada instituição tem uma página dentro do arquivo, com conteúdo, imagens e textos definidos pelo time de design.
- Extração feita pelo **MCP do Figma** (`figma-remote-mcp-server`):
  - `get_metadata` → mapeia a estrutura de seções (frames filhos) da página;
  - `get_design_context` (com a skill `figma-design-to-code` carregada antes) → textos, tokens de cor/espaçamento/radius/fonte e URLs temporárias de assets;
  - `get_screenshot` → conferência visual seção a seção.
- **Regra:** os assets (fotos/ícones) são baixados com `curl` para `<INST>/src/public/images/` e `/icons/` — nunca fica URL temporária do Figma no código.
- O código React/Tailwind gerado pelo MCP é só referência: a implementação é em HTML/CSS/JS puro, fiel ao layout.

## 3. Estrutura do repositório

Uma pasta por instituição na raiz, 100% autocontida (sem pasta "shared" global). `UAM/` é o modelo de referência — todas as outras replicam a mesma estrutura.

```
ibcmed/
  UAM/, UNA/, UNIFACS/, ...        # uma por instituição
    src/
      pages/index.html           # página montada (cola o HTML dos módulos)
      modules/
        shared/                  # header, footer, floating-contact, page-search
        sections/<secao>/        # um módulo por seção do Figma
          <secao>.html           # marcação da seção
          <secao>.css            # estilos da seção
          <secao>.js             # só quando há interatividade
      css/
        tokens.css               # variáveis: cores, fontes, spacing, radius
        base.css                 # reset + utilitários (.section, botões, container)
        components/              # accordion.css, cards.css, tabs.css, carousel.css
      vendor/                    # libs vendorizadas (mark.min.js) — nunca CDN
      public/images|icons|docs/  # assets baixados do Figma
      templates/                 # tema HubSpot (fase de conversão — ver seção 5)
```

Seções implementadas (1:1 com os frames do Figma): `processo-seletivo`, `sobre-instituicao`, `nosso-dna`, `matriz-curricular`, `corpo-docente`, `campus`, `metodologia`, `ecossistema`, `financiamentos`, `grupo-inspirali`, `seu-futuro`, `faq-contato`.

### Função de cada arquivo

| Arquivo | Função |
|---|---|
| `pages/index.html` | Monta a página completa colando o HTML de cada módulo em ordem; referencia CSS/JS com cache-busting (`?v=`) para revisão visual local e na Vercel |
| `modules/sections/<secao>/<secao>.html` | Marcação da seção isolada (edita-se aqui e replica no index) |
| `modules/sections/<secao>/<secao>.css` | Estilos da seção; padrões repetidos vão para `css/components/` |
| `modules/sections/<secao>/<secao>.js` | Carrosséis, accordions, modais, tabs — só quando a seção precisa |
| `css/tokens.css` | Variáveis do design system (cores `--surface-*`/`--text-*`/`--border-*`, fontes, espaçamentos) — nomenclatura idêntica entre instituições, só valores mudam |
| `modules/shared/*` | Chrome da página: header com dropdown de inscrição, footer, widget flutuante de contato/WhatsApp, busca em página (Ctrl+F via mark.js) |
| `vendor/mark.min.js` | Biblioteca vendorizada localmente para a busca em página |

## 4. Preview: Vercel

- `vercel.json` na raiz com rewrites: `/UAM` → `/UAM/src/pages/index.html`, `/UNIFACS` → `/UNIFACS/src/pages/index.html`, etc. Site estático puro, sem build.
- Integração Git → Vercel: push na `develop` gera **deploy de preview** (`ibcmed-git-develop-*.vercel.app`); push na `main` gera **deploy de produção** (`ibcmed.vercel.app`).
- Atenção: cada deploy gera URL imutável (`ibcmed-<hash>-...vercel.app`) — para ver a versão mais recente usar sempre o alias da branch ou o domínio de produção (e Ctrl+Shift+R contra cache).

## 5. Conversão para HubSpot (tema HubL)

Depois da aprovação visual, a página vira um tema HubSpot em `<INST>/src/templates/`:

```
<INST>/src/templates/
  theme.json                 # metadados do tema (label "IBCMED - <INST>")
  fields.json                # campos globais do tema (cores da marca, fonte)
  templates/
    layouts/base.html        # <head>, header/footer/widgets, CSS/JS globais
    medicina-<inst>.html     # template de página — instancia os módulos em ordem
  modules/<secao>.module/    # 1:1 com modules/sections/<secao>
    meta.json                # metadados do módulo
    fields.json              # campos editáveis no editor do HubSpot
    module.html              # HubL: {{ module.<campo> }} + get_asset_url()
    module.css / module.js   # cópia/adaptação do CSS/JS da seção
  css/, vendor/, public/     # design system copiado, carregado 1x em base.html
```

Decisões de conversão (seguindo o modelo da UAM):

- **Todo texto/imagem/link vira campo editável** no `fields.json` — o `module.html` só referencia `{{ module.<campo> }}`.
- Listas repetidas (pilares, fotos de campus, slides do ecossistema, disciplinas, FAQ) usam `type: "group"` + `occurrence` (min/max/default).
- Dados dinâmicos (galeria de campus, matriz por unidade) são serializados em `<script type="application/json">` pelo `module.html` e consumidos pelo `module.js` — o JS continua genérico e os dados vêm dos campos.
- Formulários ainda não aprovados ficam atrás de booleanos (`show_form`, `show_doubt_button` = `false`) em vez de comentados.
- Imagens apontam para o **File Manager** do HubSpot (URLs `https://51397625.fs1.hubspotusercontent-na1.net/hubfs/51397625/<INST>-assets/...`).

## 6. Conexão com a HubSpot CLI e upload

### Instalação e autenticação

- CLI: `@hubspot/cli` (comando `hs`, v8.x) instalada globalmente via npm.
- Autenticação iniciada com **`hs init`** (ou `hs auth`), que abre o fluxo de **Personal Access Key** — a chave é gerada no HubSpot em *Configurações → Integrações → Chave de acesso pessoal* e colada no prompt da CLI.
- A configuração fica em `~/.hscli/config.yml` (`C:\Users\<user>\.hscli\config.yml`). Contas configuradas:

| Nome da conta | Account ID | Uso |
|---|---|---|
| `inspirali-producao-v3` | `51397625` | **Conta de destino do tema** (mesma dos links hubfs) |
| `inspirali-producao-v2` | `51445302` | Conta filha (`parentAccountId: 51397625`) |
| `medroom` | `52002968` | Outro projeto |

- Para trocar a conta ativa: `hs accounts use inspirali-producao-v3` (ou `--account=` por comando).

### Como o código sobe

1. **`hs upload <origem> <destino>`** — envia a pasta do tema para o Design Manager, ex.: `hs upload UNIFACS/src/templates ibcmed-unifacs-theme`. Regra do projeto: nunca usar `--clean`; sempre comparar com o conteúdo remoto antes (`hs fetch`).
2. **Imagens/PDFs** → File Manager (pasta `<INST>-assets/`), via `hs files upload` ou pela interface web (Biblioteca de arquivos). Os `fields.json` já referenciam essas URLs.
3. **Criar a página** em *Marketing → Website → Páginas* usando o template `medicina-<inst>.html`, revisar no preview e publicar.
4. Quando os formulários forem aprovados: criar o formulário no HubSpot, ativar `show_form`/`show_doubt_button` e preencher o GUID.

Observação: também existe o **MCP `HubSpotDev`** conectado no Devin, que encapsula a CLI (`auth-account`, `find-projects`, `get-build-status` etc.) para operações assistidas.

## 7. Convenções do projeto

- Inglês para nomes de arquivos/pastas/classes/variáveis; português só no conteúdo visível.
- Caminhos absolutos a partir da raiz: `/UNIFACS/src/...` — permite servir todas as instituições lado a lado.
- Nomenclatura de variáveis de `tokens.css` é idêntica entre instituições; só os valores mudam (cor de marca, fonte).
- Todo novo texto aplicado em 3 lugares sincronizados: `modules/sections/<secao>/<secao>.html` + `pages/index.html` + `templates/modules/<secao>.module/fields.json` (defaults).
