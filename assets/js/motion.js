/* motion.js — apparition au défilement, halo qui suit la souris,
   barre de progression. Ajouté le 29/08/2026.

   Tout est désactivé si l'utilisateur a demandé moins d'animations
   au niveau du système. On ne force jamais le mouvement. */

(function () {
  'use strict';

  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. Marquer les éléments à faire apparaître ───────────── */
  var cibles = document.querySelectorAll(
    '.card, .sk, .tl__i, .sec__t, .deliv > li, .meta > li, .callout, .prose > h2'
  );

  if (calme) {
    // Rien ne bouge : on rend simplement tout visible.
    cibles.forEach(function (el) { el.classList.add('is-in'); });
    return;
  }

  cibles.forEach(function (el, i) {
    el.setAttribute('data-rise', '');
    // Cascade courte à l'intérieur d'un même groupe, plafonnée pour que
    // le dernier élément n'attende pas une seconde entière.
    var parent = el.parentElement;
    var rang = parent ? Array.prototype.indexOf.call(parent.children, el) : i;
    el.style.setProperty('--d', Math.min(rang * 70, 350) + 'ms');
  });

  /* ── 2. Révéler à l'entrée dans le champ de vision ────────── */
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          obs.unobserve(e.target);   // une seule fois, pas à chaque passage
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    cibles.forEach(function (el) { obs.observe(el); });
  } else {
    cibles.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ── 3. Halo qui suit la souris sur les cartes ────────────── */
  var suivies = document.querySelectorAll('.card');
  suivies.forEach(function (c) {
    c.addEventListener('pointermove', function (ev) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (ev.clientX - r.left) + 'px');
      c.style.setProperty('--my', (ev.clientY - r.top) + 'px');
    });
    c.addEventListener('pointerleave', function () {
      c.style.removeProperty('--mx');
      c.style.removeProperty('--my');
    });
  });

  /* ── 4. Barre de progression de lecture ───────────────────── */
  var barre = document.createElement('div');
  barre.id = 'progress';
  document.body.appendChild(barre);

  var tick = false;
  function majBarre() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? (window.scrollY / h) * 100 : 0;
    barre.style.width = p + '%';
    tick = false;
  }
  window.addEventListener('scroll', function () {
    if (!tick) { window.requestAnimationFrame(majBarre); tick = true; }
  }, { passive: true });
  majBarre();
})();
