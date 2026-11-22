/* ==========================================================================
   Traductions.

   L'anglais est la langue par défaut : il est écrit directement dans le
   HTML (bon pour le référencement et si JS est désactivé). Ce fichier ne
   contient que le français, indexé par les attributs du HTML :
     data-i18n="clé"        → innerHTML
     data-i18n-aria="clé"   → aria-label
     data-i18n-alt="clé"    → alt
   index.js mémorise la version anglaise d'origine pour pouvoir y revenir.
   ========================================================================== */
window.I18N = {
  meta: {
    en: {
      title: 'Mohamed Iraqi Houssaini — Software Engineering',
      desc: 'Software engineering student at ESISA (Fès). Full-stack development with PHP/MySQL, Node.js, C++ and Python — deployed on an Ubuntu server I manage over SSH. Portfolio, projects and contact.'
    },
    fr: {
      title: 'Mohamed Iraqi Houssaini — Ingénierie logicielle',
      desc: "Étudiant en ingénierie logicielle à l'ESISA (Fès). Développement full-stack PHP/MySQL, Node.js, C++, Python — et déploiement sur serveur Ubuntu administré via SSH. Portfolio, projets et contact."
    }
  },

  /* chaînes produites par le JavaScript (les deux langues) */
  js: {
    en: {
      menuOpen: 'Open menu', menuClose: 'Close menu',
      spinning: 'Spinning…',
      win: 'You win! 🎉', lose: 'So close — try again',
      mailSubject: 'Internship opportunity'
    },
    fr: {
      menuOpen: 'Ouvrir le menu', menuClose: 'Fermer le menu',
      spinning: 'La roue tourne…',
      win: 'Gagné ! 🎉', lose: 'Presque — retentez votre chance',
      mailSubject: 'Opportunité de stage'
    }
  },

  fr: {
    skip: 'Aller au contenu',
    toTop: 'Retour en haut',
    mainNav: 'Navigation principale',
    nav1: 'Profil', nav2: 'Stack', nav3: 'Projets', nav4: 'Parcours', nav5: 'Contact',
    status: 'Ouvert aux stages',
    menuCv: 'Télécharger le CV ↓',

    eyebrow: 'Casablanca, Maroc · ESISA Fès',
    h1: 'Je construis des applications web <em>full-stack</em> et je les <mark>déploie</mark> moi-même.',
    lede: "Étudiant en 3<sup>e</sup> année d'ingénierie logicielle. Mes projets ne s'arrêtent pas au <code>localhost</code> — ils tournent en production sur un serveur Ubuntu que j'administre à distance via SSH.",
    ctaProjects: 'Voir mes projets',
    ctaContact: 'Me contacter',
    glHint: 'Bougez la souris — cliquez dans le fond',
    scrollAria: 'Défiler vers le profil',
    scroll: 'Défiler',
    marqueeAria: 'Technologies utilisées',

    h2About: 'Profil',
    portraitAlt: 'Portrait de Mohamed Iraqi Houssaini',
    role: 'Étudiant en ingénierie logicielle',
    about1: "J'apprends l'ingénierie logicielle à l'ESISA, mais l'essentiel de ce que je sais faire vient de projets menés du premier commit jusqu'à la mise en ligne.",
    about2: "Conception de bases de données relationnelles, back-end en PHP, Python et Node.js, intégration front-end, puis configuration du serveur : installation d'Ubuntu, Apache et MySQL, gestion des accès SSH et du nom de domaine. C'est cette partie « déploiement » qui m'intéresse le plus — voir un projet devenir un service réellement accessible.",
    about3: "Cet été, j'ai effectué un stage chez <strong>Marjane Group</strong>, où j'ai conçu une plateforme qui génère des sites de tombola digitale pour les campagnes des marques en magasin. Je cherche aujourd'hui un nouveau <strong>stage</strong> pour continuer à progresser en milieu professionnel.",
    stat1: 'projets menés à terme',
    stat2: 'stage chez Marjane',
    stat3: 'langues courantes',
    stat4: 'fin de licence',

    h2Stack: 'Stack technique',
    stackMeta: 'Survolez · glissez le cube',
    cubeHint: 'Glissez pour faire tourner',
    grpLang: 'Langages',
    grpBack: 'Back-end &amp; bases de données',
    grpSys: 'Systèmes &amp; déploiement',
    grpTools: 'Outils',
    softT: 'Compétences personnelles',
    soft1: 'Communication', soft2: 'Débat', soft3: 'Travail en équipe', soft4: 'Leadership',
    soft5: 'Prise de parole en public', soft6: 'Résolution de problèmes',
    soft7: 'Autonomie', soft8: 'Esprit critique', soft9: 'Gestion du temps',
    langsT: 'Langues',
    langAr: 'Arabe', langFr: 'Français', langEn: 'Anglais',
    langNative: 'Langue maternelle', langFluent: 'Courant',

    h2Projects: 'Projets',
    projMeta: '9 réalisations',
    enTagRel: 'Sur le Microsoft Store',
    enTagKind: 'Application desktop · Open source',
    enD: "Ma propre <strong>application de prise de notes pour étudiants</strong>, conçue à partir d'un croquis fait main : chapitres numérotés en une touche, listes numérotées automatiques, code collé transformé en <strong>blocs colorés</strong>, autocomplétion à partir de vos propres notes, onglets avec logos des langages et 26 thèmes. Gratuite, et le code source est public.",
    enP1: 'Version Windows <strong>publiée sur le Microsoft Store</strong>, gratuite (paquet MSIX, certifié par Microsoft)',
    enLinkStore: 'Disponible sur le Microsoft Store',
    enP2: 'Version macOS : raccourcis Cmd, barre de titre native, <code>.dmg</code> construit par GitHub Actions pour Apple Silicon &amp; Intel',
    enP3: 'Restauration de session (même les onglets non enregistrés), instance unique, optimisée pour rester légère en RAM',
    enLinkWin: 'Windows · code source',
    enAlt: "EasyNotes92 affichant une note Java avec un chapitre numéroté et un bloc de code coloré",
    tagIntern: 'Stage · Marjane Group',
    tagPlatform: 'Plateforme full-stack',
    tombT: 'Plateforme de tombola digitale',
    tombD: "Une plateforme qui <strong>génère des sites de tombola</strong> pour les campagnes des marques en magasin chez Marjane — Monster Energy, Colgate, etc. Chaque campagne a son propre site, son habillage et son domaine. Le client s'inscrit avec son ticket de caisse, <strong>vérifié par OCR</strong> selon les produits et le montant minimum de la campagne, puis tourne une roue (ou participe à un tirage au sort) et reçoit un code à présenter en magasin.",
    tombP1: 'Back-office sans code : couleurs, logos, bannières, textes, lots &amp; probabilités, règlement',
    tombP2: 'Tirages au sort en direct avec historique, comptes administrateurs et sessions sécurisées',
    tombP3: 'Bilingue français / arabe, pensé mobile d’abord',
    spinBtn: 'Tourner la roue',
    spinIdle: 'Essayez — c’est une démo',
    tagLive: 'En ligne',
    tagEcom: 'E-commerce full-stack',
    velD: "Boutique en ligne de cosmétiques : catalogue produits, fiches détaillées et système de commande. Back-end PHP sur base MySQL, interface responsive. Le site est <strong>déployé sur un serveur Ubuntu personnel</strong> que j'administre via SSH — installation d'Apache et MySQL, gestion du domaine.",
    c1k: 'C++ · Base de données',
    c1t: 'Gestion académique',
    c1d: "Système à deux rôles : l'enseignant gère étudiants, modules, notes et statistiques ; l'étudiant consulte ses notes, sa moyenne et la note minimale requise à l'examen. Évaluations pondérées TP&nbsp;20&nbsp;% / CC&nbsp;30&nbsp;% / EXAM&nbsp;50&nbsp;%.",
    c2k: 'Application web',
    c2t: 'StockFlow · gestion de stock',
    c2d: "Application web pour suivre ses produits en temps réel : catégories, mouvements d'entrée / sortie, API REST en PHP et alertes automatiques quand un produit atteint son seuil critique. Chaque opération est tracée.",
    c3t: "Jeu d'échecs 3D",
    c3d: 'Jeu d’échecs complet en C++ : moteur de règles et logique de partie, interface graphique développée avec Qt, et pièces modélisées en 3D sous Blender.',
    c4k: 'Site vitrine',
    c4t: 'Restaurant de sushis',
    c4d: 'Site vitrine responsive : présentation de la carte, galerie et informations pratiques. Adapté mobile et desktop, sans framework.',
    c5k: 'Python · Sécurité',
    c5t: 'Log Analyzer',
    c5d: "Analyse les journaux SSH d'un serveur Linux, repère les attaques par force brute, géolocalise les adresses IP des attaquants et produit des graphiques et un rapport CSV.",
    c6k: 'Calcul numérique',
    c6t: 'Méthode de dichotomie',
    c6d: "Implémentation de la méthode de bisection en MATLAB pour la résolution numérique d'équations, avec contrôle de la précision et du nombre d'itérations.",

    h2Journey: 'Parcours',
    colExp: 'Expérience',
    expT: 'Stagiaire en développement web',
    expO: 'Plateforme de tombola digitale',
    expD: 'Conception et développement d’une plateforme qui génère des sites de tombola pour les campagnes des marques en magasin (Monster Energy, Colgate) : schéma SQL Server, API Node.js/Express, vérification des tickets par OCR et back-office d’administration sans code.',
    colEdu: 'Formation',
    eduT: 'Licence en Ingénierie Logicielle',
    ongoing: 'en cours',
    eduD: '3<sup>e</sup> année · Filière Ingénierie Logicielle',
    bacT: 'Baccalauréat Sciences Physiques',
    colAct: 'Engagement &amp; activités',
    a1t: 'Invictus Debate — Section anglaise',
    a1o: "Représentant de l'ESISA",
    a1d: "Sélectionné pour représenter l'école en compétition de débat.",
    a2o: 'Co-organisateur',
    a2d: 'Coordination de l’événement et préparation technique des épreuves.',
    a3t: 'Projet documentaire académique',
    a3d: 'Documentaire sur le patrimoine historique marocain.',

    h2Contact: 'Contact',
    contactBig: 'Disponible pour un<br><em>stage.</em>',
    contactSub: "Une question, une opportunité ou simplement envie d'échanger sur un projet ? Le plus simple reste l'email — je réponds sous 24 h.",
    ctaMail: 'Écrire un email',
    kPhone: 'Téléphone',
    kCv: 'Curriculum vitae',
    vCv: 'Télécharger le PDF',
    kLoc: 'Localisation',
    vLoc: 'Casablanca, Maroc',

    footM: 'Conçu et codé à la main — HTML, CSS, JavaScript &amp; WebGL',
    footUp: 'Haut de page ↑'
  }
};
