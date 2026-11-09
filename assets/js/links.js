/* ═══════════════════════════════════════════════════════════════════
   Lien WhatsApp assemblé au chargement : le numéro n'apparaît pas en
   clair dans le HTML, comme l'adresse e-mail (voir main.js).
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var num = ["33", "670", "146", "465"].join("");
  Array.prototype.slice.call(document.querySelectorAll("a[data-wa]")).forEach(function (a) {
    a.href = "https://wa.me/" + num;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  });
})();
