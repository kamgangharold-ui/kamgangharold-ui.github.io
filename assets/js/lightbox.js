/* lightbox.js : les images des projets s'ouvrent dans une fenêtre modale, sans quitter la page.

   Cause du défaut d'origine : chaque image était un lien direct vers le fichier avec
   target="_blank". Sur téléphone ou dans un navigateur intégré, cela ouvre le fichier nu
   dans un onglet sans la page ni le menu : plus aucun moyen de revenir au site.

   Sans JavaScript (ou sans <dialog>), le lien reste un lien ordinaire dans le même onglet :
   le bouton Retour du navigateur ramène à la page, rien ne piège le visiteur.
   Avec JavaScript : <dialog> modal (focus piégé dans la fenêtre puis rendu au lien, Échap,
   bouton Fermer visible, clic ou toucher hors de l'image, glisser vers le bas ou le côté sur
   téléphone), le défilement de la page ne bouge pas, et le bouton Retour ferme la fenêtre
   au lieu de quitter le site. Mouvement réduit : aucune animation. */
(function () {
  "use strict";
  var links = Array.prototype.slice.call(document.querySelectorAll("a[data-lightbox]"));
  if (!links.length || typeof HTMLDialogElement === "undefined") return;

  var LABELS = {
    fr: { close: "Fermer", prev: "Image précédente", next: "Image suivante", dlg: "Image agrandie" },
    en: { close: "Close", prev: "Previous image", next: "Next image", dlg: "Enlarged image" },
    es: { close: "Cerrar", prev: "Imagen anterior", next: "Imagen siguiente", dlg: "Imagen ampliada" },
    de: { close: "Schließen", prev: "Vorheriges Bild", next: "Nächstes Bild", dlg: "Vergrößertes Bild" }
  };
  function lbl() { return LABELS[document.documentElement.lang] || LABELS.fr; }

  var dlg = document.createElement("dialog");
  dlg.className = "lb";
  dlg.innerHTML =
    '<button type="button" class="lb__x" autofocus><span aria-hidden="true">&times;</span></button>' +
    '<button type="button" class="lb__nav lb__prev"><span aria-hidden="true">&#8249;</span></button>' +
    '<figure class="lb__fig"><img class="lb__img" alt=""><figcaption class="lb__cap"></figcaption></figure>' +
    '<button type="button" class="lb__nav lb__next"><span aria-hidden="true">&#8250;</span></button>';
  document.body.appendChild(dlg);
  var img = dlg.querySelector(".lb__img");
  var cap = dlg.querySelector(".lb__cap");
  var bx = dlg.querySelector(".lb__x");
  var bp = dlg.querySelector(".lb__prev");
  var bn = dlg.querySelector(".lb__next");
  var idx = 0, opener = null, pushed = false, closing = false;

  function show(i) {
    idx = (i + links.length) % links.length;
    var a = links[idx];
    var th = a.querySelector("img");
    img.src = a.getAttribute("href");
    img.alt = th ? th.alt : "";
    var fc = a.parentNode.querySelector("figcaption");
    cap.textContent = fc ? fc.textContent : "";
    var L = lbl();
    dlg.setAttribute("aria-label", L.dlg);
    bx.setAttribute("aria-label", L.close);
    bp.setAttribute("aria-label", L.prev);
    bn.setAttribute("aria-label", L.next);
    bp.hidden = bn.hidden = links.length < 2;
  }

  function open(i, from) {
    opener = from;
    show(i);
    document.body.classList.add("lb-open");
    dlg.showModal();
    try { history.pushState({ lb: 1 }, ""); pushed = true; } catch (e) { pushed = false; }
  }

  function close() { if (dlg.open) dlg.close(); }

  dlg.addEventListener("close", function () {
    document.body.classList.remove("lb-open");
    if (pushed && !closing && history.state && history.state.lb) { closing = true; history.back(); }
    pushed = false;
    if (opener && opener.focus) opener.focus({ preventScroll: true });
  });
  window.addEventListener("popstate", function () {
    if (dlg.open) { pushed = false; closing = true; close(); }
    closing = false;
  });

  links.forEach(function (a, i) {
    a.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      open(i, a);
    });
  });

  bx.addEventListener("click", close);
  bp.addEventListener("click", function (e) { e.stopPropagation(); show(idx - 1); });
  bn.addEventListener("click", function (e) { e.stopPropagation(); show(idx + 1); });
  // clic ou toucher n'importe où ailleurs que sur un bouton : fermer
  dlg.addEventListener("click", function (e) { if (!e.target.closest("button")) close(); });
  dlg.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") { show(idx - 1); }
    else if (e.key === "ArrowRight") { show(idx + 1); }
  });

  // glisser sur téléphone : vers le bas ou le haut ferme, de côté change d'image
  var sx = 0, sy = 0;
  dlg.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  dlg.addEventListener("touchend", function (e) {
    var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
    if (Math.abs(dy) > 70 && Math.abs(dy) > Math.abs(dx)) { e.preventDefault(); close(); }
    else if (Math.abs(dx) > 70 && links.length > 1) { e.preventDefault(); show(idx + (dx < 0 ? 1 : -1)); }
  });
})();
