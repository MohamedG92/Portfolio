# Portfolio — Mohamed Iraqi Houssaini

A one-page personal website. Pure HTML / CSS / JavaScript, no framework.
Hosted on **Vercel (free Hobby plan)**: no server, no database,
no paid service: **€0/month**. Contact goes through `mailto:` / `tel:`.

The site is **self-contained**: Three.js and the fonts are installed with npm and then copied
into the build, so nothing is loaded from a CDN at runtime.

```
new_web/
├── package.json             dependencies (three, @fontsource/*) + scripts
├── vercel.json              deployment config
├── scripts/
│   ├── build.mjs            front/ → dist/ + Three.js + fonts + checks
│   └── serve.mjs            local static server to test dist/
└── front/                   ← site sources
    ├── index.html           page + inline SVG logo sprite
    ├── index.css            styles
    ├── index.js             UI: nav, reveals, cursor, 3D tilt, cube
    ├── hero-gl.js           WebGL hero background (isolated ES module)
    ├── CV-Iraqi-Houssaini-Mohamed.pdf
    └── assets/              portrait / headshot (WebP + JPEG fallback)
```

## Local development

Requires Node 18+.

```bash
npm install
npm run dev        # build + server → http://localhost:4173
```

`npm run build` on its own generates `dist/`; `npm run preview` serves it. After changing
something in `front/`, run `npm run dev` again.

The build **fails** if a referenced local resource (image, CSS, JS, font…) is missing,
or if a `<script>` / stylesheet is loaded from an external domain. It also flags any file
larger than 800 KB.

## Deploying to Vercel

Import the GitHub repository at [vercel.com/new](https://vercel.com/new).
Framework Preset: **Other**. `vercel.json` already sets `npm install`, `npm run build`
and `outputDirectory: "dist"`. Every push to `main` redeploys the site.

## What `vercel.json` does

- build: `npm run build`, serves the content of `dist/`
- `/assets/*` cached for one year (`immutable`), `/fonts/*` and `/vendor/*` for 30 days,
  CSS and JS with a short cache
- security headers: `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy`

## Technical notes

- **`hero-gl.js` is deliberately separate from `index.js`.** If Three.js doesn't load,
  WebGL is missing, or the user turned on "reduce motion", the file does nothing and the
  page stays fully usable: a CSS background (halo + grid) takes over.
- **The hero is interactive**: 1,800 points arranged in a Fibonacci spiral on a sphere,
  connected by ~2,800 segments.
  - the particles **flee the cursor** and heat up towards white-gold as it gets closer;
  - a **click (or tap)** sends a shockwave through the sphere over 2.2 s;
  - **scrolling** scatters and fades the whole thing.

  Points and links share **the same GLSL `warp()` function** and the same uniforms object:
  without that, the lines would detach from the points at the first deformation. Everything
  happens in the vertex shader, with no JavaScript loop per particle.
- On mobile the repulsion is turned off (no cursor), but a tap still triggers the shockwave.
- WebGL rendering pauses when off screen and when the tab is hidden.
- The logos come from [Simple Icons](https://simpleicons.org) (CC0), embedded as an inline
  SVG sprite. MATLAB, Proteus, Assembly, SSH and LinkedIn aren't in it, so they are drawn
  by hand in the sprite.
- The portrait and profile photo were extracted from the PDF CV and then optimised
  (WebP + JPEG fallback).
- `prefers-reduced-motion` turns off WebGL, reveals, counters and the marquee.

## To update later

- The "Open to internships" badge (nav) and the "Available for an observation internship"
  block (Contact section): change them once an internship is found.
- `<link rel="canonical">` and `og:image` in `index.html`: replace the URL with the Vercel
  one once the site is online.
