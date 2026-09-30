/* ==========================================================================
   Fond WebGL du hero — nuage de points sphérique interactif.

     · les particules fuient le curseur et s'illuminent en s'approchant
     · un clic (ou un tap) envoie une onde de choc qui traverse la sphère
     · le défilement disperse et estompe l'ensemble
     · les liens entre points subissent exactement la même déformation

   Module ES isolé : si Three.js ne charge pas, si WebGL manque ou si l'utilisateur
   préfère moins d'animation, ce fichier ne fait rien et la page reste
   parfaitement utilisable (le décor CSS du hero prend le relais).
   ========================================================================== */

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const canvas = document.getElementById('gl');

if (canvas && !reduced) {
  try {
    const THREE = await import('./vendor/three.module.min.js');   // copié depuis node_modules au build
    start(THREE);
  } catch (err) {
    console.warn('[hero-gl] WebGL désactivé :', err && err.message);
  }
}

function start(THREE) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch {
    return;                                   // pas de contexte WebGL
  }

  const hero = canvas.parentNode;
  let W = hero.clientWidth;
  let H = hero.clientHeight;

  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.setSize(W, H, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(52, W / H, 0.1, 100);
  camera.position.z = 15.5;

  const group = new THREE.Group();
  scene.add(group);

  /* ---------------- points sur une sphère (spirale de Fibonacci) ---------------- */
  const N = 1800;
  const R = 7.2;
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const siz = new Float32Array(N);
  const pts = [];

  const hot  = new THREE.Color(0xffc933);   // or, vers l'équateur
  const cool = new THREE.Color(0x5a3f10);   // ambre profond, vers les pôles
  const GOLDEN = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < N; i++) {
    const yn = 1 - (i / (N - 1)) * 2;              // -1 → 1
    const ring = Math.sqrt(Math.max(0, 1 - yn * yn));
    const th = GOLDEN * i;
    const j = 0.94 + Math.random() * 0.12;         // irrégularité : moins « généré »

    const x = Math.cos(th) * ring * R * j;
    const z = Math.sin(th) * ring * R * j;
    const yv = yn * R * j;

    pos[i * 3] = x; pos[i * 3 + 1] = yv; pos[i * 3 + 2] = z;
    pts.push(new THREE.Vector3(x, yv, z));

    // or lumineux vers l'équateur, ambre sombre vers les pôles
    const t = Math.pow(1 - Math.abs(yn), 2.1) * (0.45 + Math.random() * 0.55);
    const c = cool.clone().lerp(hot, t);
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;

    siz[i] = 1.6 + Math.random() * 2.7;
  }

  // profondeur réelle : caméra à 15.5, rayon 7.2 → mv.z ∈ [-22.7, -8.3]
  const Z_FAR = -(camera.position.z + R) - 0.4;
  const Z_NEAR = -(camera.position.z - R) + 0.4;

  /* ---------------- uniforms partagés points + liens ----------------
     Un seul objet : points et liens lisent les mêmes valeurs, donc la
     déformation reste rigoureusement identique entre les deux.          */
  const U = {
    uT:      { value: 0 },
    uDpr:    { value: renderer.getPixelRatio() },
    uNear:   { value: Z_NEAR },
    uFar:    { value: Z_FAR },
    uMouse:  { value: new THREE.Vector2(9, 9) },   // hors écran au départ
    uAspect: { value: W / H },
    uRadius: { value: 0.42 },                      // rayon d'influence (NDC)
    uPush:   { value: 0 },                         // monte quand le pointeur entre
    uWave:   { value: -1 },                        // -1 = pas d'onde en cours
    uWaveAt: { value: new THREE.Vector2(0, 0) },
    uScroll: { value: 0 }
  };

  /* ---------------- déformation partagée (GLSL) ---------------- */
  const WARP = /* glsl */`
    uniform float uT, uAspect, uRadius, uPush, uWave, uScroll, uNear, uFar;
    uniform vec2 uMouse, uWaveAt;

    // Déplace un point et renvoie sa position en espace vue.
    // 'glow' ressort entre 0 et 1 : proximité du curseur ou passage de l'onde.
    vec4 warp(vec3 srcPos, out float glow) {
      vec3 p = srcPos;
      p += normalize(p) * sin(uT * 0.55 + p.y * 0.34) * 0.16;   // respiration lente
      p *= 1.0 + uScroll * 0.28;                                // dispersion au scroll

      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      vec4 cp = projectionMatrix * mv;
      vec2 ndc = cp.xy / max(abs(cp.w), 0.0001);

      // garde le déplacement constant à l'écran quelle que soit la profondeur
      float depth = -mv.z / 15.5;
      glow = 0.0;

      // --- répulsion du curseur ---
      vec2 dm = (ndc - uMouse) * vec2(uAspect, 1.0);
      float dist = length(dm);
      float f = smoothstep(uRadius, 0.0, dist);
      glow = f * uPush;
      mv.xy += normalize(dm + vec2(1e-5)) * f * uPush * 1.15 * depth;

      // --- onde de choc au clic ---
      if (uWave >= 0.0) {
        vec2 dw = (ndc - uWaveAt) * vec2(uAspect, 1.0);
        float dd = length(dw);
        float r = uWave * 1.45;                                 // front qui s'élargit
        float ring = exp(-pow((dd - r) * 5.0, 2.0)) * exp(-uWave * 1.25);
        mv.xy += normalize(dw + vec2(1e-5)) * ring * 1.30 * depth;
        mv.z  += ring * 0.55;
        glow = max(glow, ring);
      }
      return mv;
    }
  `;

  /* ---------------- points ---------------- */
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pg.setAttribute('color', new THREE.BufferAttribute(col, 3));
  pg.setAttribute('aSize', new THREE.BufferAttribute(siz, 1));

  const pmat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,                       // → #define USE_COLOR, attribute vec3 color
    uniforms: U,
    vertexShader: WARP + /* glsl */`
      attribute float aSize;
      uniform float uDpr;
      varying vec3 vC;
      varying float vDepth, vGlow;
      void main(){
        float glow;
        vec4 mv = warp(position, glow);
        vGlow = glow;
        vC = mix(color, vec3(1.0, 0.95, 0.78), glow * 0.85);   // chauffe près du curseur
        vDepth = smoothstep(uFar, uNear, mv.z);                // 0 au fond, 1 devant
        gl_PointSize = aSize * uDpr * (26.0 / -mv.z) * (1.0 + glow * 0.85);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      uniform float uScroll;
      varying vec3 vC;
      varying float vDepth, vGlow;
      void main(){
        float d = length(gl_PointCoord - vec2(0.5));
        float a = smoothstep(0.5, 0.06, d);                    // disque doux
        if (a < 0.01) discard;
        float lum = (0.16 + vDepth * 0.84) * (1.0 + vGlow * 1.5);
        gl_FragColor = vec4(vC, a * lum * (1.0 - uScroll * 0.85));
      }`
  });
  group.add(new THREE.Points(pg, pmat));

  /* ---------------- liens entre points proches (topologie calculée une fois) ---------------- */
  const seg = [];
  const scol = [];
  const MAXD = 1.55;
  const CAP = 3;
  const MAX_SEG = 2800;

  outer:
  for (let a = 0; a < N; a++) {
    let made = 0;
    for (let b = a + 1; b < N; b++) {
      if (pts[a].distanceTo(pts[b]) > MAXD) continue;
      seg.push(pts[a].x, pts[a].y, pts[a].z, pts[b].x, pts[b].y, pts[b].z);
      scol.push(col[a * 3], col[a * 3 + 1], col[a * 3 + 2],
                col[b * 3], col[b * 3 + 1], col[b * 3 + 2]);
      if (seg.length / 6 >= MAX_SEG) break outer;
      if (++made >= CAP) break;
    }
  }

  const lg = new THREE.BufferGeometry();
  lg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(seg), 3));
  lg.setAttribute('color', new THREE.BufferAttribute(new Float32Array(scol), 3));

  // Même fonction warp() que les points : sinon les liens se décrocheraient.
  const lmat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    uniforms: U,
    vertexShader: WARP + /* glsl */`
      varying vec3 vC;
      varying float vGlow;
      void main(){
        float glow;
        vec4 mv = warp(position, glow);
        vGlow = glow;
        vC = mix(color, vec3(1.0, 0.95, 0.78), glow * 0.85);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      uniform float uScroll;
      varying vec3 vC;
      varying float vGlow;
      void main(){
        float a = 0.105 + vGlow * 0.48;
        gl_FragColor = vec4(vC, a * (1.0 - uScroll * 0.85));
      }`
  });
  group.add(new THREE.LineSegments(lg, lmat));

  /* ---------------- interaction ---------------- */
  let mx = 0, my = 0, tx = 0, ty = 0;           // parallaxe amortie
  let pushTarget = 0;                            // 1 quand le pointeur survole
  let waveStart = -1;                            // horodatage du dernier clic
  let running = true, loopId = null;
  const t0 = performance.now();

  const hint = document.getElementById('gl-hint');
  let hinted = false;
  function usedIt() {
    if (hinted) return;
    hinted = true;
    if (hint) hint.classList.add('gone');
  }

  function toNdc(e) {
    const r = hero.getBoundingClientRect();
    return [
      ((e.clientX - r.left) / r.width) * 2 - 1,
      -(((e.clientY - r.top) / r.height) * 2 - 1)
    ];
  }

  if (fine) {
    hero.addEventListener('pointermove', (e) => {
      const [nx, ny] = toNdc(e);
      U.uMouse.value.set(nx, ny);
      pushTarget = 1;
      tx = nx; ty = -ny;                        // réutilisé pour la parallaxe
    }, { passive: true });

    hero.addEventListener('pointerleave', () => { pushTarget = 0; }, { passive: true });
  }

  // clic ou tap → onde de choc (fonctionne aussi au doigt)
  hero.addEventListener('pointerdown', (e) => {
    const [nx, ny] = toNdc(e);
    U.uWaveAt.value.set(nx, ny);
    waveStart = performance.now();
    usedIt();
  }, { passive: true });

  // Onde d'accueil : au repos le champ est immobile, donc rien n'indique
  // qu'il réagit. Une pulsation automatique au chargement le montre d'emblée.
  setTimeout(() => {
    if (waveStart >= 0) return;               // l'utilisateur a déjà cliqué
    U.uWaveAt.value.set(0.18, 0.05);          // dans la zone dégagée, à droite du titre
    waveStart = performance.now();
  }, 1400);

  function frame(now) {
    if (!running) return;
    loopId = requestAnimationFrame(frame);
    const t = (now - t0) / 1000;

    mx += (tx - mx) * 0.045;                    // suivi amorti
    my += (ty - my) * 0.045;

    group.rotation.y = t * 0.052 + mx * 0.30;
    group.rotation.x = Math.sin(t * 0.13) * 0.09 + my * 0.18;

    U.uT.value = t;
    U.uPush.value += (pushTarget - U.uPush.value) * 0.07;   // entrée/sortie douce

    // onde : 2,2 s de vie puis extinction
    if (waveStart >= 0) {
      const age = (now - waveStart) / 1000;
      U.uWave.value = age <= 2.2 ? age : -1;
      if (age > 2.2) waveStart = -1;
    }

    renderer.render(scene, camera);
  }
  loopId = requestAnimationFrame(frame);

  /* ---------------- défilement : dispersion + fondu ---------------- */
  let sTick = false;
  addEventListener('scroll', () => {
    if (sTick) return;
    sTick = true;
    requestAnimationFrame(() => {
      const h = hero.offsetHeight || 1;
      U.uScroll.value = Math.min(1, Math.max(0, (scrollY || pageYOffset) / h));
      sTick = false;
    });
  }, { passive: true });

  /* ---------------- pause hors écran / onglet caché ---------------- */
  function setRunning(v) {
    if (v === running) return;
    running = v;
    if (v) loopId = requestAnimationFrame(frame);
    else if (loopId) cancelAnimationFrame(loopId);
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      (es) => setRunning(es[0].isIntersecting && !document.hidden),
      { threshold: 0.01 }
    ).observe(hero);
  }
  document.addEventListener('visibilitychange', () => setRunning(!document.hidden));

  /* ---------------- redimensionnement ---------------- */
  let rt;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      W = hero.clientWidth; H = hero.clientHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H, false);
      U.uDpr.value = renderer.getPixelRatio();
      U.uAspect.value = W / H;
    }, 160);
  }, { passive: true });

  // le hero est interactif : on le signale une fois, discrètement
  if (hint && fine) hint.classList.add('show');
}
