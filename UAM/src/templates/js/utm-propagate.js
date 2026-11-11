// Propaga os parâmetros utm_* da URL atual para links externos
// (ex.: fichainscricao.inspirali.com), preservando UTMs já presentes
// no link de destino. Assim a atribuição da campanha chega à ficha
// de inscrição para a integração com a CDP/Salesforce.
(() => {
  const params = new URLSearchParams(window.location.search);
  const utms = [];
  params.forEach((value, key) => {
    if (key.startsWith("utm_")) utms.push([key, value]);
  });
  if (!utms.length) return;

  document.querySelectorAll('a[href^="http"]').forEach((link) => {
    try {
      const url = new URL(link.href);
      if (url.hostname === window.location.hostname) return;
      for (const [key, value] of utms) {
        if (!url.searchParams.has(key)) url.searchParams.set(key, value);
      }
      link.href = url.toString();
    } catch (e) {}
  });
})();
