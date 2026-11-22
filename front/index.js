/* ==========================================================================
   Mohamed Iraqi Houssaini — portfolio
   Vanilla JS. Three.js est optionnel : la page fonctionne sans.
   ========================================================================== */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ------------------------------------------------------ langue (EN / FR)
     L'anglais est écrit dans le HTML. Au premier passage on mémorise chaque
     texte anglais, puis on bascule vers le dictionnaire de i18n.js.        */
  var I18N = window.I18N || { fr: {}, js: { en: {}, fr: {} }, meta: {} };
  var lang = 'en';
  try { if (localStorage.getItem('lang') === 'fr') lang = 'fr'; } catch (e) {}

  var nodes = [].slice.call(document.querySelectorAll('[data-i18n],[data-i18n-aria],[data-i18n-alt]'));
  nodes.forEach(function (el) {
    if (el.hasAttribute('data-i18n')) el._en = el.innerHTML.trim();
    if (el.hasAttribute('data-i18n-aria')) el._enAria = el.getAttribute('aria-label');
    if (el.hasAttribute('data-i18n-alt')) el._enAlt = el.getAttribute('alt');
  });

  function T(key) { return (I18N.js[lang] && I18N.js[lang][key]) || I18N.js.en[key] || key; }

  function applyLang(next) {
    lang = next;
    var fr = lang === 'fr' ? I18N.fr : null;
    nodes.forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (k) {
        var html = fr && fr[k] != null ? fr[k] : el._en;
        if (el.innerHTML !== html) { el.innerHTML = html; el._gen = (el._gen || 0) + 1; }
      }
      k = el.getAttribute('data-i18n-aria');
      if (k) el.setAttribute('aria-label', fr && fr[k] != null ? fr[k] : el._enAria);
      k = el.getAttribute('data-i18n-alt');
      if (k) el.setAttribute('alt', fr && fr[k] != null ? fr[k] : el._enAlt);
    });
    document.documentElement.lang = lang;
    var meta = I18N.meta[lang];
    if (meta) {
      document.title = meta.title;
      var d = document.querySelector('meta[name="description"]');
      if (d) d.setAttribute('content', meta.desc);
    }
    document.querySelectorAll('.lang__b').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang));
    });
    var mail = document.getElementById('mailto');
    if (mail) mail.href = 'mailto:IraqiMohamed92@gmail.com?subject=' + encodeURIComponent(T('mailSubject'));
    var bg = document.getElementById('burger');
    if (bg) bg.setAttribute('aria-label', T(bg.getAttribute('aria-expanded') === 'true' ? 'menuClose' : 'menuOpen'));
    try { localStorage.setItem('lang', lang); } catch (e) {}
  }
  if (lang !== 'en') applyLang(lang);        // avant le découpage du titre

  document.querySelectorAll('.lang__b').forEach(function (b) {
    b.addEventListener('click', function () {
      var next = b.getAttribute('data-lang');
      if (next === lang) return;
      applyLang(next);
      if (h1) splitTitle();                  // le titre a été réécrit : on le redécoupe
    });
  });

  /* ---------------------------------------------------------------- année */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ------------------------------------------------- nav : état + progrès */
  var nav = document.getElementById('nav');
  var bar = document.getElementById('progress');
  var tick = false;

  function onScroll() {
    var s = window.scrollY || window.pageYOffset;
    nav.classList.toggle('is-stuck', s > 12);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? (s / max) * 100 : 0) + '%';
    tick = false;
  }
  window.addEventListener('scroll', function () {
    if (!tick) { window.requestAnimationFrame(onScroll); tick = true; }
  }, { passive: true });
  onScroll();

  /* ------------------------------------------------------------ menu mobile */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');

  function closeMenu() {
    menu.hidden = true;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', T('menuOpen'));
  }
  burger.addEventListener('click', function () {
    if (burger.getAttribute('aria-expanded') === 'true') return closeMenu();
    menu.hidden = false;
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', T('menuClose'));
  });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
      closeMenu(); burger.focus();
    }
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 760 && burger.getAttribute('aria-expanded') === 'true') closeMenu();
  });

  /* ------------------------------------------ titre : révélation mot à mot */
  var h1 = document.querySelector('[data-split]');

  // Enveloppe chaque mot en conservant les éléments internes (em, mark).
  function split(node) {
    Array.prototype.slice.call(node.childNodes).forEach(function (child) {
      if (child.nodeType === 3) {
        var frag = document.createDocumentFragment();
        child.nodeValue.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          var w = document.createElement('span');
          w.className = 'word';
          var inner = document.createElement('span');
          inner.textContent = part;
          w.appendChild(inner);
          frag.appendChild(w);
        });
        node.replaceChild(frag, child);
      } else if (child.nodeType === 1 && !child.classList.contains('word')) {
        split(child);
      }
    });
  }

  function splitTitle() {
    h1.classList.remove('lit');
    split(h1);
    h1.querySelectorAll('.word > span').forEach(function (el, i) {
      el.style.setProperty('--i', i);
    });
    if (reduced) h1.classList.add('lit');         // rien à animer : visible tout de suite
    else requestAnimationFrame(function () {
      requestAnimationFrame(function () { h1.classList.add('lit'); });
    });
  }
  if (h1) splitTitle();

  /* ------------------------------------------------- révélation au scroll */
  var reveals = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------- terminal */
  var term = document.getElementById('term');
  if (term) {
    if (reduced || !('IntersectionObserver' in window)) term.classList.add('on');
    else {
      var tio = new IntersectionObserver(function (es, o) {
        es.forEach(function (e) { if (e.isIntersecting) { term.classList.add('on'); o.disconnect(); } });
      }, { threshold: 0.25 });
      tio.observe(term);
    }
  }

  /* ------------------------------------------------ compteurs statistiques */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    if (reduced || !('IntersectionObserver' in window)) {
      counters.forEach(function (el) { el.textContent = pad(+el.dataset.count); });
    } else {
      var cio = new IntersectionObserver(function (es, o) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          run(e.target); o.unobserve(e.target);
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { cio.observe(el); });
    }
  }
  // Seuls les petits décomptes s'animent — une année qui défile depuis 0
  // ressemble à un bug, donc « 2027 » est écrit en dur dans le HTML.
  function pad(v) { return ('0' + v).slice(-2); }

  function run(el) {
    var to = +el.dataset.count, t0 = performance.now(), dur = 1100;
    (function step(now) {
      var p = Math.min(1, (now - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);          // easeOutCubic
      el.textContent = pad(Math.round(to * e));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ------------------------------------------------ lien de nav actif (spy) */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav__links a'));
  var secs = links.map(function (a) { return document.querySelector(a.getAttribute('href')); })
                  .filter(Boolean);
  if (secs.length && 'IntersectionObserver' in window) {
    var seen = new Map();
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) { seen.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0); });
      var best = null, r = 0;
      seen.forEach(function (v, k) { if (v > r) { r = v; best = k; } });
      links.forEach(function (a) { a.classList.toggle('on', best && a.getAttribute('href') === '#' + best); });
    }, { rootMargin: '-25% 0px -45% 0px', threshold: [0, .15, .4, .75, 1] });
    secs.forEach(function (s) { spy.observe(s); });
  }

  /* -------------------------------------------------- marquee (logos tech) */
  var MQ = [
    ['java', 'Java', '#E76F00'], ['cplusplus', 'C++', '#659AD2'], ['python', 'Python', '#4B8BBE'],
    ['php', 'PHP', '#8993BE'], ['javascript', 'JavaScript', '#F7DF1E'],
    ['node', 'Node.js', '#5FA04E'], ['db', 'SQL Server', '#E0443B'],
    ['html5', 'HTML5', '#E34F26'], ['css', 'CSS', '#A277E0'],
    ['mysql', 'MySQL', '#5B9BC7'], ['mariadb', 'MariaDB', '#7FB5C5'],
    ['linux', 'Linux', '#FCC624'], ['ubuntu', 'Ubuntu', '#E95420'],
    ['apache', 'Apache', '#D9534F'], ['gnubash', 'Bash', '#8AC661'], ['figma', 'Figma', '#F24E1E'],
    ['git', 'Git', '#F05032'], ['ssh', 'SSH', '#9AA6B5'],
    ['qt', 'Qt', '#41CD52'], ['blender', 'Blender', '#EA7600'],
    ['matlab', 'MATLAB', '#E8993A'], ['vercel', 'Vercel', '#E7EAEF']
  ];
  var mq = document.getElementById('mq');
  if (mq) {
    var html = MQ.map(function (t) {
      return '<span class="mq" style="--c:' + t[2] + '">' +
             '<svg class="ico" aria-hidden="true"><use href="#i-' + t[0] + '"/></svg>' +
             '<span>' + t[1] + '</span></span>';
    }).join('');
    mq.innerHTML = html + html; // deux copies : la boucle translate de -50%
  }

  /* ------------------------------------ curseur : halo + point + anneau */
  if (fine && !reduced) {
    var cur = document.getElementById('cursor');
    var dot = document.getElementById('cur-dot');
    var ring = document.getElementById('cur-ring');
    var cx = -100, cy = -100, rx = -100, ry = -100, hx = -100, hy = -100, raf = null;

    document.addEventListener('mousemove', function (e) {
      cx = e.clientX; cy = e.clientY;
      dot.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
      document.body.classList.add('has-cursor');
      if (!raf) raf = requestAnimationFrame(follow);
    }, { passive: true });
    document.documentElement.addEventListener('mouseleave', function () { document.body.classList.remove('has-cursor'); });
    document.addEventListener('mousedown', function () { document.body.classList.add('cur-down'); });
    document.addEventListener('mouseup', function () { document.body.classList.remove('cur-down'); });

    var HOVER = 'a, button, [data-tilt], .tech li, .soft__l li, .cube-stage';
    document.addEventListener('mouseover', function (e) {
      document.body.classList.toggle('cur-hover', !!e.target.closest(HOVER));
    }, { passive: true });

    function follow() {
      rx += (cx - rx) * 0.2;  ry += (cy - ry) * 0.2;       // anneau : suit vite
      hx += (cx - hx) * 0.08; hy += (cy - hy) * 0.08;      // halo : traîne
      ring.style.transform = 'translate(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px)';
      cur.style.transform = 'translate(' + hx.toFixed(1) + 'px,' + hy.toFixed(1) + 'px)';
      raf = (Math.abs(cx - hx) > 0.4 || Math.abs(cy - hy) > 0.4)
        ? requestAnimationFrame(follow) : null;
    }

    document.querySelectorAll('.spot').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }, { passive: true });
    });

    // boutons magnétiques
    document.querySelectorAll('.magnet').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * 0.28;
        var dy = (e.clientY - (r.top + r.height / 2)) * 0.38;
        el.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)';
      }, { passive: true });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });

    /* --------------------------- inclinaison 3D + reflet sur [data-tilt] */
    document.querySelectorAll('[data-tilt]').forEach(function (el) {
      var max = +el.getAttribute('data-tilt') || 8;
      el.classList.add('tilt');
      var glare = document.createElement('span');
      glare.className = 'tilt__glare';
      glare.setAttribute('aria-hidden', 'true');
      el.appendChild(glare);
      var pending = null, tr = null;

      el.addEventListener('mousemove', function (e) {
        pending = e;
        if (tr) return;
        tr = requestAnimationFrame(function () {
          tr = null;
          var r = el.getBoundingClientRect();
          var px = (pending.clientX - r.left) / r.width;      // 0 → 1
          var py = (pending.clientY - r.top) / r.height;
          el.classList.add('is-tilting');
          el.style.setProperty('--ry', ((px - 0.5) * 2 * max).toFixed(2) + 'deg');
          el.style.setProperty('--rx', ((0.5 - py) * 2 * max).toFixed(2) + 'deg');
          el.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
          el.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
          // le navigateur du projet vedette réagit plus fort
          if (el.classList.contains('feat')) {
            el.style.setProperty('--bry', ((px - 0.5) * 22).toFixed(2) + 'deg');
            el.style.setProperty('--brx', ((0.5 - py) * 14).toFixed(2) + 'deg');
          }
        });
      }, { passive: true });

      el.addEventListener('mouseleave', function () {
        el.classList.remove('is-tilting');
        ['--rx', '--ry', '--bry', '--brx'].forEach(function (k) { el.style.setProperty(k, '0deg'); });
      });
    });
  }

  /* -------------------------------- cube 3D : rotation auto + glisser */
  var stage = document.getElementById('cube');
  if (stage) {
    var cube = stage.querySelector('.cube');
    var CRUISE = reduced ? 0 : 0.28;
    var ax = -22, ay = 35, vx = 0, vy = CRUISE, dragging = false;
    var lx = 0, ly = 0, visible = false, cubeRaf = null;

    function paint() {
      cube.style.transform = 'rotateX(' + ax.toFixed(2) + 'deg) rotateY(' + ay.toFixed(2) + 'deg)';
    }
    function spin() {
      cubeRaf = null;
      if (!visible) return;
      if (!dragging) {
        ay += vy; ax += vx;
        vx *= 0.94;                                  // l'élan vertical retombe
        vy += (CRUISE - vy) * 0.03;                  // revient à la rotation de croisière
        ax += (-22 - ax) * 0.02;                     // et à l'inclinaison de repos
      }
      paint();
      cubeRaf = requestAnimationFrame(spin);
    }
    function kick() { if (!cubeRaf && visible) cubeRaf = requestAnimationFrame(spin); }

    stage.addEventListener('pointerdown', function (e) {
      dragging = true; lx = e.clientX; ly = e.clientY;
      stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - lx, dy = e.clientY - ly;
      lx = e.clientX; ly = e.clientY;
      ay += dx * 0.5; ax -= dy * 0.5;
      vy = dx * 0.5; vx = -dy * 0.5;                 // inertie au lâcher
      paint();
    });
    ['pointerup', 'pointercancel'].forEach(function (t) {
      stage.addEventListener(t, function () { dragging = false; });
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; kick(); }).observe(stage);
    } else { visible = true; kick(); }
  }

  /* --------------------- réseau de particules en fond de page (canvas 2D)
     Prolonge la texture du hero sur toutes les sections. Tourne seulement
     quand le hero (qui a son propre WebGL) est sorti de l'écran.          */
  var net = document.getElementById('bgnet');
  var heroEl = document.querySelector('.hero');
  if (net && net.getContext) {
    var ctx = net.getContext('2d');
    var P = [], NW = 0, NH = 0, ndpr = 1, netOn = false, netRaf = null;
    var mxN = -9999, myN = -9999;
    var LINK = 150, GOLD = '192,132,252';

    function sizeNet() {
      ndpr = Math.min(window.devicePixelRatio || 1, 1.5);
      NW = window.innerWidth; NH = window.innerHeight;
      net.width = NW * ndpr; net.height = NH * ndpr;
      ctx.setTransform(ndpr, 0, 0, ndpr, 0, 0);
      var count = Math.min(60, Math.round((NW * NH) / 24000));
      while (P.length < count) P.push({ x: Math.random() * NW, y: Math.random() * NH,
        vx: (Math.random() - 0.5) * 0.14, vy: (Math.random() - 0.5) * 0.14, r: 0.8 + Math.random() * 1.4 });
      P.length = count;
    }

    function drawNet() {
      ctx.clearRect(0, 0, NW, NH);
      for (var i = 0; i < P.length; i++) {
        var a = P[i];
        if (!reduced) {
          a.x += a.vx; a.y += a.vy;
          if (a.x < -20) a.x = NW + 20; else if (a.x > NW + 20) a.x = -20;
          if (a.y < -20) a.y = NH + 20; else if (a.y > NH + 20) a.y = -20;
        }
        for (var j = i + 1; j < P.length; j++) {
          var b = P[j], dx = a.x - b.x, dy = a.y - b.y, d = dx * dx + dy * dy;
          if (d < LINK * LINK) {
            ctx.strokeStyle = 'rgba(' + GOLD + ',' + ((1 - Math.sqrt(d) / LINK) * 0.13).toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        // liens vers le curseur
        var mdx = a.x - mxN, mdy = a.y - myN, md = mdx * mdx + mdy * mdy;
        if (md < 200 * 200) {
          ctx.strokeStyle = 'rgba(' + GOLD + ',' + ((1 - Math.sqrt(md) / 200) * 0.25).toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mxN, myN); ctx.stroke();
        }
        ctx.fillStyle = 'rgba(' + GOLD + ',.4)';
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.283); ctx.fill();
      }
    }

    function loopNet() {
      netRaf = null;
      if (!netOn) return;               // onglet masqué : le navigateur suspend déjà rAF
      drawNet();
      if (!reduced) netRaf = requestAnimationFrame(loopNet);
    }
    function setNet(v) {
      netOn = v;
      net.classList.toggle('on', v);
      if (v && !netRaf) netRaf = requestAnimationFrame(loopNet);
    }

    sizeNet();
    window.addEventListener('resize', function () { sizeNet(); if (reduced && netOn) drawNet(); });
    if (fine) {
      document.addEventListener('mousemove', function (e) { mxN = e.clientX; myN = e.clientY; }, { passive: true });
    }
    if (heroEl && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { setNet(!es[0].isIntersecting); }, { threshold: 0.05 }).observe(heroEl);
    } else setNet(true);
  }

  /* -------------------------- roue de la tombola (démo, projet vedette) */
  var wheel = document.getElementById('wheel');
  var spinBtn = document.getElementById('spin');
  var spinRes = document.getElementById('spin-res');
  if (wheel && spinBtn) {
    var rot = 0, busy = false;
    var SEG = 8;                                  // cases paires = gagnantes (or)
    var SPIN_MS = reduced ? 350 : 4200;           // = durée de la transition CSS

    // Le bouton ET la roue lancent le tour : on clique d'instinct sur la roue.
    function spinWheel() {
      if (busy) return;
      busy = true;
      spinBtn.disabled = true;
      spinRes.classList.remove('is-win', 'is-lose');
      spinRes.textContent = T('spinning');
      rot += (reduced ? 1 : 5 + Math.floor(Math.random() * 3)) * 360 + Math.random() * 360;
      wheel.style.transitionDuration = SPIN_MS + 'ms';
      wheel.style.transform = 'rotate(' + rot.toFixed(1) + 'deg)';
      // Minuterie plutôt que « transitionend » : cet évènement ne part pas
      // toujours (onglet masqué, transition interrompue) et bloquait la démo.
      setTimeout(finish, SPIN_MS + 60);
    }
    spinBtn.addEventListener('click', spinWheel);
    wheel.parentNode.addEventListener('click', spinWheel);

    function finish() {
      busy = false;
      spinBtn.disabled = false;
      // la case sous le repère (en haut) : angle d'origine ramené dans [0, 360)
      var under = (360 - (rot % 360)) % 360;
      var win = Math.floor(under / (360 / SEG)) % 2 === 0;
      spinRes.textContent = T(win ? 'win' : 'lose');
      spinRes.classList.add(win ? 'is-win' : 'is-lose');
    }
  }

  /* ------------------------ titres de section : effet « décodage » */
  if (!reduced && 'IntersectionObserver' in window) {
    var GLYPHS = '!<>-_/[]{}=+*^?#01';
    var sio = new IntersectionObserver(function (es, o) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        o.unobserve(e.target);
        scramble(e.target);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('.sh__t').forEach(function (el) { sio.observe(el); });
  }

  function scramble(el) {
    var final = el.textContent, n = final.length, frame = 0, total = 28, gen = el._gen;
    el.style.minWidth = el.offsetWidth + 'px';     // pas de saut de mise en page
    (function step() {
      if (el._gen !== gen) { el.style.minWidth = ''; return; }   // langue changée entre-temps
      var out = '';
      for (var i = 0; i < n; i++) {
        if (final[i] === ' ' || frame >= (i / n) * total * 0.7 + 6) out += final[i];
        else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (++frame <= total) requestAnimationFrame(step);
      else { el.textContent = final; el.style.minWidth = ''; }
    })();
  }

  /* Le fond WebGL du hero vit dans hero-gl.js (module ES, chargé séparément)
     afin qu'un échec du CDN Three.js n'empêche jamais cette page de marcher. */
})();
