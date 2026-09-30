/* ==========================================================================
   Mohamed Iraqi Houssaini — portfolio
   Vanilla JS. Three.js est optionnel : la page fonctionne sans.
   ========================================================================== */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

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
    burger.setAttribute('aria-label', 'Ouvrir le menu');
  }
  burger.addEventListener('click', function () {
    if (burger.getAttribute('aria-expanded') === 'true') return closeMenu();
    menu.hidden = false;
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Fermer le menu');
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
  if (h1) {
    // Enveloppe chaque mot en conservant les éléments internes (em, mark).
    (function split(node) {
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
        } else if (child.nodeType === 1) {
          split(child);
        }
      });
    })(h1);

    document.querySelectorAll('.hero__h1 .word > span').forEach(function (el, i) {
      el.style.setProperty('--i', i);
    });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { h1.classList.add('lit'); });
    });
  }

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
    ['cplusplus', 'C++', '#659AD2'], ['python', 'Python', '#4B8BBE'],
    ['php', 'PHP', '#8993BE'], ['javascript', 'JavaScript', '#F7DF1E'],
    ['html5', 'HTML5', '#E34F26'], ['css', 'CSS', '#A277E0'],
    ['mysql', 'MySQL', '#5B9BC7'], ['mariadb', 'MariaDB', '#7FB5C5'],
    ['linux', 'Linux', '#FCC624'], ['ubuntu', 'Ubuntu', '#E95420'],
    ['apache', 'Apache', '#D9534F'], ['gnubash', 'Bash', '#8AC661'],
    ['git', 'Git', '#F05032'], ['github', 'GitHub', '#E7EAEF'],
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

  /* ------------------------------------------- halo curseur + cartes spot */
  if (fine && !reduced) {
    var cur = document.getElementById('cursor');
    var cx = 0, cy = 0, rx = 0, ry = 0, raf = null;

    document.addEventListener('mousemove', function (e) {
      cx = e.clientX; cy = e.clientY;
      document.body.classList.add('has-cursor');
      if (!raf) raf = requestAnimationFrame(follow);
    }, { passive: true });

    function follow() {
      rx += (cx - rx) * 0.13;
      ry += (cy - ry) * 0.13;
      cur.style.transform = 'translate(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px)';
      raf = (Math.abs(cx - rx) > 0.4 || Math.abs(cy - ry) > 0.4)
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
        var dx = (e.clientX - (r.left + r.width / 2)) * 0.22;
        var dy = (e.clientY - (r.top + r.height / 2)) * 0.32;
        el.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)';
      }, { passive: true });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* Le fond WebGL du hero vit dans hero-gl.js (module ES, chargé séparément)
     afin qu'un échec du CDN Three.js n'empêche jamais cette page de marcher. */
})();
