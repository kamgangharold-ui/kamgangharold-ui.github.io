/* ═══════════════════════════════════════════════════════════════════
   Thème, menu mobile, surlignage de la navigation, adresse e-mail
   protégée des robots, et envoi du formulaire.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── Thème clair / sombre ──────────────────────────────────────── */
  var THEME = "hk-theme";
  var root = document.documentElement;

  try {
    var saved = localStorage.getItem(THEME);
    if (saved === "dark" || saved === "light") root.dataset.theme = saved;
  } catch (e) { /* navigation privée */ }

  var themeBtn = document.getElementById("theme");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var isDark = root.dataset.theme === "dark" ||
        (root.dataset.theme === "auto" &&
         window.matchMedia("(prefers-color-scheme: dark)").matches);
      root.dataset.theme = isDark ? "light" : "dark";
      try { localStorage.setItem(THEME, root.dataset.theme); } catch (e) { /* ignore */ }
    });
  }

  /* ── Menu mobile ───────────────────────────────────────────────── */
  var burger = document.getElementById("burger");
  var menu = document.getElementById("navmenu");

  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
    });
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        menu.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ── Surlignage de la section courante ─────────────────────────── */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav__menu a[href^="#"]'));
  var targets = links
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  if (targets.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle("is-on", a.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    targets.forEach(function (t) { spy.observe(t); });
  }

  /* ── Adresse e-mail assemblée au clic ──────────────────────────────
     Elle n'apparaît nulle part en clair dans les fichiers du site :
     les robots collecteurs d'adresses ne la trouvent pas.            */
  var mailBtn = document.getElementById("mailbtn");
  if (mailBtn) {
    mailBtn.addEventListener("click", function () {
      var user = ["kamgang", "harold"].join("");
      var host = ["gmail", "com"].join(".");
      var addr = user + String.fromCharCode(64) + host;
      var label = mailBtn.querySelector("span");
      label.textContent = addr;
      mailBtn.setAttribute("aria-live", "polite");

      var link = document.createElement("a");
      link.className = "ct__link";
      link.href = "mailto:" + addr;
      link.innerHTML = mailBtn.innerHTML;
      mailBtn.replaceWith(link);
    }, { once: true });
  }

  /* ── Formulaire ────────────────────────────────────────────────── */
  var form = document.getElementById("form");
  var note = document.getElementById("formnote");

  if (form && note) {
    form.addEventListener("submit", function (e) {
      if (form.action.indexOf("REMPLACER_PAR_TON_ID") !== -1) {
        e.preventDefault();
        note.textContent = document.documentElement.lang === "en"
          ? "The form is not connected yet — please use LinkedIn or the email button."
          : "Le formulaire n'est pas encore relié — utilise LinkedIn ou le bouton e-mail.";
        return;
      }

      e.preventDefault();
      note.textContent = document.documentElement.lang === "en" ? "Sending…" : "Envoi en cours…";

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          form.reset();
          note.textContent = document.documentElement.lang === "en"
            ? "Thank you — I'll get back to you within 48 hours."
            : "Merci — je reviens vers vous sous 48 heures.";
        })
        .catch(function () {
          note.textContent = document.documentElement.lang === "en"
            ? "Sending failed. Please reach me on LinkedIn."
            : "L'envoi a échoué. Contactez-moi plutôt sur LinkedIn.";
        });
    });
  }

  /* ── Année du pied de page ─────────────────────────────────────── */
  var yr = document.getElementById("yr");
  if (yr) yr.textContent = String(new Date().getFullYear());
})();
