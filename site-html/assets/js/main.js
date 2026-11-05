/* =====================================================================
   LA MAIN DE LUMIÈRE — FONCTIONNEMENT DU SITE (panier, commande)
   Les réglages (WhatsApp, e-mail, livraisons, IBAN, paiement par carte)
   sont dans assets/js/reglages.js, fabriqué à partir de contenu/reglages.json
   et modifiable depuis l'espace admin.
   ===================================================================== */
if (typeof BOUTIQUE === 'undefined') {
  var BOUTIQUE = { nom: 'La Main de Lumière', whatsapp: '', email: '', instagram: '', livraisons: [{ id: 'retrait', nom: 'Remise en main propre', prix: 0, delai: '' }], virement: {}, carte: { actif: false, lien: '' } };
}

/* =====================================================================
   FONCTIONNEMENT DU SITE — inutile de modifier ce qui suit
   ===================================================================== */
(function () {
  'use strict';

  // --- Stockage du panier (dans le navigateur du visiteur) ---
  var memoire = {};
  var stockage = (function () {
    try {
      localStorage.setItem('_test', '1'); localStorage.removeItem('_test');
      return { lire: function (k) { return localStorage.getItem(k); }, ecrire: function (k, v) { localStorage.setItem(k, v); } };
    } catch (e) {
      return { lire: function (k) { return memoire[k] || null; }, ecrire: function (k, v) { memoire[k] = v; } };
    }
  })();

  function lirePanier() { try { return JSON.parse(stockage.lire('lml_panier')) || []; } catch (e) { return []; } }
  function ecrirePanier(p) { stockage.ecrire('lml_panier', JSON.stringify(p)); majCompteur(); }
  function euros(n) { return Number(n).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function majCompteur() {
    var n = lirePanier().reduce(function (s, i) { return s + i.qte; }, 0);
    $$('[data-compteur]').forEach(function (el) { el.textContent = n; el.hidden = n === 0; });
  }

  // --- Notification ---
  var toastTimer;
  function toast(html) {
    var t = $('#toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
    t.innerHTML = html; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove('show'); }, 3500);
  }

  // --- Ajout au panier : tout bouton portant la classe "btn-ajouter" ---
  // Les choix de personnalisation sont lus dans le bloc indiqué par data-options-depuis
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.btn-ajouter');
    if (!b) return;
    e.preventDefault();
    var options = [], manquant = null;
    var bloc = b.getAttribute('data-options-depuis') ? $(b.getAttribute('data-options-depuis')) : null;
    if (bloc) {
      $$('[data-option]', bloc).forEach(function (champ) {
        champ.classList.remove('invalid');
        var v = String(champ.value || '').trim();
        if (!v && champ.required) { champ.classList.add('invalid'); if (!manquant) manquant = champ; }
        if (v) options.push({ nom: champ.getAttribute('data-option'), valeur: v });
      });
    }
    if (manquant) {
      manquant.focus();
      toast('Merci de choisir : <strong>' + esc(manquant.getAttribute('data-option')) + '</strong>');
      return;
    }
    var qteInput = b.getAttribute('data-qte-depuis') ? $(b.getAttribute('data-qte-depuis')) : null;
    var qte = Math.max(1, parseInt(qteInput ? qteInput.value : 1, 10) || 1);
    var prix = parseFloat(b.getAttribute('data-item-price'));
    var produit = {
      id: b.getAttribute('data-item-id') + (options.length ? '::' + options.map(function (o) { return o.valeur; }).join('|') : ''),
      nom: b.getAttribute('data-item-name'),
      prix: isNaN(prix) ? null : prix,
      image: b.getAttribute('data-item-image'),
      url: b.getAttribute('data-item-url'),
      options: options,
      qte: qte
    };
    var panier = lirePanier();
    var existant = panier.filter(function (i) { return i.id === produit.id; })[0];
    if (existant) existant.qte = Math.min(99, existant.qte + qte); else panier.push(produit);
    ecrirePanier(panier);
    toast('<strong>« ' + esc(produit.nom) + ' »</strong> a été ajouté au panier <a href="panier.html">Voir le panier →</a>');
  });

  // --- Menu mobile ---
  var menuBtn = $('[data-menu-toggle]'), menu = $('[data-menu]');
  if (menuBtn && menu) menuBtn.addEventListener('click', function () { menu.classList.toggle('open'); });

  // --- Sélecteurs de quantité +/- ---
  $$('[data-qty]').forEach(function (box) {
    var input = $('input', box);
    $$('[data-step]', box).forEach(function (btn) {
      btn.addEventListener('click', function () {
        input.value = Math.min(99, Math.max(1, (parseInt(input.value, 10) || 1) + Number(btn.getAttribute('data-step'))));
      });
    });
  });

  // --- Recherche (en-tête) : redirige vers la boutique ---
  $$('form[data-recherche]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = $('input', f).value.trim();
      location.href = 'boutique.html' + (q ? '?q=' + encodeURIComponent(q) : '');
    });
  });

  // =================== PAGE BOUTIQUE : filtres, recherche, tri ===================
  var grille = $('[data-catalogue]');
  if (grille) {
    var params = new URLSearchParams(location.search);
    var etat = { cat: params.get('categorie') || 'tout', q: params.get('q') || '', tri: 'defaut' };
    var cartes = $$('.card', grille);
    cartes.forEach(function (c, i) { c.setAttribute('data-ordre', i); });
    var champ = $('[data-filtre-recherche]');
    if (champ) champ.value = etat.q;

    function appliquer() {
      var q = etat.q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      var visibles = 0;
      cartes.forEach(function (c) {
        var texte = (c.getAttribute('data-nom') + ' ' + c.textContent).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        var ok = (etat.cat === 'tout' || c.getAttribute('data-categorie') === etat.cat) && (!q || texte.indexOf(q) > -1);
        c.hidden = !ok; if (ok) visibles++;
      });
      var tries = cartes.slice().sort(function (a, b) {
        if (etat.tri === 'prix-asc') return a.getAttribute('data-prix') - b.getAttribute('data-prix');
        if (etat.tri === 'prix-desc') return b.getAttribute('data-prix') - a.getAttribute('data-prix');
        if (etat.tri === 'nom') return a.getAttribute('data-nom').localeCompare(b.getAttribute('data-nom'), 'fr');
        return a.getAttribute('data-ordre') - b.getAttribute('data-ordre');
      });
      tries.forEach(function (c) { grille.appendChild(c); });
      $$('[data-filtre]').forEach(function (ch) { ch.classList.toggle('active', ch.getAttribute('data-filtre') === etat.cat); });
      var titre = $('[data-titre-catalogue]');
      var chipActif = $('[data-filtre="' + etat.cat + '"]');
      if (titre) titre.textContent = etat.q ? 'Résultats pour « ' + etat.q + ' »' : (etat.cat !== 'tout' && chipActif ? chipActif.textContent : 'Toutes nos créations');
      $('[data-nb-resultats]').textContent = visibles + ' création' + (visibles > 1 ? 's' : '');
      $('[data-aucun-resultat]').hidden = visibles > 0;
    }
    $$('[data-filtre]').forEach(function (ch) {
      ch.addEventListener('click', function (e) { e.preventDefault(); etat.cat = ch.getAttribute('data-filtre'); appliquer(); });
    });
    if (champ) champ.addEventListener('input', function () { etat.q = champ.value.trim(); appliquer(); });
    var tri = $('[data-tri]');
    if (tri) tri.addEventListener('change', function () { etat.tri = tri.value; appliquer(); });
    appliquer();
  }

  // =================== PAGE PANIER & COMMANDE ===================
  var zonePanier = $('[data-panier]');
  if (zonePanier) {
    var form = $('#form-commande');
    var choixLivraison = $('[data-livraisons]');

    // Options de livraison générées depuis les réglages
    choixLivraison.innerHTML = BOUTIQUE.livraisons.map(function (l, i) {
      return '<label class="option"><input type="radio" name="livraison" value="' + l.id + '"' + (i === 0 ? ' checked' : '') + '>' +
        '<span class="option-body"><strong>' + esc(l.nom) + '</strong><small>' + esc(l.delai) +
        (l.offerteDes ? ' · offerte dès ' + euros(l.offerteDes) : '') + '</small></span>' +
        '<span class="option-price" data-prix-livraison="' + l.id + '"></span></label>';
    }).join('');
    if (BOUTIQUE.carte.actif) $('[data-carte-desc]').textContent = 'Paiement sécurisé en ligne après envoi de la commande';

    function livraisonChoisie(sousTotal) {
      var id = (form.querySelector('input[name=livraison]:checked') || {}).value;
      var l = BOUTIQUE.livraisons.filter(function (x) { return x.id === id; })[0] || BOUTIQUE.livraisons[0];
      var cout = l.offerteDes && sousTotal >= l.offerteDes ? 0 : l.prix;
      return { id: l.id, nom: l.nom, cout: cout };
    }

    function rendre() {
      var panier = lirePanier();
      var vide = panier.length === 0;
      $('[data-panier-vide]').hidden = !vide;
      $('[data-panier-plein]').hidden = vide;
      if (vide) return;

      $('[data-lignes]').innerHTML = panier.map(function (i, idx) {
        return '<div class="cart-row">' +
          '<a href="' + esc(i.url) + '" class="cart-thumb"><img src="' + esc(i.image) + '" alt=""></a>' +
          '<div class="cart-desc"><a href="' + esc(i.url) + '"><strong>' + esc(i.nom) + '</strong></a><span class="muted">' + (i.prix == null ? 'Prix sur devis' : euros(i.prix) + " l'unité") + '</span>' +
          (i.options && i.options.length ? '<span class="cart-opts">' + i.options.map(function (o) { return esc(o.nom) + ' : ' + esc(o.valeur); }).join(' · ') + '</span>' : '') + '</div>' +
          '<div class="qty qty-small"><button type="button" data-moins="' + idx + '" aria-label="Diminuer">−</button><input type="number" min="1" max="99" value="' + i.qte + '" data-qte="' + idx + '" aria-label="Quantité"><button type="button" data-plus="' + idx + '" aria-label="Augmenter">+</button></div>' +
          '<strong class="cart-line">' + (i.prix == null ? 'Sur devis' : euros(i.prix * i.qte)) + '</strong>' +
          '<button type="button" class="icon-btn-plain" data-retirer="' + idx + '" aria-label="Retirer">' +
          '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg></button></div>';
      }).join('');

      var sousTotal = panier.reduce(function (s, i) { return s + (i.prix || 0) * i.qte; }, 0);
      $('[data-devis]').hidden = !panier.some(function (i) { return i.prix == null; });
      BOUTIQUE.livraisons.forEach(function (l) {
        var c = l.offerteDes && sousTotal >= l.offerteDes ? 0 : l.prix;
        var el = $('[data-prix-livraison="' + l.id + '"]'); if (el) el.textContent = c ? euros(c) : 'Gratuit';
      });
      var liv = livraisonChoisie(sousTotal);
      $('[data-sous-total]').textContent = euros(sousTotal);
      $('[data-livraison]').textContent = liv.cout ? euros(liv.cout) : 'Gratuit';
      $('[data-total]').textContent = euros(sousTotal + liv.cout);

      var gratuite = BOUTIQUE.livraisons.filter(function (l) { return l.offerteDes; })[0];
      var conseil = $('[data-conseil]');
      if (gratuite && sousTotal < gratuite.offerteDes) { conseil.innerHTML = 'Plus que <strong>' + euros(gratuite.offerteDes - sousTotal) + '</strong> pour la livraison offerte (' + esc(gratuite.nom) + ') ✨'; conseil.hidden = false; }
      else if (gratuite) { conseil.innerHTML = 'Livraison offerte (' + esc(gratuite.nom) + ') ✨'; conseil.hidden = false; }

      // Adresse masquée en cas de retrait ; paiement au retrait réservé au retrait
      var retrait = liv.id === 'retrait';
      $('[data-adresse]').hidden = retrait;
      $$('[data-adresse] input[data-requis]').forEach(function (inp) { inp.required = !retrait; });
      var optRetrait = $('[data-paiement-retrait]');
      optRetrait.classList.toggle('disabled', !retrait);
      var radio = $('input', optRetrait);
      radio.disabled = !retrait;
      if (!retrait && radio.checked) { radio.checked = false; form.querySelector('input[name=paiement][value=virement]').checked = true; }
    }

    zonePanier.addEventListener('click', function (e) {
      var t = e.target.closest('[data-moins],[data-plus],[data-retirer]');
      if (!t) return;
      var panier = lirePanier();
      if (t.hasAttribute('data-retirer')) panier.splice(Number(t.getAttribute('data-retirer')), 1);
      else {
        var idx = Number(t.getAttribute('data-moins') || t.getAttribute('data-plus'));
        panier[idx].qte = Math.min(99, Math.max(1, panier[idx].qte + (t.hasAttribute('data-plus') ? 1 : -1)));
      }
      ecrirePanier(panier); rendre();
    });
    zonePanier.addEventListener('change', function (e) {
      if (e.target.hasAttribute('data-qte')) {
        var panier = lirePanier(); var idx = Number(e.target.getAttribute('data-qte'));
        var v = parseInt(e.target.value, 10) || 0;
        if (v <= 0) panier.splice(idx, 1); else panier[idx].qte = Math.min(99, v);
        ecrirePanier(panier);
      }
      rendre();
    });

    // --- Construction du message de commande ---
    function construireCommande() {
      var panier = lirePanier();
      var d = new FormData(form);
      var sousTotal = panier.reduce(function (s, i) { return s + (i.prix || 0) * i.qte; }, 0);
      var aDevis = panier.some(function (i) { return i.prix == null; });
      var liv = livraisonChoisie(sousTotal);
      var ref = 'LML-' + Date.now().toString(36).toUpperCase().slice(-6);
      var paiements = { virement: 'Virement bancaire', retrait: 'Paiement à la remise en main propre', carte: 'Carte bancaire (lien de paiement)' };
      var lignes = [
        'Bonjour ' + BOUTIQUE.nom + ' ! Je souhaite passer commande :',
        '',
        'Commande ' + ref,
      ];
      panier.forEach(function (i) {
        lignes.push('• ' + i.qte + ' × ' + i.nom + ' — ' + (i.prix == null ? 'sur devis' : euros(i.prix * i.qte)));
        (i.options || []).forEach(function (o) { lignes.push('    ↳ ' + o.nom + ' : ' + o.valeur); });
      });
      lignes.push('', 'Sous-total : ' + euros(sousTotal) + (aDevis ? ' (+ articles sur devis)' : ''), 'Livraison : ' + liv.nom + ' (' + (liv.cout ? euros(liv.cout) : 'gratuit') + ')', 'TOTAL : ' + euros(sousTotal + liv.cout) + (aDevis ? ' + devis à confirmer' : ''), '');
      lignes.push('Nom : ' + d.get('nom'), 'Téléphone : ' + d.get('telephone'));
      if (d.get('email')) lignes.push('E-mail : ' + d.get('email'));
      if (d.get('date')) lignes.push('Date de la célébration : ' + new Date(d.get('date') + 'T12:00').toLocaleDateString('fr-FR', { dateStyle: 'long' }));
      if (liv.id !== 'retrait') lignes.push('Adresse : ' + d.get('adresse') + ', ' + d.get('cp') + ' ' + d.get('ville') + ', ' + d.get('territoire'));
      lignes.push('Paiement souhaité : ' + paiements[d.get('paiement')]);
      if (String(d.get('message') || '').trim()) lignes.push('', 'Message : ' + d.get('message'));
      var texte = lignes.join('\n');
      return {
        ref: ref, total: sousTotal + liv.cout, devis: aDevis, paiement: d.get('paiement'), texte: texte,
        whatsapp: 'https://wa.me/' + BOUTIQUE.whatsapp + '?text=' + encodeURIComponent(texte),
        email: 'mailto:' + BOUTIQUE.email + '?subject=' + encodeURIComponent('Commande ' + ref + ' — ' + d.get('nom')) + '&body=' + encodeURIComponent(texte)
      };
    }

    function envoyer(canal) {
      if (!form.reportValidity()) return;
      var c = construireCommande();
      if (canal === 'whatsapp') window.open(c.whatsapp, '_blank');
      else location.href = c.email;
      stockage.ecrire('lml_derniere_commande', JSON.stringify(c));
      ecrirePanier([]);
      afficherConfirmation(c);
    }

    function afficherConfirmation(c) {
      $('[data-panier-plein]').hidden = true;
      $('[data-panier-vide]').hidden = true;
      var b = BOUTIQUE.virement;
      var instructions = '';
      if (c.paiement === 'virement') instructions = '<div class="box"><h3>Paiement par virement</h3><p>Après confirmation de notre part, merci de virer <strong>' + euros(c.total) + '</strong> en indiquant la référence <strong>' + esc(c.ref) + '</strong>.</p><p>Titulaire : ' + esc(b.titulaire) + '<br>IBAN : ' + esc(b.iban) + '<br>BIC : ' + esc(b.bic) + '</p></div>';
      else if (c.paiement === 'carte' && BOUTIQUE.carte.actif && BOUTIQUE.carte.lien) instructions = '<div class="box"><h3>Paiement par carte</h3><p>Réglez <strong>' + euros(c.total) + '</strong> en toute sécurité :</p><a class="btn" target="_blank" rel="noopener" href="' + esc(BOUTIQUE.carte.lien) + '">Payer par carte</a></div>';
      else if (c.paiement === 'carte') instructions = '<div class="box"><p>Je vous envoie très vite un <strong>lien de paiement sécurisé par carte</strong> de ' + euros(c.total) + '.</p></div>';
      else instructions = '<div class="box"><p>Vous réglerez <strong>' + euros(c.total) + "</strong> lors de la remise en main propre. Je vous contacte pour convenir du lieu et de la date.</p></div>";
      var z = $('[data-confirmation]');
      z.innerHTML = '<div class="confirm"><div class="confirm-icon"><svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M7.5 12.5l3 3 6-6.5"/></svg></div>' +
        '<h1>Merci pour votre commande !</h1><p>Référence <strong>' + esc(c.ref) + '</strong> · Total <strong>' + euros(c.total) + (c.devis ? ' + devis' : '') + '</strong></p>' +
        '<p class="muted">Votre commande vient de s\'ouvrir dans WhatsApp ou dans votre messagerie : pensez à appuyer sur <strong>Envoyer</strong>. Nous revenons vers vous très vite pour confirmer votre création' + (c.devis ? ' et vous transmettre le devis' : '') + '.</p>' +
        instructions +
        '<p class="small muted" style="margin-top:24px">Rien ne s\'est ouvert ? Renvoyez votre commande : <a href="' + esc(c.whatsapp) + '" target="_blank" rel="noopener">par WhatsApp</a> · <a href="' + esc(c.email) + '">par e-mail</a></p>' +
        '<a href="boutique.html" class="btn btn-ghost">Retour à la boutique</a></div>';
      z.hidden = false;
      window.scrollTo(0, 0);
    }

    $('[data-envoi-whatsapp]').addEventListener('click', function () { envoyer('whatsapp'); });
    $('[data-envoi-email]').addEventListener('click', function () { envoyer('email'); });
    form.addEventListener('submit', function (e) { e.preventDefault(); envoyer('whatsapp'); });
    rendre();
  }

  // =================== PAGE CONTACT ===================
  var formContact = $('#form-contact');
  if (formContact) {
    var sujet = new URLSearchParams(location.search).get('sujet');
    if (sujet) formContact.elements.sujet.value = sujet;
    function messageContact() {
      var d = new FormData(formContact);
      return { sujet: d.get('sujet') || 'Message depuis le site', texte: 'Bonjour,\n\n' + d.get('message') + '\n\n' + d.get('nom') + (d.get('email') ? ' — ' + d.get('email') : '') };
    }
    formContact.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!formContact.reportValidity()) return;
      var m = messageContact();
      location.href = 'mailto:' + BOUTIQUE.email + '?subject=' + encodeURIComponent(m.sujet) + '&body=' + encodeURIComponent(m.texte);
      $('[data-contact-ok]').hidden = false;
    });
    $('[data-contact-whatsapp]').addEventListener('click', function () {
      if (!formContact.reportValidity()) return;
      var m = messageContact();
      window.open('https://wa.me/' + BOUTIQUE.whatsapp + '?text=' + encodeURIComponent(m.sujet + '\n\n' + m.texte), '_blank');
      $('[data-contact-ok]').hidden = false;
    });
  }

  // Liens WhatsApp / e-mail génériques (pied de page, etc.)
  // Galerie photos des fiches produits
  $$('[data-vignettes] .thumb').forEach(function (b) {
    b.addEventListener('click', function () {
      var principale = $('[data-photo-principale]'); if (principale) principale.src = b.getAttribute('data-photo');
      $$('[data-vignettes] .thumb').forEach(function (x) { x.classList.toggle('active', x === b); });
    });
  });

  $$('[data-lien-whatsapp]').forEach(function (a) { a.href = 'https://wa.me/' + BOUTIQUE.whatsapp; });
  $$('[data-lien-instagram]').forEach(function (a) { a.href = 'https://www.instagram.com/' + BOUTIQUE.instagram + '/'; });
  $$('[data-lien-email]').forEach(function (a) { a.href = 'mailto:' + BOUTIQUE.email; a.textContent = a.textContent || BOUTIQUE.email; });

  majCompteur();
})();
