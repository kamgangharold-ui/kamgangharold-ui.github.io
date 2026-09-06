# kamgangharold-ui.github.io

Site personnel de Harold Kamgang, <https://kamgangharold-ui.github.io>

Page unique, HTML/CSS/JS sans étape de build. Quadrilingue FR/EN/ES/DE, mode sombre, sans pisteur
ni cookie. Palette et typographie reprises du CV : navy `#0A1128`, teal `#1A6E8E`, rose `#A97380`,
Roboto Condensed.

---

## Modifier le contenu sans toucher au code

| Ce que tu veux changer | Où |
|---|---|
| Un texte en français | directement dans `index.html` (ou `projets/*.html` pour une page projet) |
| Sa traduction anglaise / espagnole / allemande | `assets/i18n/en.json` (ou `es.json`, `de.json`), à la clé `data-i18n` correspondante |
| Une page projet (traductions) | `projets/i18n/en.json` (ou `es.json`, `de.json`) : un seul fichier partagé par les 4 pages, chaque clé préfixée (`p.`, `k.`, `pa.`, `bc.`) |
| Les couleurs | les variables en haut de `assets/css/style.css` |
| Le CV téléchargeable | remplacer `cv/CV-Harold-KAMGANG-QSE.pdf` |

Le français n'existe **qu'**une seule fois, dans le HTML : il est récolté dans la page au
chargement, donc il n'y a pas de `fr.json` à maintenir en parallèle. Chaque texte traduisible porte
un attribut `data-i18n="clé"`, et cette clé doit exister dans **les trois** fichiers `en.json`,
`es.json` et `de.json` correspondants, sous peine de laisser du français s'afficher dans les
langues où la clé manque (`i18n.js` retombe sur le français si le JSON ne répond pas, mais une clé
absente à l'intérieur d'un JSON valide laisse passer le texte français collecté au chargement,
sans erreur visible).

**Vérifier qu'aucune traduction ne manque**, dans la console du navigateur :

```js
Promise.all(['en','es','de'].map(l=>fetch('assets/i18n/'+l+'.json').then(r=>r.json())))
  .then(([en,es,de])=>{
    const cles=[...new Set([...document.querySelectorAll('[data-i18n]')].map(e=>e.dataset.i18n))];
    console.log('manquantes EN :', cles.filter(k=>!(k in en)));
    console.log('manquantes ES :', cles.filter(k=>!(k in es)));
    console.log('manquantes DE :', cles.filter(k=>!(k in de)));
  });
```

**Ne jamais utiliser de tiret cadratin (U+2014).** Remplacer par une virgule, un point, un
deux-points ou des parenthèses, dans les quatre langues. Vérifier avant de publier :

```bash
grep -rl $'\xe2\x80\x94' --include="*.html" --include="*.json" --include="*.js" .
```

---

## Reste à faire

**1. Brancher le formulaire de contact.** Créer un compte sur <https://formspree.io> (gratuit),
créer un formulaire, récupérer son identifiant, puis remplacer `REMPLACER_PAR_TON_ID` dans
`index.html`. Tant que ce n'est pas fait, le formulaire affiche un message qui renvoie vers LinkedIn,
il ne perd aucun message en silence.

**2. Ajouter une photo (facultatif).** Déposer `assets/img/harold.jpg` et l'appeler depuis la section
d'accueil. Le CV est volontairement sans photo pour éviter les biais des ATS ; un site personnel n'a
pas cette contrainte.

---

## Vie privée

**Aucun numéro de téléphone ni adresse e-mail en clair** dans les fichiers du site, ni dans le PDF
du CV publié ici. L'adresse est assemblée en JavaScript au clic de l'utilisateur, ce qui la rend
invisible aux robots collecteurs.

Le CV publié affiche l'adresse du site et le profil LinkedIn à la place des coordonnées directes.
La version complète, avec téléphone et e-mail, reste dans OneDrive et sert aux candidatures
nominatives.

Pour vérifier avant chaque publication :

```bash
grep -rniE "\+33|\+34|@gmail" --include="*.html" --include="*.js" --include="*.json" .
pdftotext cv/CV-Harold-KAMGANG-QSE.pdf - | grep -iE "\+33|\+34|@gmail"
```

---

## Exactitude des informations

Tout fait affiché ici provient de `PROFIL-CANONIQUE.md`, dans le dépôt privé `harold-career-os`.
Ce site est public et permanent : une contradiction avec un CV déjà envoyé est plus dommageable
qu'une omission. **Ne rien ajouter ici qui ne soit pas d'abord dans le profil canonique.**

## Structure

```
index.html                 contenu (français) + balisage
projets/*.html              4 pages projet (français) + balisage
assets/css/style.css       styles, thème clair et sombre, menu de langue
assets/js/i18n.js          bascule FR/EN/ES/DE (menu déroulant, 4 langues)
assets/js/main.js          thème, menu, e-mail protégé, formulaire
assets/i18n/{en,es,de}.json    traductions de index.html
projets/i18n/{en,es,de}.json   traductions partagées des 4 pages projet
cv/                        CV public (sans coordonnées directes)
robots.txt · sitemap.xml
```
