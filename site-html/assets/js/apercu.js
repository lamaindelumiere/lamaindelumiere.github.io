/* =====================================================================
   LA MAIN DE LUMIÈRE — APERÇU PHOTO DU CHAPELET PERSONNALISÉ
   Assemble en direct une photo de chapelet (perles recolorées,
   métal doré ou argenté) sur le décor photo de l'occasion choisie.
   Les couleurs des listes de l'espace admin sont reconnues par leur nom
   (rose, bleu ciel, nacré, cristal, vert d'eau, lavande, noir…).
   ===================================================================== */
(function () {
  'use strict';
  var perso = document.getElementById('perso');
  var media = document.querySelector('.product-media');
  if (!perso || !media || !window.HTMLCanvasElement) return;

  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
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

  // ------------------------------------------------------------ COULEURS DES PERLES
  var TEINTES = [ // [motif reconnu dans le nom, couleur]
    [/rose (poudre|pale|clair)|poudre/, '#fcd2d9'], [/fuchsia|framboise/, '#d2477e'], [/rose/, '#eea3b5'],
    [/bordeaux|grenat/, '#7c1f2e'], [/rouge/, '#c8352b'], [/corail|peche|saumon/, '#f5a383'], [/orange/, '#ec8a35'],
    [/jaune|soleil/, '#f3d35a'], [/vert (d.eau|menthe|clair)|menthe|vert d/, '#b3e0cc'], [/olive|kaki/, '#8a8f4a'],
    [/emeraude|vert (fonce|sapin)|sapin/, '#1f7a54'], [/vert/, '#62b07e'], [/turquoise|lagon|caraibe/, '#3cc3c6'],
    [/bleu (ciel|clair|pale|layette)|ciel|layette/, '#acd4f4'], [/marine|nuit/, '#22356a'], [/bleu roi|roi/, '#2c55b3'],
    [/bleu/, '#5b8fd6'], [/lavande|lilas|parme/, '#c8b3e6'], [/violet|mauve|prune|amethyste/, '#8058a8'],
    [/noir|jais|onyx/, '#2a2a2e'], [/gris|anthracite/, '#9aa0a6'], [/marron|chocolat|bois|brun/, '#7a4e2d'],
    [/beige|sable|creme|champagne/, '#ecdcbf'], [/ivoire|ecru/, '#f7efdc']
  ];
  var MULTI = ['#f2b3c4', '#a6cdf0', '#b9e3c6', '#d4c0ef', '#f8d3a0', '#f2b3c4'];

  function stylePerles(nom) {
    var n = norm(nom);
    if (!n) return { type: 'nacre' };
    if (/autre|preciser/.test(n)) return { type: 'nacre', inconnu: true };
    if (/multi|arc.en.ciel|melange|assorti/.test(n)) return { type: 'multi' };
    if (/cristal|transparent|verre/.test(n)) return { type: 'cristal' };
    if (/nacre|perle blanche/.test(n)) return { type: 'nacre' };
    if (/dore|^or$|^or |gold/.test(n)) return { type: 'couleur', c: '#dcb968', metal: true };
    if (/argente|argent/.test(n)) return { type: 'couleur', c: '#cfd3d9', metal: true };
    for (var i = 0; i < TEINTES.length; i++) if (TEINTES[i][0].test(n)) return { type: 'couleur', c: TEINTES[i][1] };
    if (/blanc/.test(n)) return { type: 'couleur', c: '#fbfaf6' };
    return { type: 'nacre', inconnu: true };
  }
  // Médaille choisie → image de la médaille (null = médaille de la photo d'origine)
  function medaillePour(nom) {
    var n = norm(nom);
    if (!chMedaille || !n) return 'miraculeuse'; // médaille de la photo d'origine
    if (/miracul/.test(n)) return 'miraculeuse';
    if (/coeur|sacre/.test(n)) return 'sacre-coeur';
    if (/michel|archange/.test(n)) return 'saint-michel';
    if (/vierge|marie|notre.dame|lourdes/.test(n)) return 'vierge-marie';
    return 'croix';
  }
  // Emplacement de la médaille sur la photo du chapelet (en pixels du calque)
  var MEDAILLE = { cx: 463.8, cy: 484.4, h: 119, rot: 11.4 };

  function metalChoisi(nom) { return /argent|acier|silver/.test(norm(nom)) ? 'argent' : 'or'; }

  // ------------------------------------------------------------ DÉCORS PHOTO PAR OCCASION
  var DECORS = {
    bapteme: { photo: 'bapteme', titre: 'Pour un baptême', couleur: '#4f6f92' },
    communion: { photo: 'communion', titre: 'Pour une communion', couleur: '#7d6430' },
    confirmation: { photo: 'confirmation', titre: 'Pour une confirmation', couleur: '#8a4b33' },
    mariage: { photo: 'mariage', titre: 'Pour un mariage', couleur: '#8a5560' },
    ordination: { photo: 'ordination', titre: 'Pour une ordination', couleur: '#6e5626' },
    priere: { photo: 'priere', titre: 'Pour vos intentions', couleur: '#5f4f7d' },
    pelerinage: { photo: 'pelerinage', titre: 'Pour un pèlerinage', couleur: '#5e4a2c', pose: { miroir: true, cx: 410 } },
    fete: { photo: 'fete', titre: 'Pour un jour de fête', couleur: '#7d6430' },
    cadeau: { photo: 'cadeau', titre: 'Un cadeau qui a du sens', couleur: '#7d6430' },
    aucun: { photo: 'aucun', titre: 'Créé avec amour', couleur: '#7d6430' }
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

  // ------------------------------------------------------------ CHARGEMENT DES PHOTOS
  var cache = {};
  function charger(src) {
    if (!cache[src]) cache[src] = new Promise(function (ok, ko) {
      var im = new Image();
      im.onload = function () { ok(im); };
      im.onerror = function () { delete cache[src]; ko(new Error(src)); };
      im.src = src;
    });
    return cache[src];
  }
  var DOSSIER = 'assets/chapelet/';
  function calques() {
    return Promise.all(['perles', 'perles-ombrage', 'perles-reflets', 'metal-or', 'metal-argent'].map(function (n) { return charger(DOSSIER + n + '.webp'); }))
      .then(function (l) { return { perles: l[0], ombrage: l[1], reflets: l[2], or: l[3], argent: l[4] }; });
  }

  // ------------------------------------------------------------ ASSEMBLAGE
  var W = 800, H = 1000;
  function toile(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

  // Perles recolorées : ombrage × couleur, puis reflets
  function perlesColorees(C, sp) {
    var w = C.ombrage.width, h = C.ombrage.height;
    var t = toile(w, h), x = t.getContext('2d');
    if (sp.type === 'nacre') { x.drawImage(C.perles, 0, 0); return t; }
    x.drawImage(C.ombrage, 0, 0);
    x.globalCompositeOperation = 'multiply';
    if (sp.type === 'multi') {
      var g;
      if (x.createConicGradient) {
        g = x.createConicGradient(-Math.PI / 2, w / 2, h * 0.22);
        MULTI.forEach(function (c, i) { g.addColorStop(i / (MULTI.length - 1), c); });
      } else {
        g = x.createLinearGradient(0, 0, w, h);
        MULTI.forEach(function (c, i) { g.addColorStop(i / (MULTI.length - 1), c); });
      }
      x.fillStyle = g;
    } else if (sp.type === 'cristal') {
      x.fillStyle = '#e4edf3';
    } else {
      x.fillStyle = sp.c;
    }
    x.fillRect(0, 0, w, h);
    x.globalCompositeOperation = 'destination-in';
    x.drawImage(C.ombrage, 0, 0);
    x.globalCompositeOperation = 'source-over';
    x.globalAlpha = sp.type === 'cristal' ? 1 : 0.9;
    x.drawImage(C.reflets, 0, 0);
    if (sp.type === 'cristal') x.drawImage(C.reflets, 0, 0);
    return t;
  }

  function chapelet(C, sp, metal, med, miroir) {
    var w = C.ombrage.width, h = C.ombrage.height;
    var t = toile(w, h), x = t.getContext('2d');
    if (miroir) { x.translate(w, 0); x.scale(-1, 1); } // chapelet retourné selon le décor
    x.drawImage(metal === 'argent' ? C.argent : C.or, 0, 0);
    x.globalAlpha = sp.type === 'cristal' ? 0.62 : 1;
    x.drawImage(perlesColorees(C, sp), 0, 0);
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.globalAlpha = 1;
    if (med) { // médaille choisie, posée (avec la même inclinaison) à la place de celle de la photo
      var mh = MEDAILLE.h, mw = mh * med.width / med.height;
      var cx = miroir ? w - MEDAILLE.cx : MEDAILLE.cx, rot = (miroir ? -MEDAILLE.rot : MEDAILLE.rot) * Math.PI / 180;
      x.translate(cx, MEDAILLE.cy); x.rotate(rot);
      x.drawImage(med, -mw / 2, -mh / 2, mw, mh);
      x.setTransform(1, 0, 0, 1, 0, 0);
    }
    return t;
  }

  var jeton = 0;
  function dessiner() {
    var sp = stylePerles(chPerles.value);
    var metal = metalChoisi(chFinition ? chFinition.value : '');
    var decor = decorPour(chOccasion ? chOccasion.value : '');
    var nomMed = medaillePour(chMedaille ? chMedaille.value : '');
    var n = ++jeton;
    titre.textContent = decor.titre;
    titre.style.color = decor.couleur;
    cadre.classList.add('charge');
    Promise.all([calques(), charger('assets/scenes/' + decor.photo + '.jpg'),
      nomMed ? charger(DOSSIER + 'medaille-' + nomMed + '-' + metal + '.webp').catch(function () { return null; }) : null]).then(function (r) {
      if (n !== jeton) return; // un choix plus récent est en cours
      var C = r[0], scene = r[1];
      var x = canvas.getContext('2d');
      x.clearRect(0, 0, W, H);
      x.drawImage(scene, 0, 0, W, H);
      // légère lumière en haut pour la lisibilité du titre
      var g = x.createLinearGradient(0, 0, 0, 200);
      g.addColorStop(0, 'rgba(255,255,255,.45)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(0, 0, W, 200);
      // chapelet posé avec son ombre portée
      var pose = decor.pose || {};
      var ch = chapelet(C, sp, metal, r[2], !!pose.miroir);
      // position du chapelet dans le décor (réglable par décor : pose { h, cx, y, miroir })
      var hh = pose.h || 630, ww = hh * ch.width / ch.height;
      var px = (pose.cx != null ? pose.cx : 390) - ww / 2, py = pose.y != null ? pose.y : 100;
      x.save();
      x.shadowColor = 'rgba(60, 44, 24, .38)'; x.shadowBlur = 9; x.shadowOffsetX = 4; x.shadowOffsetY = 7;
      x.drawImage(ch, px, py, ww, hh);
      x.restore();
      cadre.classList.remove('charge');
      majMini();
    }).catch(function () { cadre.classList.remove('charge'); });

    // Récapitulatif des choix sous l'aperçu
    var morceaux = ['<span>Perles : <strong>' + esc(chPerles.value || 'à choisir') + '</strong></span>'];
    if (chFinition) morceaux.push('<span>Finition : <strong>' + esc(chFinition.value || 'à choisir') + '</strong></span>');
    if (chMedaille) morceaux.push('<span>Médaille : <strong>' + esc(chMedaille.value || 'à choisir') + '</strong></span>');
    if (chOccasion && chOccasion.value) morceaux.push('<span>Occasion : <strong>' + esc(chOccasion.value) + '</strong></span>');
    recap.innerHTML = morceaux.join('') + (sp.inconnu && chPerles.value ? '<em>Couleur à préciser : l\'aperçu montre des perles nacrées.</em>' : '');
  }

  // ------------------------------------------------------------ MISE EN PAGE
  var photo = media.querySelector('.product-img');
  var bloc = document.createElement('div');
  bloc.className = 'apercu';
  bloc.hidden = true;
  bloc.innerHTML = '<div class="apercu-cadre"><div class="apercu-scene"><canvas width="' + W + '" height="' + H + '" role="img" aria-label="Aperçu de votre chapelet"></canvas><span class="apercu-titre"></span></div></div>' +
    '<p class="apercu-recap"></p>' +
    '<p class="apercu-note">Aperçu indicatif : chaque chapelet est fait main ; les perles, la croix et la médaille peuvent varier selon les matériaux disponibles.</p>';
  photo.insertAdjacentElement('afterend', bloc);
  var cadre = bloc.querySelector('.apercu-scene');
  var canvas = bloc.querySelector('canvas');
  var titre = bloc.querySelector('.apercu-titre');
  var recap = bloc.querySelector('.apercu-recap');

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
    majMini();
  }
  onglets.addEventListener('click', function (e) {
    var b = e.target.closest('[data-vue]');
    if (b) montrer(b.getAttribute('data-vue'));
  });
  [chPerles, chFinition, chMedaille, chOccasion].forEach(function (c) {
    if (c) c.addEventListener('change', function () { montrer('apercu'); });
  });

  // Sur téléphone : petite vignette flottante quand l'aperçu est sorti de l'écran
  var mini = document.createElement('button');
  mini.type = 'button';
  mini.className = 'apercu-mini';
  mini.hidden = true;
  mini.setAttribute('aria-label', 'Revoir l\'aperçu de mon chapelet');
  mini.innerHTML = '<img alt=""><span>Aperçu</span>';
  document.body.appendChild(mini);
  var horsEcran = false;
  function majMini() {
    var montrerMini = horsEcran && !bloc.hidden && window.matchMedia('(max-width: 900px)').matches;
    if (montrerMini) { try { mini.querySelector('img').src = canvas.toDataURL('image/jpeg', 0.7); } catch (e) { montrerMini = false; } }
    mini.hidden = !montrerMini;
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entrees) { horsEcran = !entrees[0].isIntersecting; majMini(); }, { threshold: 0.15 }).observe(bloc);
  }
  mini.addEventListener('click', function () { bloc.scrollIntoView({ behavior: 'smooth', block: 'center' }); });

  // Précharge discrète des calques du chapelet
  setTimeout(function () { calques().catch(function () {}); }, 1200);
  // Si le client revient sur la page avec des choix déjà faits
  if (chPerles.value) montrer('apercu');
})();
