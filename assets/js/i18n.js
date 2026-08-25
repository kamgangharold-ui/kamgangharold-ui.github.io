/* ═══════════════════════════════════════════════════════════════════
   Bilingue FR / EN.

   Le français est écrit en dur dans index.html : la page reste lisible
   sans JavaScript et les moteurs de recherche l'indexent normalement.
   Le dictionnaire FR est simplement récolté dans le DOM au chargement,
   ce qui évite d'avoir un fr.json à maintenir en double.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var KEY = "hk-lang";
  var base = {};            // FR, récolté depuis la page
  var dict = { fr: base };  // dictionnaires chargés
  var current = "fr";

  var nodes = Array.prototype.slice.call(document.querySelectorAll("[data-i18n]"));
  nodes.forEach(function (el) { base[el.dataset.i18n] = el.innerHTML; });

  base["meta.title"] = document.title;
  var metaDesc = document.querySelector('meta[name="description"]');
  base["meta.desc"] = metaDesc ? metaDesc.content : "";

  function paint(lang) {
    var d = dict[lang];
    if (!d) return;

    nodes.forEach(function (el) {
      var v = d[el.dataset.i18n];
      if (typeof v === "string") el.innerHTML = v;
    });

    if (d["meta.title"]) document.title = d["meta.title"];
    if (metaDesc && d["meta.desc"]) metaDesc.content = d["meta.desc"];

    document.documentElement.lang = lang;
    current = lang;

    var btn = document.getElementById("lang");
    if (btn) {
      var other = lang === "fr" ? "en" : "fr";
      btn.querySelector("span").textContent = other.toUpperCase();
      btn.setAttribute("aria-label", lang === "fr" ? "Switch to English" : "Passer en français");
    }

    try { localStorage.setItem(KEY, lang); } catch (e) { /* navigation privée */ }
  }

  function load(lang) {
    if (dict[lang]) { paint(lang); return; }
    fetch("assets/i18n/" + lang + ".json")
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (json) { dict[lang] = json; paint(lang); })
      .catch(function () {
        // Traduction indisponible : on reste en français plutôt que d'afficher une page cassée.
        paint("fr");
      });
  }

  var wanted = null;
  try { wanted = localStorage.getItem(KEY); } catch (e) { /* ignore */ }

  var fromUrl = new URLSearchParams(location.search).get("lang");
  if (fromUrl === "fr" || fromUrl === "en") wanted = fromUrl;

  if (!wanted && (navigator.language || "").slice(0, 2) === "en") wanted = "en";

  // Le français doit passer par paint() lui aussi : c'est là que la préférence
  // est enregistrée. Sans ça, un choix « français » n'était jamais mémorisé et
  // la page repassait en anglais au rechargement suivant.
  if (wanted === "en") load("en");
  else if (wanted === "fr") paint("fr");

  var toggle = document.getElementById("lang");
  if (toggle) {
    toggle.addEventListener("click", function () {
      load(current === "fr" ? "en" : "fr");
    });
  }
})();
