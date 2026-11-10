/* =====================================================================
   LA MAIN DE LUMIÈRE — BON DE LIVRAISON & ÉTIQUETTE D'ENVOI
   La commande est lue dans l'adresse de la page (#c=…), créée
   automatiquement dans chaque message de commande. Rien n'est envoyé
   sur internet : tout se passe dans le navigateur.
   ===================================================================== */
(function () {
  'use strict';
  var B = (typeof BOUTIQUE !== 'undefined') ? BOUTIQUE : { nom: 'La Main de Lumière' };
  var EXP = B.expediteur || {};
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function euros(n) { return Number(n).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }); }
  function dateLongue(iso) {
    if (!iso) return '';
    var d = new Date(iso + 'T12:00');
    return isNaN(d) ? iso : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  function decoder(code) {
    var b64 = code.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    return JSON.parse(decodeURIComponent(escape(atob(b64))));
  }
  function lireDepuisTexte(texte) {
    var m = String(texte || '').match(/#c=([A-Za-z0-9_\-]+)/);
    return m ? decoder(m[1]) : null;
  }

  var MODELE_VIDE = {
    v: 1, r: 'LML-', d: new Date().toISOString().slice(0, 10),
    i: [['Chapelet', 1, null, []]], l: ['Envoi suivi', 0, 0],
    c: { n: 'Nom du client', t: '', e: '', a: 'Adresse', p: 'Code postal', v: 'Ville', y: 'Guadeloupe' },
    dc: '', pm: '', m: ''
  };

  var zoneDocs = $('[data-documents]');
  var zoneChargement = $('[data-chargement]');
  var commande = null;

  // ------------------------------------------------------------ BON DE LIVRAISON
  function rendreBon(c) {
    var avecPrix = $('#opt-prix').checked;
    var sousTotal = 0, devis = false;
    var lignes = c.i.map(function (it) {
      var nom = it[0], qte = it[1], pu = it[2], opts = it[3] || [];
      if (pu == null) devis = true; else sousTotal += pu * qte;
      return '<tr><td><strong>' + esc(nom) + '</strong>' +
        (opts.length ? '<ul class="doc-opts">' + opts.map(function (o) { return '<li>' + esc(o[0]) + ' : ' + esc(o[1]) + '</li>'; }).join('') + '</ul>' : '') +
        '</td><td class="num">' + esc(qte) + '</td>' +
        (avecPrix ? '<td class="num">' + (pu == null ? 'sur devis' : euros(pu)) + '</td><td class="num">' + (pu == null ? 'sur devis' : euros(pu * qte)) + '</td>' : '') +
        '<td class="num verif">☐</td></tr>';
    }).join('');
    var liv = c.l || ['', 0, 0];
    var retrait = !!liv[2];
    var cl = c.c || {};
    var adresseClient = retrait ? '<em>Remise en main propre</em>' :
      esc(cl.a) + '<br>' + esc(cl.p) + ' ' + esc(cl.v) + (cl.y ? '<br>' + esc(cl.y) : '');
    var expAdresse = [EXP.adresse, [EXP.cp, EXP.ville].filter(Boolean).join(' '), EXP.territoire].filter(Boolean).map(esc).join('<br>') ||
      '<span class="a-completer">Votre adresse : à compléter dans l\'espace admin → Réglages → Expéditeur</span>';
    var totaux = avecPrix ? '<table class="doc-totaux">' +
      '<tr><td>Sous-total</td><td class="num">' + euros(sousTotal) + (devis ? ' + devis' : '') + '</td></tr>' +
      '<tr><td>Livraison · ' + esc(liv[0]) + '</td><td class="num">' + (liv[1] ? euros(liv[1]) : 'Gratuit') + '</td></tr>' +
      '<tr class="total"><td>Total</td><td class="num">' + euros(sousTotal + (liv[1] || 0)) + (devis ? ' + devis' : '') + '</td></tr></table>' : '';

    $('[data-bon]').innerHTML =
      '<header class="doc-head">' +
        '<div class="doc-marque"><strong>' + esc(B.nom) + '</strong><span>' + esc(EXP.slogan || 'Créatrice de chapelets') + '</span>' +
          '<small>' + [B.telephone || EXP.telephone, B.email, B.instagram ? '@' + B.instagram : ''].filter(Boolean).map(esc).join(' · ') + '</small></div>' +
        '<div class="doc-titre"><h1>Bon de livraison</h1>' +
          '<p>N° <strong>' + esc(c.r) + '</strong></p>' +
          '<p>Commande du ' + esc(dateLongue(c.d)) + '</p>' +
          (c.dc ? '<p class="doc-celeb">Célébration le <strong>' + esc(dateLongue(c.dc)) + '</strong></p>' : '') +
        '</div>' +
      '</header>' +
      '<div class="doc-blocs">' +
        '<div class="doc-bloc"><h3>Expéditeur</h3><p><strong>' + esc(EXP.nom || B.nom) + '</strong><br>' + expAdresse +
          (EXP.telephone ? '<br>Tél. ' + esc(EXP.telephone) : '') + '</p></div>' +
        '<div class="doc-bloc"><h3>Destinataire</h3><p><strong>' + esc(cl.n) + '</strong><br>' + adresseClient +
          (cl.t ? '<br>Tél. ' + esc(cl.t) : '') + (cl.e ? '<br>' + esc(cl.e) : '') + '</p></div>' +
      '</div>' +
      '<p class="doc-mode"><strong>Mode de livraison :</strong> ' + esc(liv[0]) + (c.pm ? ' &nbsp;·&nbsp; <strong>Paiement :</strong> ' + esc(c.pm) : '') + '</p>' +
      '<table class="doc-table"><thead><tr><th>Désignation</th><th class="num">Qté</th>' +
        (avecPrix ? '<th class="num">Prix unit.</th><th class="num">Total</th>' : '') + '<th class="num">Vérifié</th></tr></thead><tbody>' + lignes + '</tbody></table>' +
      totaux +
      (c.m ? '<div class="doc-message"><h3>Message du client</h3><p>' + esc(c.m) + '</p></div>' : '') +
      '<div class="doc-pied">' +
        '<div class="doc-controle"><p>☐ Paiement reçu</p><p>☐ Articles vérifiés</p><p>☐ Emballage soigné</p></div>' +
        '<div class="doc-signature"><p>Reçu en bon état le : ____ / ____ / ________</p><p>Signature du client :</p><div class="doc-sign-zone"></div></div>' +
      '</div>' +
      '<p class="doc-merci">Merci pour votre confiance</p>' +
      '<p class="doc-slogan">Un chapelet, une prière, une lumière pour chaque étape de la vie…</p>';
  }

  // ------------------------------------------------------------ ÉTIQUETTE
  function rendreEtiquette(c) {
    var cl = c.c || {};
    var liv = c.l || ['', 0, 0];
    var retrait = !!liv[2];
    var fragile = $('#opt-fragile').checked;
    var expLignes = [EXP.nom || B.nom, EXP.adresse, [EXP.cp, EXP.ville].filter(Boolean).join(' '), EXP.territoire, EXP.telephone ? 'Tél. ' + EXP.telephone : '']
      .filter(Boolean).map(esc).join('<br>');
    if (!EXP.adresse) expLignes += '<br><span class="a-completer">Adresse expéditeur à compléter (Réglages)</span>';
    var dest = retrait ? '<p class="et-nom">' + esc(cl.n) + '</p><p class="et-ville">Remise en main propre</p>' :
      '<p class="et-nom">' + esc(cl.n) + '</p><p>' + esc(cl.a) + '</p>' +
      '<p class="et-ville">' + esc(cl.p) + ' ' + esc(String(cl.v || '').toUpperCase()) + '</p>' +
      (cl.y ? '<p class="et-pays">' + esc(String(cl.y).toUpperCase()) + '</p>' : '');
    $('[data-etiquette]').innerHTML =
      '<div class="et-haut"><div class="et-exp"><h4>Expéditeur</h4><p>' + expLignes + '</p></div>' +
        '<div class="et-timbre">Timbre /<br>affranchissement<br>La Poste</div></div>' +
      '<div class="et-dest"><h4>Destinataire</h4>' + dest + (cl.t ? '<p class="et-tel">Tél. ' + esc(cl.t) + '</p>' : '') + '</div>' +
      (fragile ? '<div class="et-fragile">⚠ FRAGILE — Manipuler avec soin</div>' : '') +
      '<div class="et-bas"><span>Réf. <strong>' + esc(c.r) + '</strong></span><span>' + esc(liv[0]) + '</span></div>' +
      '<div class="et-marque">' + esc(B.nom) + ' · Fait main avec amour et foi</div>';
  }

  // ------------------------------------------------------------ CONFIRMATION AU CLIENT
  // Numéro du client au format WhatsApp international (Antilles-Guyane, Réunion, métropole).
  function numeroWhatsApp(tel) {
    var t = String(tel || '').replace(/[^\d+]/g, '');
    if (!t) return '';
    if (t.indexOf('+') === 0) return t.slice(1);
    if (t.indexOf('00') === 0) return t.slice(2);
    if (t.charAt(0) !== '0' || t.length !== 10) return t;
    var n = t.slice(1);
    var prefixes = { '690': '590', '691': '590', '590': '590', '696': '596', '697': '596', '596': '596',
                     '694': '594', '594': '594', '692': '262', '693': '262', '262': '262', '639': '262', '269': '262' };
    return (prefixes[n.slice(0, 3)] || '33') + n;
  }

  function messageConfirmation(c) {
    var cl = c.c || {};
    var liv = c.l || ['', 0, 0];
    var retrait = !!liv[2];
    var sousTotal = 0, devis = false;
    var L = [];
    L.push('Bonjour ' + (cl.n || '') + ',', '');
    L.push('Merci infiniment pour votre commande et pour votre confiance ! 🙏');
    L.push('Nous avons bien reçu votre commande n° ' + c.r + ' et elle est prise en compte : nous la traitons dès maintenant, avec tout notre soin. Chaque chapelet est créé à la main, avec amour et foi.', '');
    L.push('— Récapitulatif de votre commande —');
    (c.i || []).forEach(function (it) {
      var nom = it[0], qte = it[1], pu = it[2], opts = it[3] || [];
      if (pu == null) devis = true; else sousTotal += pu * qte;
      L.push('• ' + qte + ' × ' + nom + ' — ' + (pu == null ? 'sur devis' : euros(pu * qte)));
      opts.forEach(function (o) { L.push('    ↳ ' + o[0] + ' : ' + o[1]); });
    });
    var total = sousTotal + (liv[1] || 0);
    L.push('');
    L.push('Sous-total : ' + euros(sousTotal) + (devis ? ' (+ articles sur devis)' : ''));
    L.push('Livraison : ' + liv[0] + ' (' + (liv[1] ? euros(liv[1]) : 'offerte') + ')');
    L.push('Total : ' + euros(total) + (devis ? ' + devis à confirmer' : ''), '');
    if (retrait) L.push('📍 Remise en main propre : nous vous contactons très vite pour convenir ensemble du lieu et de la date.');
    else L.push('📦 Livraison à : ' + [cl.a, [cl.p, cl.v].filter(Boolean).join(' '), cl.y].filter(Boolean).join(', '));
    if (c.dc) L.push('🗓️ Date de la célébration : ' + dateLongue(c.dc) + ' : nous l\'avons bien notée et ferons le nécessaire pour que votre commande soit prête à temps.');
    if (B.delai) L.push('⏳ Délai de création : ' + B.delai + '.');
    L.push('');
    var pm = String(c.pm || '');
    var montant = euros(total) + (devis ? ' (+ devis)' : '');
    if (/virement/i.test(pm)) {
      var v = B.virement || {};
      L.push('💳 Paiement par virement : merci de virer ' + montant + ' en indiquant la référence ' + c.r + '.');
      L.push('   Titulaire : ' + (v.titulaire || B.nom));
      if (v.iban) L.push('   IBAN : ' + v.iban);
      if (v.bic) L.push('   BIC : ' + v.bic);
    } else if (/carte/i.test(pm)) {
      if (B.carte && B.carte.actif && B.carte.lien) L.push('💳 Paiement par carte : vous pouvez régler ' + montant + ' en toute sécurité ici : ' + B.carte.lien);
      else L.push('💳 Paiement par carte : nous vous envoyons très vite un lien de paiement sécurisé de ' + montant + '.');
    } else if (/remise|main propre/i.test(pm)) {
      L.push('💶 Paiement : vous réglerez ' + montant + ' lors de la remise en main propre.');
    } else {
      L.push('💶 Paiement : nous revenons vers vous très vite pour convenir ensemble du règlement de ' + montant + '.');
    }
    if (devis) L.push('Le prix des articles sur devis vous sera communiqué très rapidement.');
    L.push('');
    L.push('Nous vous tiendrons informé(e) de chaque étape et vous préviendrons dès que votre commande sera ' + (retrait ? 'prête' : 'expédiée') + '.');
    L.push('Pour toute question, il vous suffit de répondre à ce message' + (B.telephone ? ' ou de nous écrire sur WhatsApp au ' + B.telephone : '') + '.', '');
    L.push('Avec toute notre gratitude,');
    L.push(B.nom || 'La Main de Lumière');
    L.push((EXP.slogan || 'Créatrice de chapelets') + (B.instagram ? ' · Instagram @' + B.instagram : ''));
    L.push('« Un chapelet, une prière, une lumière pour chaque étape de la vie… »');
    return {
      objet: 'Votre commande ' + c.r + ' est bien enregistrée — ' + (B.nom || 'La Main de Lumière'),
      texte: L.join('\n')
    };
  }

  var zoneCC = $('[data-confirm-client]');
  function majLiensCC() {
    if (!zoneCC || !commande) return;
    var cl = commande.c || {};
    var objet = $('#cc-objet').value, texte = $('#cc-texte').value;
    var bEmail = $('[data-cc-email]'), bWa = $('[data-cc-whatsapp]');
    var num = numeroWhatsApp(cl.t);
    bEmail.href = 'mailto:' + encodeURIComponent(cl.e || '').replace(/%40/g, '@') + '?subject=' + encodeURIComponent(objet) + '&body=' + encodeURIComponent(texte);
    bWa.href = 'https://wa.me/' + num + '?text=' + encodeURIComponent(texte);
    bWa.hidden = !num;
    var infos = [];
    if (cl.e) infos.push('E-mail du client : ' + cl.e);
    else infos.push('⚠️ Le client n\'a pas indiqué d\'e-mail : ajoutez son adresse dans votre messagerie, ou envoyez le message par WhatsApp.');
    if (num) infos.push('WhatsApp : ' + cl.t);
    $('[data-cc-info]').textContent = infos.join(' · ');
  }
  function remplirCC(c) {
    if (!zoneCC) return;
    var client = /vue=client/.test(location.hash) || c === MODELE_VIDE_ACTIF;
    zoneCC.hidden = client;
    if (client) return;
    var m = messageConfirmation(c);
    $('#cc-objet').value = m.objet;
    $('#cc-texte').value = m.texte;
    majLiensCC();
  }
  var MODELE_VIDE_ACTIF = null;
  if (zoneCC) {
    $('#cc-objet').addEventListener('input', majLiensCC);
    $('#cc-texte').addEventListener('input', majLiensCC);
    $('[data-cc-reset]').addEventListener('click', function () { if (commande) remplirCC(commande); });
    $('[data-cc-copier]').addEventListener('click', function () {
      var t = $('#cc-texte'), btn = this;
      function ok() { btn.textContent = '✅ Message copié'; setTimeout(function () { btn.textContent = '📋 Copier le message'; }, 2500); }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t.value).then(ok, function () { t.select(); document.execCommand('copy'); ok(); });
      else { t.select(); document.execCommand('copy'); ok(); }
    });
  }

  function rendre() {
    if (!commande) return;
    rendreBon(commande);
    rendreEtiquette(commande);
    $$('[data-bon], [data-etiquette]').forEach(function (el) { el.setAttribute('contenteditable', 'true'); el.spellcheck = false; });
    document.title = 'Bon de livraison ' + commande.r + ' · ' + B.nom;
  }

  function afficher(c) {
    commande = c;
    zoneChargement.hidden = true;
    zoneDocs.hidden = false;
    rendre();
    remplirCC(c);
  }

  // ------------------------------------------------------------ IMPRESSION
  var stylePage = document.createElement('style');
  document.head.appendChild(stylePage);
  function imprimer(quoi) {
    var format = $('#opt-format').value;
    document.body.classList.remove('imp-bon', 'imp-etiquette', 'imp-thermique');
    document.body.classList.add(quoi === 'bon' ? 'imp-bon' : 'imp-etiquette');
    if (quoi === 'etiquette' && format === 'thermique') {
      document.body.classList.add('imp-thermique');
      stylePage.textContent = '@page { size: 100mm 150mm; margin: 0; }';
    } else {
      stylePage.textContent = '@page { size: A4 portrait; margin: 10mm; }';
    }
    setTimeout(function () { window.print(); }, 50);
  }
  window.addEventListener('afterprint', function () { document.body.classList.remove('imp-bon', 'imp-etiquette', 'imp-thermique'); });

  // ------------------------------------------------------------ ÉVÉNEMENTS
  $('[data-imprimer-bon]').addEventListener('click', function () { imprimer('bon'); });
  $('[data-imprimer-etiquette]').addEventListener('click', function () { imprimer('etiquette'); });
  $('#opt-prix').addEventListener('change', rendre);
  $('#opt-fragile').addEventListener('change', rendre);
  $('[data-autre-commande]').addEventListener('click', function () {
    history.replaceState(null, '', location.pathname);
    MODELE_VIDE_ACTIF = null;
    commande = null; zoneDocs.hidden = true; zoneChargement.hidden = false;
    $('#coller').value = ''; $('#coller').focus();
  });
  $('[data-charger]').addEventListener('click', function () {
    var err = $('[data-erreur]');
    try {
      var c = lireDepuisTexte($('#coller').value);
      if (!c) throw new Error('lien absent');
      err.hidden = true;
      afficher(c);
    } catch (e) {
      err.hidden = false;
    }
  });
  $('[data-vierge]').addEventListener('click', function () { MODELE_VIDE_ACTIF = JSON.parse(JSON.stringify(MODELE_VIDE)); afficher(MODELE_VIDE_ACTIF); });

  // Chargement automatique depuis le lien de la commande
  try {
    var c0 = lireDepuisTexte(location.hash);
    if (c0) afficher(c0);
  } catch (e) {
    $('[data-erreur]').hidden = false;
  }
})();
