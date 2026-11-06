/* design.js : passe design de novembre 2026.
   En-tête qui se précise au défilement, compteurs des chiffres clés,
   parallaxe lente de l'aurore, ligne du parcours qui se remplit.
   Rien n'est lancé si l'utilisateur demande moins d'animations.
   Seuls transform et opacity sont animés. */
(function () {
  "use strict";

  var calme = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fin = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ── 1. En-tête : état « collé » dès qu'on quitte le haut ─────────── */
  var header = document.querySelector(".site-header");
  var tickHeader = false;
  function majHeader() {
    if (header) header.classList.toggle("is-stuck", window.scrollY > 8);
    tickHeader = false;
  }
  if (header) {
    window.addEventListener("scroll", function () {
      if (!tickHeader) { tickHeader = true; window.requestAnimationFrame(majHeader); }
    }, { passive: true });
    majHeader();
  }

  if (calme) return;

  /* ── 2. Compteurs : 0 vers la valeur, une seule fois ──────────────── */
  var compteurs = Array.prototype.slice.call(document.querySelectorAll(".stats__n"));
  var ease = function (t) { return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); }; // ease-out expo

  compteurs.forEach(function (el) {
    var texte = el.textContent.trim();
    var m = texte.match(/^([−+\-]?)(\d+)(.*)$/);
    if (!m) return;
    var prefixe = m[1], cible = parseInt(m[2], 10), suffixe = m[3];
    el.textContent = prefixe + "0" + suffixe;       // masqué par l'animation d'entrée
    var debut = null, duree = 1500;

    function pas(t) {
      if (debut === null) debut = t;
      var p = Math.min((t - debut) / duree, 1);
      el.textContent = prefixe + Math.round(cible * ease(p)) + suffixe;
      if (p < 1) window.requestAnimationFrame(pas); else el.textContent = texte;
    }
    window.setTimeout(function () { window.requestAnimationFrame(pas); }, 450);
  });

  /* ── 3. Aurore : parallaxe douce au pointeur et au défilement ──────── */
  var aurore = document.querySelector(".hero .aurora");
  var hero = document.querySelector(".hero");
  if (aurore && hero) {
    var cx = 0, cy = 0, tx = 0, ty = 0, visible = true, boucle = false;

    function cible() {
      var s = Math.min(window.scrollY, window.innerHeight) * 0.14;
      aurore.style.transform = "translate3d(" + cx.toFixed(1) + "px," + (cy + s).toFixed(1) + "px,0)";
    }
    function anime() {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      cible();
      if (visible && (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1)) {
        window.requestAnimationFrame(anime);
      } else { boucle = false; }
    }
    function lance() { if (!boucle) { boucle = true; window.requestAnimationFrame(anime); } }

    if (fin) {
      hero.addEventListener("pointermove", function (e) {
        var r = hero.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * -36;
        ty = ((e.clientY - r.top) / r.height - 0.5) * -26;
        lance();
      });
    }
    window.addEventListener("scroll", function () { if (visible) cible(); }, { passive: true });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        // hors champ : on suspend aussi l'animation CSS pour économiser le processeur
        aurore.style.animationPlayState = visible ? "" : "paused";
        Array.prototype.forEach.call(aurore.children, function (c) {
          c.style.animationPlayState = visible ? "" : "paused";
        });
      }).observe(hero);
    }
  }

  /* ── 4. Parcours : la ligne se remplit avec la lecture ─────────────── */
  var tl = document.querySelector(".tl");
  if (tl) {
    var fill = document.createElement("span");
    fill.className = "tl__fill";
    fill.setAttribute("aria-hidden", "true");
    tl.appendChild(fill);
    var tickTl = false;
    function majTl() {
      var r = tl.getBoundingClientRect();
      var repere = window.innerHeight * 0.6;
      var p = (repere - r.top) / r.height;
      fill.style.transform = "scaleY(" + Math.max(0, Math.min(1, p)).toFixed(3) + ")";
      tickTl = false;
    }
    window.addEventListener("scroll", function () {
      if (!tickTl) { tickTl = true; window.requestAnimationFrame(majTl); }
    }, { passive: true });
    window.addEventListener("resize", majTl);
    majTl();
  }
})();
