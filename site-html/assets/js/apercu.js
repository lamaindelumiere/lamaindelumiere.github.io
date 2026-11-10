/* =====================================================================
   LA MAIN DE LUMIÈRE — APERÇU DU CHAPELET PERSONNALISÉ
   Dessine le chapelet en direct selon les choix du client :
   couleur des perles, finition (dorée / argentée), médaille, occasion.
   Fonctionne avec les listes de choix de l'espace admin : les couleurs
   sont reconnues par leur nom (rose, bleu ciel, nacré, cristal…).
   ===================================================================== */
(function () {
  'use strict';
  var perso = document.getElementById('perso');
  var media = document.querySelector('.product-media');
  if (!perso || !media) return;

  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function champ(motif) {
    var liste = perso.querySelectorAll('select[data-option], input[data-option]');
    for (var i = 0; i < liste.length; i++) if (motif.test(norm(liste[i].getAttribute('data-option')))) return liste[i];
    return null;
  }
  var chPerles = champ(/perle/);
  if (!chPerles) return; // pas un chapelet : pas d'aperçu
  var chFinition = champ(/finition|metal|maillon|croix/);
  var chMedaille = champ(/medaille/);
  var chOccasion = champ(/occasion|evenement|celebration/);

  // ------------------------------------------------------------ COULEURS
  function hex2rgb(h) { h = h.replace('#', ''); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
  function rgb2hex(c) { return '#' + c.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
  function mix(a, b, t) { var x = hex2rgb(a), y = hex2rgb(b); return rgb2hex([0, 1, 2].map(function (i) { return x[i] + (y[i] - x[i]) * t; })); }

  var TEINTES = [ // [motif reconnu dans le nom, couleur]
    [/rose (poudre|pale|clair)|poudre/, '#efc3c8'], [/fuchsia|framboise/, '#d2477e'], [/rose/, '#eaa7b6'],
    [/bordeaux|grenat/, '#7c1f2e'], [/rouge/, '#c0392b'], [/corail|peche|saumon/, '#f2a585'], [/orange/, '#e8893a'],
    [/jaune|soleil/, '#f1cf5a'], [/vert (d.eau|menthe|clair)|menthe|vert d/, '#b9e0cf'], [/olive|kaki/, '#8a8f4a'],
    [/emeraude|vert (fonce|sapin)|sapin/, '#1f7a54'], [/vert/, '#5fae7b'], [/turquoise|lagon|caraibe/, '#40c1c4'],
    [/bleu (ciel|clair|pale|layette)|ciel|layette/, '#a9cfee'], [/marine|nuit/, '#1f3260'], [/bleu roi|roi/, '#2c55b3'],
    [/bleu/, '#5b8fd1'], [/lavande|lilas|parme/, '#c9b6e4'], [/violet|mauve|prune|amethyste/, '#8058a8'],
    [/noir|jais|onyx/, '#202024'], [/gris|perle grise|anthracite/, '#9aa0a6'], [/marron|chocolat|bois|brun/, '#7a4e2d'],
    [/beige|sable|creme|champagne/, '#ead9bc'], [/ivoire|ecru/, '#f6eedb']
  ];
  var MULTI = ['#f2b8c6', '#a9cfee', '#bfe3c9', '#d6c4ee', '#f7d6a6'];

  function stylePerles(nom) {
    var n = norm(nom);
    if (!n) return { type: 'nacre' };
    if (/autre|preciser/.test(n)) return { type: 'nacre', inconnu: true };
    if (/multi|arc.en.ciel|melange|assorti/.test(n)) return { type: 'multi' };
    if (/cristal|transparent|verre/.test(n)) return { type: 'cristal' };
    if (/nacre|perle blanche|blanc nacre/.test(n)) return { type: 'nacre' };
    if (/dore|^or$|^or |gold/.test(n)) return { type: 'metal', metal: 'or' };
    if (/argente|argent/.test(n)) return { type: 'metal', metal: 'argent' };
    for (var i = 0; i < TEINTES.length; i++) if (TEINTES[i][0].test(n)) return { type: 'couleur', c: TEINTES[i][1] };
    if (/blanc/.test(n)) return { type: 'couleur', c: '#fbfbf8' };
    return { type: 'nacre', inconnu: true };
  }
  function metalChoisi(nom) {
    var n = norm(nom);
    if (/argent|acier|silver/.test(n)) return 'argent';
    if (/rose/.test(n) && /or/.test(n)) return 'orrose';
    return 'or';
  }
  var METAUX = {
    or: ['#fff6cf', '#e9c86b', '#b88a2e', '#7a5716'],
    argent: ['#ffffff', '#d9dde2', '#9aa1aa', '#5d636b'],
    orrose: ['#ffe9de', '#e9b29a', '#b97a62', '#7e4a3a']
  };

  // ------------------------------------------------------------ DÉCORS PAR OCCASION
  var DECORS = {
    bapteme:      { photo: 'bapteme', fond: ['#f3f8fd', '#dfeaf6'], accent: '#7fa7cf', titre: 'Pour un baptême', motifs: ['colombe', 'gouttes', 'coquille'] },
    communion:    { photo: 'communion', fond: ['#fdfaf1', '#f1e6cc'], accent: '#c2a15a', titre: 'Pour une communion', motifs: ['calice', 'ble', 'ble2'] },
    confirmation: { photo: 'confirmation', fond: ['#fff8f1', '#f6e1d0'], accent: '#d0794f', titre: 'Pour une confirmation', motifs: ['colombe', 'flammes', 'flammes2'] },
    mariage:      { photo: 'mariage', fond: ['#fffafa', '#f6e4e4'], accent: '#c98f98', titre: 'Pour un mariage', motifs: ['alliances', 'fleurs', 'fleurs2'] },
    ordination:   { photo: 'ordination', fond: ['#fbf8f1', '#ece2cf'], accent: '#a8853c', titre: 'Pour une ordination', motifs: ['etole', 'rayons', 'calice2'] },
    priere:       { photo: 'priere', fond: ['#f8f5fb', '#e6dff0'], accent: '#9b86bf', titre: 'Pour vos intentions', motifs: ['bougie', 'etoiles', 'mains'] },
    pelerinage:   { photo: 'pelerinage', fond: ['#fbf6ec', '#ead9bb'], accent: '#b08b52', titre: 'Pour un pèlerinage', motifs: ['coquille2', 'chemin', 'baton'] },
    fete:         { photo: 'fete', fond: ['#fdfaf4', '#f3e8d6'], accent: '#c2a15a', titre: 'Pour un jour de fête', motifs: ['lys', 'etoiles', 'lys2'] },
    cadeau:       { photo: 'cadeau', fond: ['#fdfaf4', '#f3e8d6'], accent: '#c2a15a', titre: 'Un cadeau qui a du sens', motifs: ['coeur', 'lys', 'lys2'] },
    aucun:        { photo: 'aucun', fond: ['#fdfaf4', '#f3e8d6'], accent: '#c2a15a', titre: 'Créé avec amour', motifs: ['lys', 'lys2'] }
  };
  function decorPour(nom) {
    var n = norm(nom);
    if (!n) return DECORS.aucun;
    if (/bapt/.test(n)) return DECORS.bapteme;
    if (/communion/.test(n)) return DECORS.communion;
    if (/confirm/.test(n)) return DECORS.confirmation;
    if (/mariage|noce|fianc/.test(n)) return DECORS.mariage;
    if (/ordination|diacon|sacerdo|pretre/.test(n)) return DECORS.ordination;
    if (/intention|priere|deuil|memoire/.test(n)) return DECORS.priere;
    if (/pelerin|lourdes|voyage/.test(n)) return DECORS.pelerinage;
    if (/cadeau|devotion|offrir/.test(n)) return DECORS.cadeau;
    return DECORS.fete;
  }

  // Petits dessins au trait (24×24), utilisés en décor
  var MOTIFS = {
    colombe: '<path d="M2 13c3-1 5-1 7 0 1-4 4-7 9-8-1 2-1 4 0 5 2 0 3 1 4 2-2 0-3 1-4 2-2 4-7 6-12 5l-3 2 1-3c-1-1-2-2-2-5z"/><path d="M9 13c2 1 4 1 6 0"/>',
    gouttes: '<path d="M6 4c2 3 3 5 3 6.5a3 3 0 0 1-6 0C3 9 4 7 6 4z"/><path d="M16 9c2 3 3 5 3 6.5a3 3 0 0 1-6 0c0-1.5 1-3.5 3-6.5z"/><path d="M8 15c1.5 2 2 3.5 2 4.5a2 2 0 0 1-4 0c0-1 .5-2.5 2-4.5z"/>',
    coquille: '<path d="M12 21L3 9c3-5 15-5 18 0z"/><path d="M12 21L8 6M12 21l4-15M12 21L5.5 7.5M12 21l6.5-13.5M12 21V5.5"/><path d="M10 21h4"/>',
    coquille2: '<path d="M12 21L3 9c3-5 15-5 18 0z"/><path d="M12 21L8 6M12 21l4-15M12 21L5.5 7.5M12 21l6.5-13.5M12 21V5.5"/><path d="M10 21h4"/>',
    calice: '<path d="M6 3h12c0 6-2.5 9-6 9s-6-3-6-9z"/><path d="M12 12v6M8 21h8M9 18.5h6"/><circle cx="12" cy="3" r="3.5"/><path d="M12 1v4M10 3h4"/>',
    calice2: '<path d="M6 5h12c0 6-2.5 9-6 9s-6-3-6-9z"/><path d="M12 14v5M8 22h8M9 19.5h6"/>',
    ble: '<path d="M12 22V6"/><path d="M12 8c-3-1-4-3-4-5 3 0 4 2 4 5zM12 8c3-1 4-3 4-5-3 0-4 2-4 5zM12 13c-3-1-4-3-4-5 3 0 4 2 4 5zM12 13c3-1 4-3 4-5-3 0-4 2-4 5zM12 18c-3-1-4-3-4-5 3 0 4 2 4 5zM12 18c3-1 4-3 4-5-3 0-4 2-4 5z"/>',
    ble2: '<path d="M12 22V6"/><path d="M12 8c-3-1-4-3-4-5 3 0 4 2 4 5zM12 8c3-1 4-3 4-5-3 0-4 2-4 5zM12 13c-3-1-4-3-4-5 3 0 4 2 4 5zM12 13c3-1 4-3 4-5-3 0-4 2-4 5zM12 18c-3-1-4-3-4-5 3 0 4 2 4 5zM12 18c3-1 4-3 4-5-3 0-4 2-4 5z"/>',
    flammes: '<path d="M12 2c3 4 5 7 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3-1-3 0-6 1-9z"/>',
    flammes2: '<path d="M7 6c2 3 3 4.5 3 6.5a3 3 0 0 1-6 0c0-1.5 1-3 3-6.5zM17 4c2 3 3 4.5 3 6.5a3 3 0 0 1-6 0c0-1.5 1-3 3-6.5zM12 12c2 3 3 4.5 3 6.5a3 3 0 0 1-6 0c0-1.5 1-3 3-6.5z"/>',
    alliances: '<circle cx="9" cy="13" r="6"/><circle cx="15" cy="13" r="6"/><path d="M13 5l2-3 2 3-2 1.5z"/>',
    fleurs: '<circle cx="12" cy="12" r="2"/><path d="M12 10c-1-3-1-6 0-7 1 1 1 4 0 7zM14 12c3-1 6-1 7 0-1 1-4 1-7 0zM12 14c1 3 1 6 0 7-1-1-1-4 0-7zM10 12c-3 1-6 1-7 0 1-1 4-1 7 0zM13.5 10.5c1.5-2.5 3.5-4 5-4 0 1.5-1.5 3.5-5 4zM13.5 13.5c2.5 1.5 4 3.5 4 5-1.5 0-3.5-1.5-4-5zM10.5 13.5c-1.5 2.5-3.5 4-5 4 0-1.5 1.5-3.5 5-4zM10.5 10.5c-2.5-1.5-4-3.5-4-5 1.5 0 3.5 1.5 4 5z"/>',
    fleurs2: '<circle cx="12" cy="12" r="2"/><path d="M12 10c-1-3-1-6 0-7 1 1 1 4 0 7zM14 12c3-1 6-1 7 0-1 1-4 1-7 0zM12 14c1 3 1 6 0 7-1-1-1-4 0-7zM10 12c-3 1-6 1-7 0 1-1 4-1 7 0z"/>',
    etole: '<path d="M8 2c-1 6-2 12-3 20h4l2-14M16 2c1 6 2 12 3 20h-4l-2-14M8 2c1 2 2.5 3 4 3s3-1 4-3"/><path d="M6.5 17h2M7 15v4M17.5 17h-2M17 15v4"/>',
    rayons: '<circle cx="12" cy="12" r="3"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5M5 5l3.5 3.5M15.5 15.5L19 19M19 5l-3.5 3.5M8.5 15.5L5 19"/>',
    bougie: '<path d="M9 10h6v12H9z"/><path d="M12 2c1.5 2 2.5 3.5 2.5 5a2.5 2.5 0 0 1-5 0C9.5 5.5 10.5 4 12 2z"/><path d="M12 7v3M7 22h10"/>',
    etoiles: '<path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/><path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8zM5 15l.6 1.4L7 17l-1.4.6L5 19l-.6-1.4L3 17l1.4-.6z"/>',
    mains: '<path d="M12 21V9c0-3-1-6-2-7-1 2-2 5-2 8v6l-3 3M12 21V9c0-3 1-6 2-7 1 2 2 5 2 8v6l3 3"/>',
    chemin: '<path d="M4 22c4-3 6-6 6-9s-3-4-3-7 2-4 5-4M20 22c-3-3-5-6-5-9s3-4 3-7-1-4-3-4"/>',
    baton: '<path d="M8 22L16 3"/><path d="M15 6c2 0 3 1 3 2.5S17 11 15.5 11 13 10 13 8.5"/><path d="M11 13c-2 0-3 1-3 2"/>',
    lys: '<path d="M12 22V11"/><path d="M12 11c-2-1-3-4-2-8 2 1 3 4 2 8zM12 11c2-1 3-4 2-8-2 1-3 4-2 8zM12 11c-3 0-6-2-7-5 3 0 6 2 7 5zM12 11c3 0 6-2 7-5-3 0-6 2-7 5z"/><path d="M12 17c-2-1-4-1-5 0M12 17c2-1 4-1 5 0"/>',
    lys2: '<path d="M12 22V11"/><path d="M12 11c-2-1-3-4-2-8 2 1 3 4 2 8zM12 11c2-1 3-4 2-8-2 1-3 4-2 8zM12 11c-3 0-6-2-7-5 3 0 6 2 7 5zM12 11c3 0 6-2 7-5-3 0-6 2-7 5z"/>',
    coeur: '<path d="M12 21C5 16 2 12 2 8.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 10 2.5C22 12 19 16 12 21z"/>'
  };
  // Emplacements des décors (x, y, taille, rotation, opacité)
  var PLACES = [[22, 300, 64, -14, .55], [318, 312, 62, 12, .5], [300, 418, 54, -8, .45], [30, 410, 50, 10, .4]];

  // ------------------------------------------------------------ MÉDAILLES (gravure)
  var GRAVURES = {
    vierge: '<path d="M0-9.5a3 3 0 1 1 0 6 3 3 0 1 1 0-6z"/><path d="M-3.4-5C-6-1-6.6 4-7.4 10h14.8C6.6 4 6-1 3.4-5 2.2-3.8 1.2-3.4 0-3.4S-2.2-3.8-3.4-5z"/><path d="M-1.4 2.2h2.8M0 .8v3" class="g-clair"/>',
    miraculeuse: '<path d="M0-9.5a3 3 0 1 1 0 6 3 3 0 1 1 0-6z"/><path d="M-3-5C-5-1-5.4 4-6 10h12C5.4 4 5-1 3-5 2-3.8 1-3.4 0-3.4S-2-3.8-3-5z"/><path d="M-4-1l-4 5M-3.6 1l-3.2 5.2M4-1l4 5M3.6 1l3.2 5.2" class="g-trait"/>',
    coeur: '<path d="M0 9C-6 4.5-8 1.5-8-1.6A3.7 3.7 0 0 1 0-3.6a3.7 3.7 0 0 1 8 2C8 1.5 6 4.5 0 9z"/><path d="M0-4v-6M-2.4-7.6h4.8" class="g-trait"/><path d="M-3-4.5c0-2 1.5-3 1.5-4.5M3-4.5c0-2-1.5-3-1.5-4.5" class="g-trait"/>',
    michel: '<path d="M0-10v17M-3.4-4.6h6.8M-1.6 7l1.6 3 1.6-3z" class="g-trait"/><path d="M-1.5-3C-5-2-8-5-9-9c3 0 6 1.6 7.5 4.5M1.5-3C5-2 8-5 9-9c-3 0-6 1.6-7.5 4.5"/>',
    croix: '<path d="M-1.4-9h2.8v5.6H6.4v2.8H1.4V9h-2.8V-.6h-5V-3.4h5z"/>',
    monogramme: '<path d="M-6 8V-4l6 7 6-7V8" class="g-trait"/><path d="M0-10v6M-2.6-7.4h5.2" class="g-trait"/>'
  };
  function gravurePour(nom) {
    var n = norm(nom);
    if (!chMedaille) return 'monogramme';
    if (/miracul/.test(n)) return 'miraculeuse';
    if (/coeur|sacre/.test(n)) return 'coeur';
    if (/michel/.test(n)) return 'michel';
    if (/vierge|marie|notre.dame/.test(n)) return 'vierge';
    if (n) return 'croix';
    return 'vierge';
  }

  // ------------------------------------------------------------ GÉOMÉTRIE DU CHAPELET
  // Boucle en forme de goutte : pointe en bas (à la médaille)
  var CX = 200, CY = 178, RX = 124, RY = 104;
  function pointBoucle(t) { // t de 0 (bas, médaille) à 2π
    var a = Math.PI + t;
    return [CX + RX * Math.sin(a) * (1 + 0.2 * Math.cos(a)), CY - RY * Math.cos(a) * (1 - 0.06 * Math.sin(a) * 0)];
  }
  function echantillonner() {
    var pts = [], longs = [0], N = 1600;
    for (var i = 0; i <= N; i++) pts.push(pointBoucle(2 * Math.PI * i / N));
    for (i = 1; i <= N; i++) longs.push(longs[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    return { pts: pts, longs: longs, total: longs[N] };
  }
  var ECH = echantillonner();
  function aLaLongueur(s) {
    var L = ECH.longs, lo = 0, hi = L.length - 1;
    while (hi - lo > 1) { var m = (lo + hi) >> 1; if (L[m] < s) lo = m; else hi = m; }
    var t = (s - L[lo]) / ((L[hi] - L[lo]) || 1), a = ECH.pts[lo], b = ECH.pts[hi];
    return { x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t, ang: Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI };
  }
  var PETITE = 8.6, GROSSE = 12.4, ECART_MEDAILLE = 15;
  function positionsBoucle() {
    // 5 dizaines de 10 « Je vous salue Marie », séparées par 4 « Notre Père »
    var seq = [];
    for (var d = 0; d < 5; d++) {
      for (var k = 0; k < 10; k++) seq.push({ r: PETITE / 2, d: d });
      if (d < 4) seq.push({ r: GROSSE / 2, gros: true, d: d });
    }
    var occupe = seq.reduce(function (s, b) { return s + 2 * b.r; }, 0);
    var dispo = ECH.total - 2 * ECART_MEDAILLE;
    var ecart = (dispo - occupe) / (seq.length + 1);
    var s = ECART_MEDAILLE + ecart, perles = [], liens = [];
    seq.forEach(function (b) {
      liens.push(aLaLongueur(s - ecart / 2));
      var p = aLaLongueur(s + b.r);
      perles.push({ x: p.x, y: p.y, r: b.r, gros: b.gros, d: b.d });
      s += 2 * b.r + ecart;
    });
    liens.push(aLaLongueur(s - ecart / 2));
    return { perles: perles, liens: liens, ecart: ecart };
  }
  var BOUCLE = positionsBoucle();

  // ------------------------------------------------------------ DESSIN SVG
  function f(n) { return Math.round(n * 10) / 10; }
  function dessiner() {
    var sp = stylePerles(chPerles.value);
    var metal = metalChoisi(chFinition ? chFinition.value : '');
    var M = METAUX[metal];
    var decor = decorPour(chOccasion ? chOccasion.value : '');
    var grav = gravurePour(chMedaille ? chMedaille.value : '');
    var defs = [];
    var id = 'ap';

    // Dégradés : fond, métal, perles
    defs.push('<linearGradient id="' + id + 'fond" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + decor.fond[0] + '"/><stop offset="1" stop-color="' + decor.fond[1] + '"/></linearGradient>');
    defs.push('<linearGradient id="' + id + 'satin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>');
    defs.push('<linearGradient id="' + id + 'met" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + M[0] + '"/><stop offset=".35" stop-color="' + M[1] + '"/><stop offset=".7" stop-color="' + M[2] + '"/><stop offset="1" stop-color="' + M[1] + '"/></linearGradient>');
    defs.push('<radialGradient id="' + id + 'metb" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="' + M[0] + '"/><stop offset=".45" stop-color="' + M[1] + '"/><stop offset="1" stop-color="' + M[3] + '"/></radialGradient>');
    defs.push('<filter id="' + id + 'ombre" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="2" dy="3.5" stdDeviation="2.4" flood-color="#3d2e1c" flood-opacity=".3"/></filter>');
    function gradPerle(nomId, clair, base, fonce) {
      defs.push('<radialGradient id="' + nomId + '" cx=".34" cy=".3" r=".78"><stop offset="0" stop-color="' + clair + '"/><stop offset=".42" stop-color="' + base + '"/><stop offset="1" stop-color="' + fonce + '"/></radialGradient>');
    }
    var remplissages = [];
    if (sp.type === 'nacre') {
      defs.push('<radialGradient id="' + id + 'p0" cx=".34" cy=".3" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".4" stop-color="#f7f2ec"/><stop offset=".72" stop-color="#ebe1ea"/><stop offset=".88" stop-color="#dfe6ee"/><stop offset="1" stop-color="#b8aeb2"/></radialGradient>');
      remplissages = ['url(#' + id + 'p0)'];
    } else if (sp.type === 'cristal') {
      defs.push('<radialGradient id="' + id + 'p0" cx=".34" cy=".3" r=".8"><stop offset="0" stop-color="#ffffff" stop-opacity=".98"/><stop offset=".35" stop-color="#eef6fb" stop-opacity=".45"/><stop offset=".75" stop-color="#cfe2ee" stop-opacity=".35"/><stop offset="1" stop-color="#8fa9bd" stop-opacity=".75"/></radialGradient>');
      remplissages = ['url(#' + id + 'p0)'];
    } else if (sp.type === 'metal') {
      var MM = METAUX[sp.metal];
      gradPerle(id + 'p0', MM[0], MM[1], MM[3]);
      remplissages = ['url(#' + id + 'p0)'];
    } else if (sp.type === 'multi') {
      MULTI.forEach(function (c, i) { gradPerle(id + 'p' + i, mix(c, '#ffffff', .75), c, mix(c, '#000000', .38)); remplissages.push('url(#' + id + 'p' + i + ')'); });
    } else {
      var c = sp.c, sombre = hex2rgb(c).reduce(function (a, b) { return a + b; }, 0) < 200;
      gradPerle(id + 'p0', mix(c, '#ffffff', sombre ? .45 : .8), c, mix(c, '#000000', sombre ? .55 : .32));
      remplissages = ['url(#' + id + 'p0)'];
    }

    // Décor
    var fond = '<rect width="400" height="500" fill="url(#' + id + 'fond)"/>' +
      '<path d="M-20 120C90 90 170 160 420 70V0H-20z" fill="url(#' + id + 'satin)" opacity=".7"/>' +
      '<path d="M-20 380C120 330 250 420 420 340V300C260 380 120 290-20 340z" fill="url(#' + id + 'satin)" opacity=".55"/>' +
      '<path d="M-20 250C100 220 300 300 420 230" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="10"/>';
    if (decor.photo) {
      fond = '<rect width="400" height="500" fill="' + decor.fond[0] + '"/>' +
        '<image href="assets/scenes/' + decor.photo + '.jpg" x="0" y="0" width="400" height="500" preserveAspectRatio="xMidYMid slice"/>' +
        '<rect width="400" height="500" fill="url(#' + id + 'voile)"/>';
      defs.push('<linearGradient id="' + id + 'voile" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".25" stop-color="#fff" stop-opacity="0"/></linearGradient>');
    }
    var motifs = decor.photo ? '' : decor.motifs.map(function (m, i) {
      var p = PLACES[i]; if (!p || !MOTIFS[m]) return '';
      return '<g transform="translate(' + p[0] + ' ' + p[1] + ') rotate(' + p[3] + ' ' + p[2] / 2 + ' ' + p[2] / 2 + ') scale(' + p[2] / 24 + ')" fill="none" stroke="' + decor.accent + '" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round" opacity="' + p[4] + '">' + MOTIFS[m] + '</g>';
    }).join('');

    // Chaîne et maillons de la boucle
    var chemin = 'M' + ECH.pts.filter(function (_, i) { return i % 8 === 0; }).map(function (p) { return f(p[0]) + ' ' + f(p[1]); }).join('L') + 'Z';
    var chaine = '<path d="' + chemin + '" fill="none" stroke="' + M[2] + '" stroke-width="1.3"/>';
    var maillons = BOUCLE.liens.map(function (l) {
      return '<ellipse cx="' + f(l.x) + '" cy="' + f(l.y) + '" rx="' + f(Math.max(2.2, BOUCLE.ecart / 2 + 1.2)) + '" ry="1.5" transform="rotate(' + f(l.ang) + ' ' + f(l.x) + ' ' + f(l.y) + ')" fill="none" stroke="url(#' + id + 'met)" stroke-width="1.2"/>';
    }).join('');

    function perle(x, y, r, fill, idx) {
      var s = '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + fill + '"' +
        (sp.type === 'cristal' ? ' stroke="#ffffff" stroke-opacity=".9" stroke-width=".7"' : ' stroke="#000" stroke-opacity=".08" stroke-width=".5"') + '/>';
      s += '<ellipse cx="' + f(x - r * .32) + '" cy="' + f(y - r * .38) + '" rx="' + f(r * .3) + '" ry="' + f(r * .2) + '" fill="#fff" opacity="' + (sp.type === 'cristal' ? .95 : .75) + '" transform="rotate(-30 ' + f(x - r * .32) + ' ' + f(y - r * .38) + ')"/>';
      if (sp.type === 'cristal') s += '<path d="M' + f(x - r * .5) + ' ' + f(y + r * .1) + 'L' + f(x) + ' ' + f(y + r * .6) + 'L' + f(x + r * .55) + ' ' + f(y) + '" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width=".6"/>';
      return s;
    }
    var perlesBoucle = BOUCLE.perles.map(function (p, i) {
      var fill = remplissages[sp.type === 'multi' ? p.d % remplissages.length : 0];
      return perle(p.x, p.y, p.r, fill, i);
    }).join('');

    // Médaille centrale (pointe de la boucle)
    var MX = CX, MY = CY + RY + 16;
    var medaille = '<g transform="translate(' + MX + ' ' + MY + ')">' +
      '<ellipse cx="0" cy="0" rx="17" ry="21" fill="url(#' + id + 'met)" stroke="' + M[3] + '" stroke-width=".8"/>' +
      '<ellipse cx="0" cy="0" rx="13.6" ry="17.4" fill="url(#' + id + 'metb)" stroke="' + M[3] + '" stroke-opacity=".55" stroke-width=".7"/>' +
      '<g class="gravure" fill="' + M[3] + '" fill-opacity=".55" stroke="' + M[3] + '" stroke-opacity=".7" stroke-width=".5" stroke-linejoin="round">' + GRAVURES[grav] + '</g>' +
      '<circle cx="0" cy="-23" r="2.6" fill="none" stroke="url(#' + id + 'met)" stroke-width="1.4"/>' +
      '<circle cx="0" cy="23" r="2.6" fill="none" stroke="url(#' + id + 'met)" stroke-width="1.4"/>' +
      '</g>';

    // Pendentif : Notre Père, 3 Je vous salue Marie, Notre Père, puis la croix
    var py = MY + 27, pend = [], liensP = [];
    var seqP = [GROSSE / 2, PETITE / 2, PETITE / 2, PETITE / 2, GROSSE / 2];
    var ecP = 4.2;
    seqP.forEach(function (r, i) {
      py += ecP; liensP.push(py - ecP / 2); py += r;
      pend.push({ x: MX + Math.sin(i * .5) * 1.2, y: py, r: r }); py += r;
    });
    py += ecP; liensP.push(py - ecP / 2);
    var chaineP = '<path d="M' + MX + ' ' + (MY + 25) + 'V' + f(py + 4) + '" stroke="' + M[2] + '" stroke-width="1.3"/>' +
      liensP.map(function (y) { return '<ellipse cx="' + MX + '" cy="' + f(y) + '" rx="1.5" ry="' + f(ecP / 2 + 1.2) + '" fill="none" stroke="url(#' + id + 'met)" stroke-width="1.2"/>'; }).join('');
    var perlesP = pend.map(function (p, i) { return perle(p.x, p.y, p.r, remplissages[sp.type === 'multi' ? (i + 2) % remplissages.length : 0], i); }).join('');

    // Croix (extrémités fleuronnées)
    var CYc = py + 6, h = 74, w = 50, e = 3.8;
    var bras = h * .3;
    var croix = '<g transform="translate(' + MX + ' ' + f(CYc) + ')">' +
      '<circle cx="0" cy="0" r="2.6" fill="none" stroke="url(#' + id + 'met)" stroke-width="1.4"/>' +
      '<g fill="url(#' + id + 'met)" stroke="' + M[3] + '" stroke-width=".7" stroke-linejoin="round">' +
      '<path d="M-' + e + ' 4H' + e + 'V' + f(bras - e) + 'H' + f(w / 2 - 3) + 'V' + f(bras + e) + 'H' + e + 'V' + f(h - 3) + 'H-' + e + 'V' + f(bras + e) + 'H-' + f(w / 2 - 3) + 'V' + f(bras - e) + 'H-' + e + 'Z"/>' +
      [[0, 4.5], [0, h - 2], [-w / 2 + 2, bras], [w / 2 - 2, bras]].map(function (q) {
        return '<circle cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" r="5.2"/>';
      }).join('') +
      '<circle cx="0" cy="' + f(bras) + '" r="6.4"/>' +
      '</g>' +
      '<circle cx="0" cy="' + f(bras) + '" r="3.6" fill="none" stroke="' + M[3] + '" stroke-opacity=".6" stroke-width=".7"/>' +
      '<path d="M0 ' + f(bras - 2) + 'v4M-2 ' + f(bras) + 'h4" stroke="' + M[3] + '" stroke-opacity=".6" stroke-width=".8"/>' +
      '</g>';

    // Légende
    var legende = '<text x="200" y="50" text-anchor="middle" class="ap-titre" fill="' + mix(decor.accent, '#3d2e1c', .45) + '">' + decor.titre + '</text>';

    var svg = '<svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Aperçu de votre chapelet">' +
      '<defs>' + defs.join('') + '</defs>' + fond + motifs + legende +
      '<g filter="url(#' + id + 'ombre)">' + chaine + maillons + perlesBoucle + chaineP + perlesP + medaille + croix + '</g>' +
      '</svg>';
    zone.innerHTML = svg;

    // Récapitulatif des choix sous l'aperçu
    var morceaux = [];
    morceaux.push('<span>Perles : <strong>' + esc(chPerles.value || 'à choisir') + '</strong></span>');
    if (chFinition) morceaux.push('<span>Finition : <strong>' + esc(chFinition.value || 'à choisir') + '</strong></span>');
    if (chMedaille) morceaux.push('<span>Médaille : <strong>' + esc(chMedaille.value || 'à choisir') + '</strong></span>');
    if (chOccasion && chOccasion.value) morceaux.push('<span>Occasion : <strong>' + esc(chOccasion.value) + '</strong></span>');
    recap.innerHTML = morceaux.join('') + (sp.inconnu && chPerles.value ? '<em>Couleur à préciser : l\'aperçu montre des perles nacrées.</em>' : '');
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // ------------------------------------------------------------ MISE EN PAGE
  var photo = media.querySelector('.product-img');
  var bloc = document.createElement('div');
  bloc.className = 'apercu';
  bloc.hidden = true;
  bloc.innerHTML = '<div class="apercu-cadre"><div class="apercu-svg" data-apercu-svg></div></div>' +
    '<p class="apercu-recap" data-apercu-recap></p>' +
    '<p class="apercu-note">Aperçu indicatif : chaque chapelet est fait main, les perles et la médaille peuvent varier selon les matériaux disponibles.</p>';
  photo.insertAdjacentElement('afterend', bloc);
  var zone = bloc.querySelector('[data-apercu-svg]');
  var recap = bloc.querySelector('[data-apercu-recap]');

  var onglets = document.createElement('div');
  onglets.className = 'apercu-onglets';
  onglets.setAttribute('role', 'tablist');
  onglets.innerHTML = '<button type="button" role="tab" data-vue="photo" aria-selected="true">📷 Photo</button>' +
    '<button type="button" role="tab" data-vue="apercu" aria-selected="false">✨ Aperçu de mes choix</button>';
  media.insertBefore(onglets, media.firstChild);
  var vignettes = media.querySelector('.thumbs');

  function montrer(vue) {
    var ap = vue === 'apercu';
    bloc.hidden = !ap; photo.hidden = ap;
    if (vignettes) vignettes.hidden = ap;
    onglets.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-vue') === vue)); });
    if (ap) dessiner();
  }
  onglets.addEventListener('click', function (e) {
    var b = e.target.closest('[data-vue]');
    if (b) montrer(b.getAttribute('data-vue'));
  });
  [chPerles, chFinition, chMedaille, chOccasion].forEach(function (c) {
    if (c) c.addEventListener('change', function () {
      montrer('apercu');
      majMini();
    });
  });
  // Sur téléphone : petite vignette flottante quand l'aperçu est sorti de l'écran
  var mini = document.createElement('button');
  mini.type = 'button';
  mini.className = 'apercu-mini';
  mini.hidden = true;
  mini.setAttribute('aria-label', 'Revoir l\'aperçu de mon chapelet');
  document.body.appendChild(mini);
  var horsEcran = false;
  function majMini() {
    var montrerMini = horsEcran && !bloc.hidden && window.matchMedia('(max-width: 900px)').matches;
    if (montrerMini) {
      var svg = zone.querySelector('svg');
      // copie de l'aperçu avec des identifiants différents (dégradés, ombre)
      mini.innerHTML = svg ? svg.outerHTML.replace(/id="ap/g, 'id="mi').replace(/#ap/g, '#mi') + '<span>Aperçu</span>' : '';
    }
    mini.hidden = !montrerMini;
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entrees) { horsEcran = !entrees[0].isIntersecting; majMini(); }, { threshold: 0.15 }).observe(bloc);
  }
  mini.addEventListener('click', function () { bloc.scrollIntoView({ behavior: 'smooth', block: 'center' }); });

  // Si le client revient sur la page avec des choix déjà faits
  if (chPerles.value) montrer('apercu');
})();
