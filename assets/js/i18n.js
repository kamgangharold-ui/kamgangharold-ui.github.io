/* ═══════════════════════════════════════════════════════════════════
   FR / EN / ES / DE.

   Le français est écrit en dur dans le HTML : la page reste lisible
   sans JavaScript et les moteurs de recherche l'indexent normalement.
   Le dictionnaire FR est simplement récolté dans le DOM au chargement,
   ce qui évite d'avoir un fr.json à maintenir en double. EN, ES et DE
   sont chargés à la demande depuis des fichiers JSON.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var KEY = "hk-lang";
  var LANGS = ["fr", "en", "es", "de"];
  var LABELS = { fr: "FR", en: "EN", es: "ES", de: "DE" };
  var base = {};            // FR, récolté depuis la page
  var dict = { fr: base };  // dictionnaires chargés
  var current = "fr";

  var nodes = Array.prototype.slice.call(document.querySelectorAll("[data-i18n]"));
  nodes.forEach(function (el) { base[el.dataset.i18n] = el.innerHTML; });
  // textes alternatifs des images : data-i18n-alt="clé", traduits comme le reste
  var altNodes = Array.prototype.slice.call(document.querySelectorAll("[data-i18n-alt]"));
  altNodes.forEach(function (el) { base[el.dataset.i18nAlt] = el.getAttribute("alt") || ""; });

  // Plusieurs pages projet partagent un seul dictionnaire par langue : une clé
  // "meta.title" non préfixée serait écrasée par la dernière page qui l'a
  // écrite. Chaque page projet déclare donc son propre préfixe via
  // <html data-i18n-prefix="k."> ; les pages qui n'en déclarent pas (index)
  // gardent l'ancien comportement, sans rien casser.
  var metaPrefix = document.documentElement.dataset.i18nPrefix || "";
  var titleKey = metaPrefix + "meta.title";
  var descKey = metaPrefix + "meta.desc";

  // Les balises par défaut (partage, moteurs de recherche) sont en anglais ; le français vient des attributs data-*.
  base[titleKey] = document.documentElement.dataset.titleFr || document.title;
  var metaDesc = document.querySelector('meta[name="description"]');
  base[descKey] = document.documentElement.dataset.descFr || (metaDesc ? metaDesc.content : "");

  function paint(lang) {
    var d = dict[lang];
    if (!d) return;

    nodes.forEach(function (el) {
      var v = d[el.dataset.i18n];
      if (typeof v === "string") el.innerHTML = v;
    });

    altNodes.forEach(function (el) {
      var a = d[el.dataset.i18nAlt];
      if (typeof a === "string") el.setAttribute("alt", a);
    });

    if (d[titleKey]) document.title = d[titleKey];
    if (metaDesc && d[descKey]) metaDesc.content = d[descKey];

    document.documentElement.lang = lang;
    current = lang;

    var btn = document.getElementById("lang");
    if (btn) {
      var span = btn.querySelector("span");
      if (span) span.textContent = LABELS[lang];
      btn.setAttribute("aria-label", LABELS[lang] + ", choisir la langue");
    }
    Array.prototype.slice.call(document.querySelectorAll(".langsel__opt")).forEach(function (opt) {
      opt.classList.toggle("is-current", opt.dataset.lang === lang);
      opt.setAttribute("aria-selected", opt.dataset.lang === lang ? "true" : "false");
    });

    try { localStorage.setItem(KEY, lang); } catch (e) { /* navigation privée */ }
  }

  // Les pages projet vivent dans un sous-dossier : elles declarent leur propre
  // chemin de dictionnaire via <html data-i18n-path="...">.
  var basePath = document.documentElement.dataset.i18nPath || "assets/i18n/";

  // Changement de langue : fondu enchaîné de toute la page (View Transitions), sauf au
  // premier affichage et si l'utilisateur demande moins d'animations. Sans le navigateur
  // adapté, le texte change simplement, comme avant.
  var animate = false;
  function swap(lang) {
    var calme = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (animate && !calme && document.startViewTransition) {
      document.startViewTransition(function () { paint(lang); });
    } else {
      paint(lang);
    }
    animate = true;
  }

  function load(lang) {
    if (lang === "fr") { swap("fr"); return; }
    if (dict[lang]) { swap(lang); return; }
    // "reload" force une revalidation reseau : sans ca, un texte corrige restait invisible
    // des heures chez un visiteur ayant deja charge la page, contrairement au francais (HTML).
    fetch(basePath + lang + ".json", { cache: "reload" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (json) { dict[lang] = json; swap(lang); })
      .catch(function () {
        // Traduction indisponible : on reste en français plutôt que d'afficher une page cassée.
        paint("fr");
      });
  }

  var wanted = null;
  try { wanted = localStorage.getItem(KEY); } catch (e) { /* ignore */ }

  var fromUrl = new URLSearchParams(location.search).get("lang");
  if (LANGS.indexOf(fromUrl) !== -1) wanted = fromUrl;

  if (!wanted) {
    var nav = (navigator.language || "").slice(0, 2);
    if (LANGS.indexOf(nav) !== -1) wanted = nav;
  }

  // Le français doit passer par paint() lui aussi : c'est là que la préférence
  // est enregistrée. Sans ça, un choix « français » n'était jamais mémorisé et
  // la page repassait dans la langue du navigateur au rechargement suivant.
  load(wanted || "en");   // langue du navigateur non prise en charge : anglais

  // ── Menu déroulant à 4 langues ────────────────────────────────────────
  var btn = document.getElementById("lang");
  var menu = document.getElementById("langmenu");
  if (btn && menu) {
    function closeMenu() {
      menu.hidden = true;
      btn.setAttribute("aria-expanded", "false");
    }
    function openMenu() {
      menu.hidden = false;
      btn.setAttribute("aria-expanded", "true");
    }
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (menu.hidden) openMenu(); else closeMenu();
    });
    menu.addEventListener("click", function (e) {
      var opt = e.target.closest(".langsel__opt");
      if (!opt) return;
      load(opt.dataset.lang);
      closeMenu();
      btn.focus();
    });
    document.addEventListener("click", function (e) {
      if (!menu.hidden && !menu.contains(e.target) && e.target !== btn) closeMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !menu.hidden) { closeMenu(); btn.focus(); }
    });
  }
})();
