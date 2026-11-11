// Propaga os parâmetros utm_* da URL atual para links externos
// (ex.: fichainscricao.inspirali.com), preservando UTMs já presentes
// no link de destino. Assim a atribuição da campanha chega à ficha
// de inscrição para a integração com a CDP/Salesforce.
(function () {
  var params = new URLSearchParams(window.location.search);
  var utms = [];
  params.forEach(function (value, key) {
    if (key.indexOf("utm_") === 0) utms.push([key, value]);
  });
  if (!utms.length) return;

  document.querySelectorAll('a[href^="http"]').forEach(function (link) {
    try {
      var url = new URL(link.href);
      if (url.hostname === window.location.hostname) return;
      utms.forEach(function (pair) {
        if (!url.searchParams.has(pair[0]))
          url.searchParams.set(pair[0], pair[1]);
      });
      link.href = url.toString();
    } catch (e) {}
  });
})();
