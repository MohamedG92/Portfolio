/* ==========================================================================
   Build statique → dist/

     1. copie front/ tel quel (aucune transpilation : le site est déjà du
        HTML/CSS/JS navigateur)
     2. embarque Three.js depuis node_modules  → dist/vendor/
     3. embarque les polices (@fontsource)     → dist/fonts/ + fonts.css
     4. vérifie que chaque ressource locale référencée existe, qu'aucune
        ressource d'exécution ne vient d'un domaine externe, et signale
        les fichiers trop lourds

   Aucune dépendance autre que Node : tourne tel quel sur Vercel.
   ========================================================================== */
import { cpSync, rmSync, mkdirSync, readFileSync, writeFileSync,
         readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'front');
const OUT = join(ROOT, 'dist');
const NM = join(ROOT, 'node_modules');

const WARN_BYTES = 800 * 1024;          // au-delà : avertissement
const errors = [];
const warnings = [];

/* ---------------------------------------------------------------- 1. copie */
rmSync(OUT, { recursive: true, force: true });
cpSync(SRC, OUT, { recursive: true });

/* ------------------------------------------------------------- 2. Three.js */
const threeSrc = join(NM, 'three', 'build', 'three.module.min.js');
if (!existsSync(threeSrc)) {
  console.error('✗ three introuvable — lancez « npm install » avant « npm run build ».');
  process.exit(1);
}
mkdirSync(join(OUT, 'vendor'), { recursive: true });
cpSync(threeSrc, join(OUT, 'vendor', 'three.module.min.js'));
const threeVer = JSON.parse(readFileSync(join(NM, 'three', 'package.json'), 'utf8')).version;

/* -------------------------------------------------------------- 3. polices */
// Sous-ensemble « latin » uniquement : couvre le français (é, è, à, ç, œ…).
const FONTS = [
  ['ibm-plex-sans', 'IBM Plex Sans', [400, 500, 600, 700]],
  ['ibm-plex-mono', 'IBM Plex Mono', [400, 500, 600]],
  ['space-grotesk', 'Space Grotesk', [500, 600, 700]]
];
mkdirSync(join(OUT, 'fonts'), { recursive: true });
let css = '/* Généré par scripts/build.mjs — polices auto-hébergées (@fontsource, OFL) */\n';
for (const [pkg, family, weights] of FONTS) {
  for (const w of weights) {
    const file = `${pkg}-latin-${w}-normal.woff2`;
    const from = join(NM, '@fontsource', pkg, 'files', file);
    if (!existsSync(from)) { errors.push(`police manquante : ${file}`); continue; }
    cpSync(from, join(OUT, 'fonts', file));
    css += `@font-face{font-family:'${family}';font-style:normal;font-weight:${w};` +
           `font-display:swap;src:url(./${file}) format('woff2');` +
           `unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,` +
           `U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,` +
           `U+2212,U+2215,U+FEFF,U+FFFD}\n`;
  }
}
writeFileSync(join(OUT, 'fonts', 'fonts.css'), css);

/* ---------------------------------------------------------- 4. vérification */
function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}
const files = walk(OUT);

// Références locales dans HTML / CSS / JS
const PATTERNS = [
  /\b(?:src|href|srcset)\s*=\s*["']([^"']+)["']/g,   // attributs HTML
  /url\(\s*["']?([^"')]+)["']?\s*\)/g,                // CSS url()
  /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,           // import() dynamique
  /\bfrom\s+["']([^"']+)["']/g                        // import statique
];
// Ressources chargées à l'exécution : doivent être locales.
// (<a href>, rel=canonical et og:* sont des liens, pas des chargements.)
const RUNTIME_EXT = new RegExp(
  '<script\\b[^>]*\\bsrc\\s*=\\s*["\'](?:https?:)?//[^"\']*' +
  '|<link\\b(?=[^>]*\\brel\\s*=\\s*["\'](?:stylesheet|preload|modulepreload|icon)["\'])' +
  '[^>]*\\bhref\\s*=\\s*["\'](?:https?:)?//[^"\']*', 'gi');

for (const f of files.filter((p) => /\.(html|css|js)$/.test(p))) {
  const text = readFileSync(f, 'utf8');
  const rel = relative(OUT, f);

  if (f.endsWith('.html')) {
    for (const m of text.matchAll(RUNTIME_EXT)) {
      // les <a href> externes sont normaux ; <script>/<link> externes non
      errors.push(`${rel} : ressource externe chargée à l'exécution → ${m[0].slice(0, 90)}…`);
    }
  }
  if (/\bimport\s*\(\s*["']https?:/.test(text) || /\bfrom\s+["']https?:/.test(text)) {
    errors.push(`${rel} : import JavaScript depuis un domaine externe`);
  }

  for (const re of PATTERNS) {
    for (const m of text.matchAll(re)) {
      for (let ref of m[1].split(',')) {
        ref = ref.trim().split(/\s+/)[0];                     // srcset : "a.webp 1x"
        if (!ref || /^(https?:|mailto:|tel:|data:|#|%23|javascript:)/.test(ref)) continue;
        if (ref.includes('<')) continue;                      // fragment de SVG inline
        if (ref.startsWith('//')) continue;
        const clean = decodeURIComponent(ref.split(/[?#]/)[0]);
        if (!clean) continue;
        const target = clean.startsWith('/') ? join(OUT, clean) : join(dirname(f), clean);
        if (!existsSync(target)) errors.push(`${rel} : référence introuvable → ${ref}`);
      }
    }
  }
}

// Poids
let total = 0;
for (const f of files) {
  const size = statSync(f).size;
  total += size;
  if (size > WARN_BYTES) warnings.push(`${relative(OUT, f)} pèse ${(size / 1024).toFixed(0)} Ko`);
}

/* ----------------------------------------------------------------- rapport */
const kb = (n) => (n / 1024).toFixed(0) + ' Ko';
console.log(`✓ dist/ généré — ${files.length} fichiers, ${kb(total)} au total`);
console.log(`  three ${threeVer} embarqué · ${FONTS.reduce((n, f) => n + f[2].length, 0)} polices woff2`);
for (const w of warnings) console.log(`  ⚠ ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error(`✗ build échoué : ${errors.length} erreur(s)`);
  process.exit(1);
}
