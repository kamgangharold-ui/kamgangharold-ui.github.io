# kamgangharold-ui.github.io

Harold Kamgang's personal site, <https://kamgangharold-ui.github.io>

## What it does

Single page, plain HTML/CSS/JS, no build step. Four languages (FR/EN/ES/DE), dark mode, no tracker or cookie. Colors and typography match the CV: navy `#0A1128`, teal `#1A6E8E`, rose `#A97380`, Roboto Condensed.

---

## How to use

| What you want to change | Where |
|---|---|
| A French text | directly in `index.html` (or `projets/*.html` for a project page) |
| Its English / Spanish / German translation | `assets/i18n/en.json` (or `es.json`, `de.json`), under the matching `data-i18n` key |
| A project page's translations | `projets/i18n/en.json` (or `es.json`, `de.json`): one file shared by all 4 pages, each key prefixed (`p.`, `k.`, `pa.`, `bc.`) |
| The colors | the variables at the top of `assets/css/style.css` |
| The downloadable CV | replace `cv/CV-Harold-KAMGANG-QSE.pdf` |

French exists **only once**, inside the HTML: it is collected from the page on load, so there is no `fr.json` to keep in sync. Every translatable text carries a `data-i18n="key"` attribute, and that key must exist in **all three** of `en.json`, `es.json` and `de.json`, or French leaks into a language where the key is missing (`i18n.js` falls back to French if the JSON itself fails to load, but a key missing inside a valid JSON silently lets the French text collected at load time show through).

**Check that no translation is missing**, in the browser console:

```js
Promise.all(['en','es','de'].map(l=>fetch('assets/i18n/'+l+'.json').then(r=>r.json())))
  .then(([en,es,de])=>{
    const keys=[...new Set([...document.querySelectorAll('[data-i18n]')].map(e=>e.dataset.i18n))];
    console.log('missing EN:', keys.filter(k=>!(k in en)));
    console.log('missing ES:', keys.filter(k=>!(k in es)));
    console.log('missing DE:', keys.filter(k=>!(k in de)));
  });
```

**Never use an em dash (U+2014).** Replace it with a comma, a period, a colon or parentheses, in all four languages. Check before publishing:

```bash
grep -rl $'\xe2\x80\x94' --include="*.html" --include="*.json" --include="*.js" .
```

---

## Structure

```
index.html                    content (French) + markup
projets/*.html                 4 project pages (French) + markup
assets/css/style.css          styles, light and dark theme, language menu
assets/js/i18n.js             FR/EN/ES/DE switch (dropdown, 4 languages)
assets/js/main.js             theme, menu, protected email, form
assets/i18n/{en,es,de}.json    translations of index.html
projets/i18n/{en,es,de}.json   shared translations of the 4 project pages
cv/                            public CV (no direct contact details)
robots.txt · sitemap.xml
```

## Tracking

None, this README's Status section below is the tracker.

## Status

Active.

**1. Wire up the contact form.** Create an account at <https://formspree.io> (free), create a form, get its ID, then replace `REMPLACER_PAR_TON_ID` in `index.html`. Until then, the form shows a message pointing to LinkedIn instead; it never silently loses a message.

**2. Add a photo (optional).** Drop `assets/img/harold.jpg` and reference it from the hero section. The CV is deliberately photo-free to avoid ATS bias; a personal site has no such constraint.

## Privacy

**No phone number or e-mail address in plain text** anywhere in the site's files, nor in the CV PDF published here. The email address is assembled in JavaScript on click, which keeps it invisible to scraper bots.

The published CV shows the site's address and the LinkedIn profile instead of direct contact details. The full version, with phone and e-mail, stays in OneDrive and is used for named applications.

Check before every publish:

```bash
grep -rniE "\+33|\+34|@gmail" --include="*.html" --include="*.js" --include="*.json" .
pdftotext cv/CV-Harold-KAMGANG-QSE.pdf - | grep -iE "\+33|\+34|@gmail"
```

## Accuracy

Every fact shown here comes from `PROFIL-CANONIQUE.md`, in the private `harold-career-os` repo. This site is public and permanent: a contradiction with a CV already sent does more damage than an omission. **Never add anything here that is not already in the canonical profile.**
