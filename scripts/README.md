# scripts/

Utilitários de linha de comando usados durante a conversão/upload para o HubSpot — não fazem parte do tema em si.

- `fetch-file-urls.js` — resolve as URLs públicas (File Manager) de arquivos já enviados via `hs filemanager upload`, usando a Files API. Lê o Personal Access Key da conta diretamente do config local da `hs` CLI (`~/.hscli/config.yml`) e nunca o imprime.

  Uso: `node scripts/fetch-file-urls.js <nome-da-conta-na-cli> <pasta-no-file-manager> <arquivo-de-saida.json>`

  Exemplo: `node scripts/fetch-file-urls.js inspirali-producao-v3 UAM-assets /tmp/uam-asset-urls.json`
