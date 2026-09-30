# Portfolio — Mohamed Iraqi Houssaini

Site personnel monopage, en français. HTML / CSS / JavaScript purs, **aucune étape
de build**, aucune dépendance npm. Three.js est chargé à la demande depuis un CDN.

```
new_web/
├── vercel.json              config de déploiement (racine du dépôt)
└── front/                   ← tout le site est ici
    ├── index.html           page + sprite SVG des logos (inline)
    ├── index.css            styles
    ├── index.js             UI : nav, révélations, compteurs, curseur, marquee
    ├── hero-gl.js           fond WebGL du hero (module ES, isolé)
    ├── CV-Iraqi-Houssaini-Mohamed.pdf
    └── assets/
        ├── portrait.webp / .jpg
        └── headshot.webp / .jpg
```

## Développement local

Ouvrir `front/index.html` directement fonctionne, mais `hero-gl.js` est un module ES :
certains navigateurs bloquent les modules sur `file://`. Mieux vaut servir le dossier :

```bash
cd front
python -m http.server 8777
# → http://127.0.0.1:8777
```

## Déploiement sur Vercel

**Option A — via GitHub (recommandé, redéploie à chaque push)**

```bash
cd new_web
git init
git add .
git commit -m "Portfolio"
git branch -M main
git remote add origin https://github.com/MohamedG92/<nom-du-repo>.git
git push -u origin main
```

Puis sur [vercel.com/new](https://vercel.com/new) : importer le dépôt.
Framework Preset : **Other**. Laisser le reste vide — `vercel.json` s'occupe du
`outputDirectory: "front"`.

**Option B — en ligne de commande**

```bash
npm i -g vercel
cd new_web
vercel          # aperçu
vercel --prod   # production
```

## Ce que fait `vercel.json`

- sert le contenu de `front/`
- `/assets/*` en cache un an (`immutable`), CSS et JS en cache court
- en-têtes de sécurité : `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy`

## Notes techniques

- **`hero-gl.js` est volontairement séparé d'`index.js`.** Si le CDN Three.js tombe,
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
