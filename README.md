# Portfolio — Mohamed Iraqi Houssaini

Site personnel monopage, en français. HTML / CSS / JavaScript purs, sans framework.
Hébergé sur **Vercel (offre Hobby, gratuite)** — aucun serveur, aucune base de données,
aucun service payant : **0 €/mois**. Le contact passe par `mailto:` / `tel:`.

Le site est **autonome** : Three.js et les polices sont installés via npm puis copiés
dans le build — aucune ressource chargée depuis un CDN à l'exécution.

```
new_web/
├── package.json             dépendances (three, @fontsource/*) + scripts
├── vercel.json              config de déploiement
├── scripts/
│   ├── build.mjs            front/ → dist/ + Three.js + polices + vérifications
│   └── serve.mjs            serveur statique local pour tester dist/
└── front/                   ← sources du site
    ├── index.html           page + sprite SVG des logos (inline)
    ├── index.css            styles
    ├── index.js             UI : nav, révélations, curseur, inclinaison 3D, cube
    ├── hero-gl.js           fond WebGL du hero (module ES, isolé)
    ├── CV-Iraqi-Houssaini-Mohamed.pdf
    └── assets/              portrait / headshot (WebP + repli JPEG)
```

## Développement local

Node 18+ requis.

```bash
npm install
npm run dev        # build + serveur → http://localhost:4173
```

`npm run build` seul génère `dist/` ; `npm run preview` le sert. Après une modification
dans `front/`, relancer `npm run dev`.

Le build **échoue** si une ressource locale référencée (image, CSS, JS, police…) est
introuvable, ou si un `<script>` / une feuille de style est chargé depuis un domaine
externe. Il signale aussi tout fichier de plus de 800 Ko.

## Déploiement sur Vercel

Importer le dépôt GitHub sur [vercel.com/new](https://vercel.com/new).
Framework Preset : **Other** — `vercel.json` fixe déjà `npm install`, `npm run build`
et `outputDirectory: "dist"`. Chaque push sur `main` redéploie le site.

## Ce que fait `vercel.json`

- build : `npm run build`, sert le contenu de `dist/`
- `/assets/*` en cache un an (`immutable`), `/fonts/*` et `/vendor/*` 30 jours,
  CSS et JS en cache court
- en-têtes de sécurité : `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy`

## Notes techniques

- **`hero-gl.js` est volontairement séparé d'`index.js`.** Si Three.js ne charge pas,
  si WebGL est absent ou si l'utilisateur a activé « réduire les animations », le
  fichier ne fait rien et la page reste entièrement fonctionnelle : un décor CSS
  (halo + grille) prend le relais.
- **Le hero est interactif** : 1 800 points répartis en spirale de Fibonacci sur une
  sphère, reliés par ~2 800 segments.
  - les particules **fuient le curseur** et chauffent vers le blanc-or en s'approchant ;
  - un **clic (ou un tap)** envoie une onde de choc qui traverse la sphère sur 2,2 s ;
  - le **défilement** disperse et estompe l'ensemble.

  Points et liens partagent la **même fonction GLSL `warp()`** et le même objet
  d'uniforms : sans cela les traits se décrocheraient des points dès la première
  déformation. Tout se passe dans le vertex shader — aucune boucle JS par particule.
- Sur mobile la répulsion est désactivée (pas de curseur), mais le tap déclenche
  bien l'onde de choc.
- Le rendu WebGL se met en pause hors écran et quand l'onglet est caché.
- Les logos viennent de [Simple Icons](https://simpleicons.org) (CC0), intégrés en
  sprite SVG inline. MATLAB, Proteus, Assembly, SSH et LinkedIn n'y figurent pas :
  ils sont dessinés à la main dans le sprite.
- Le portrait et la photo de profil ont été extraits du CV PDF puis optimisés
  (WebP + repli JPEG).
- `prefers-reduced-motion` désactive WebGL, révélations, compteurs et marquee.

## À mettre à jour plus tard

- Le badge « Ouvert aux stages » (nav) et le bloc « Disponible pour un stage
  d'observation » (section Contact) — à changer une fois le stage trouvé.
- `<link rel="canonical">` et `og:image` dans `index.html` : remplacer l'URL par
  celle de Vercel une fois le site en ligne.
