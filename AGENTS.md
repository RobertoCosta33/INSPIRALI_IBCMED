# Regras e Comandos do Projeto IBCMED (HubSpot CMS)

Este arquivo reúne o fluxo de trabalho para desenvolvedores que colaborarem no tema do site **IBCMED** (Inspirali) no HubSpot CMS. O processo segue o mesmo padrão já validado no projeto MedRoom: construir páginas localmente em HTML/CSS simples, revisar, depois converter para templates/módulos HubL e publicar via CLI.

---

## 1. Sobre o projeto

O IBCMED reúne páginas de divulgação do curso de Medicina em diferentes faculdades parceiras da Inspirali. Cada página apresenta o curso de Medicina de uma instituição específica, com conteúdo e estrutura inspirados na página oficial daquela faculdade.

### Páginas a serem criadas

| Instituição | Página de referência (fonte da verdade) |
|---|---|
| UNIFACS | https://www.unifacs.br/faculdade-de-medicina-em-salvador/ |
| UAM (Anhembi Morumbi) | https://portal.anhembi.br/faculdade-de-medicina-em-sao-paulo/ |
| AGES | https://www.ages.edu.br/faculdade-de-medicina-na-bahia |
| UNIFG | https://www.centrouniversitariounifg.edu.br/faculdade-de-medicina-na-bahia/ |
| FASEH (UniBH Vespasiano) | https://www.faseh.edu.br/faculdade-de-medicina-em-minas-gerais/ |
| USJT | https://www.usjt.br/faculdade-de-medicina-em-sp/ |
| UNP | https://www.unp.br/curso-de-medicina/ |
| UNA | https://www.una.br/curso-de-medicina/ |
| UNIBH | https://www.unibh.br/faculdade-de-medicina-em-minas-gerais/ |
| UNISUL | https://www.unisul.br/graduacao-em-medicina/ |

> Cada página de referência acima é a **fonte da verdade visual/textual** para a página equivalente do IBCMED daquela instituição — assim como `www.medroom.com.br` foi para o projeto MedRoom. Isso não significa copiar o HTML da página de origem; significa usar como referência de conteúdo, estrutura de seções, imagens e tom, reconstruindo tudo com marcação própria.

---

## 2. Raspagem das páginas de referência

Antes de construir qualquer página nova:

1. Acesse a URL de referência da instituição correspondente.
2. Baixe o HTML para referência (não para cópia literal):
   ```powershell
   Invoke-WebRequest -Uri "<url-da-instituicao>" -OutFile "<instituicao>-public.html"
   ```
3. Anote textos principais (nome do curso, diferenciais, grade, infraestrutura, depoimentos, etc.), hierarquia de seções, imagens usadas e paleta de cores/fontes.
4. Baixe as imagens necessárias para `ibcmed-theme/assets/images/`, mantendo nomes organizados por instituição (ex.: `unifacs-hero.jpg`, `uam-campus.jpg`).
5. Arquivos `<instituicao>-public.html` são apenas referência bruta e **não devem ser editados**.

---

## 3. Estrutura do projeto (mesmo padrão do MedRoom)

```
ibcmed/
  AGENTS.md                      # este arquivo
  ibcmed-theme/                  # tema HubSpot de verdade (Design Manager)
    theme.json
    fields.json
    templates/
      layouts/base.html
      unifacs.html, uam.html, ages.html, unifg.html, faseh.html,
      usjt.html, unp.html, una.html, unibh.html, unisul.html
    modules/
      header.module/              # compartilhado por todas as paginas
      footer.module/               # compartilhado por todas as paginas
      <instituicao>-hero.module/
      <instituicao>-about.module/
      <instituicao>-courses.module/
      ... (um modulo por secao principal de cada pagina)
    assets/images/
    css/
      main.css, theme-overrides.css
    js/
  modules/                        # modulos simples locais (pre-HubL)
    header/, footer/
    unifacs/unifacs-hero/, unifacs-about/, ...
    uam/uam-hero/, uam-about/, ...
    (uma pasta por instituicao, uma subpasta por secao)
  <instituicao>/                  # preview local de cada pagina (HTML/CSS puro)
    index.html
```

### Regras de modularização (iguais ao MedRoom)

- Um módulo por seção principal de cada página.
- Header e footer sempre reaproveitados dos módulos compartilhados.
- Inglês para nomes de pastas, arquivos, classes CSS e variáveis. Português apenas no conteúdo visível.
- Imagens com `get_asset_url('../../assets/images/arquivo.png')` nos módulos HubL, e caminho relativo simples (`../assets/images/arquivo.png`) nos previews locais.
- Antes de ir para o HubSpot, toda página nasce como HTML/CSS simples local, revisada visualmente, só depois convertida para HubL.

---

## 4. Contas HubSpot

| Conta | Tipo | Uso |
|---|---|---|
| *(a definir)* | Sandbox | Ambiente de testes do IBCMED |
| *(a definir)* | Produção | Conta de produção do IBCMED |

> Preencher esta tabela assim que as contas forem criadas/autenticadas. Ver o projeto MedRoom (`medroom-site-testes/AGENTS.md`) para o passo a passo completo de autenticação via Personal Access Key — o processo de instalação e autenticação da CLI é idêntico, só muda a conta de destino.

---

## 5. Regras obrigatórias (idênticas ao projeto MedRoom)

- **Nunca envie nada para o HubSpot sem perguntar ao desenvolvedor responsável se está tudo pronto.**
- **Antes de qualquer `hs cms upload`, verifique se há algo no HubSpot que não existe no projeto local** (fetch + diff) e traga para o projeto antes de subir.
- **Nunca use `hs cms upload --clean`** — a flag apaga a pasta inteira no Design Manager antes de subir, destruindo qualquer arquivo que exista só no HubSpot.
- Salve todos os arquivos do tema em **UTF-8 sem BOM** (BOM impede o HubSpot de ler as anotações do topo dos templates).
- `.webp` e `.ico` não são aceitos pelo Design Manager — converta para `.png`/`.jpg` antes de subir.
- Vídeos não são aceitos pelo Design Manager — suba pelo File Manager (`hs filemanager upload`) e referencie a URL fixa resultante diretamente, sem `get_asset_url`.
- Sempre valide a página no preview do HubSpot antes de publicar.

---

## 6. Checklist por página

Para cada instituição, ao criar a página:

- [ ] Conteúdo e imagens fiéis à página de referência daquela instituição (adaptados, não copiados literalmente).
- [ ] Header e footer compartilhados reaproveitados.
- [ ] Responsividade testada (desktop, tablet, mobile).
- [ ] Imagens via `get_asset_url` no HubL.
- [ ] Formulário de contato/inscrição (se aplicável) configurado com o endpoint correto.
- [ ] Título (`<title>`) e meta descrição definidos.
- [ ] Testado no preview do HubSpot antes de publicar.

---

## 7. Próximos passos

1. Definir e autenticar as contas HubSpot (sandbox e produção) do IBCMED na CLI.
2. Criar a estrutura inicial de `ibcmed-theme/` (layout base, header, footer).
3. Escolher a primeira instituição para servir de modelo/piloto do padrão visual.
4. Seguir o fluxo: raspagem → preview local → aprovação → conversão HubL → upload.
