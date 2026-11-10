#!/usr/bin/env python3
"""Génère les pages HTML statiques de « La Main de Lumière » (créatrice de chapelets).
Outil interne : le site final est 100 % HTML/CSS/JS et ne dépend pas de ce script."""
import html, os, math, glob, json, re

# ------------------------------------------------------------------ DONNÉES MODIFIABLES
# Tout le contenu modifiable (produits, prix, photos, réglages, textes) est dans le dossier
# "contenu/" (modifiable depuis l'espace admin Pages CMS). Ce script fabrique les pages HTML.
RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(RACINE, 'site-html')
CONTENU = os.path.join(RACINE, 'contenu')

def lire_json(nom, defaut=None):
    chemin = os.path.join(CONTENU, nom)
    if not os.path.exists(chemin): return defaut
    with open(chemin, encoding='utf-8') as f:
        txt = f.read().strip()
    return json.loads(txt) if txt else defaut

REG = lire_json('reglages.json', {}) or {}
TXT = lire_json('textes.json', {}) or {}
REALISATIONS = [r for r in (lire_json('realisations.json', []) or []) if r and r.get('photo')]

NOM = REG.get('nom') or 'La Main de Lumière'
METIER = REG.get('metier') or 'Créatrice de chapelets'
SLOGAN = 'Des chapelets artisanaux, faits avec amour et foi'
LIEU = REG.get('lieu') or 'Guadeloupe'
TEL = REG.get('telephone') or ''
WA = re.sub(r'\D', '', str(REG.get('whatsapp') or ''))
INSTA = (REG.get('instagram') or '').lstrip('@').strip()
EMAIL = (REG.get('email') or '').strip()
DELAI = REG.get('delai') or '5 à 10 jours'
LEGAL = REG.get('legal') or {}

def nombre(v):
    """Convertit un prix saisi (10, "10", "10,50", "") en nombre ou None."""
    if v is None or v == '': return None
    try: return float(str(v).replace(',', '.').replace('€', '').strip())
    except ValueError: return None

def img(chemin, defaut='images/placeholder.svg'):
    """Normalise le chemin d'une photo choisie dans l'admin -> 'images/xxx.jpg'."""
    if not chemin: return defaut
    c = str(chemin).strip().lstrip('/')
    if c.startswith('site-html/'): c = c[len('site-html/'):]
    if not c.startswith('images/'): c = 'images/' + c.split('/')[-1]
    return c

def paragraphes(texte):
    return [t.strip() for t in re.split(r'\n\s*\n', texte or '') if t.strip()]

LIVRAISONS = []
for l in REG.get('livraisons') or []:
    if not l or not l.get('nom'): continue
    ident = 'retrait' if l.get('main_propre') else re.sub(r'[^a-z0-9]+', '-', l['nom'].lower()).strip('-')
    LIVRAISONS.append(dict(id=ident, nom=l['nom'], prix=nombre(l.get('prix')) or 0, delai=l.get('delai') or '',
                           offerteDes=nombre(l.get('offerte_des')) or None))
if not LIVRAISONS:
    LIVRAISONS = [dict(id='retrait', nom='Remise en main propre', prix=0, delai='À convenir ensemble', offerteDes=None)]

e = lambda s: html.escape(str(s), quote=True)
def prix(p): return f"{p:,.2f} €".replace(',', ' ').replace('.', ',')

# ------------------------------------------------------------------ ICÔNES
def svg(path, size=30, sw=1.4, fill='none'):
    return f'<svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="{fill}" stroke="currentColor" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{path}</svg>'

ICON = {
 'bag': svg('<path d="M6 7h12l1 13H5L6 7z"/><path d="M9 7V6a3 3 0 0 1 6 0v1"/>', 22, 1.6),
 'search': svg('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>', 18, 1.6),
 'menu': svg('<path d="M4 7h16M4 12h16M4 17h16"/>', 24, 1.6),
 'heart': svg('<path d="M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9z"/>', 14, 0, 'currentColor'),
 'lock': svg('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>', 18, 1.6),
 'insta': svg('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/>', 20, 1.6),
 'wa': '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.5 1 2.7.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>',
 # Atouts
 'main': svg('<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12"/><path d="M11 11V4.5a1.5 1.5 0 0 1 3 0V12"/><path d="M14 11.5V6a1.5 1.5 0 0 1 3 0v8c0 4-2.5 7-6.5 7S5 18.5 4 15l-1-3a1.5 1.5 0 0 1 2.7-1.2L8 14"/><path d="M17 3.5l1-1M19.5 6l1.3-.5"/>'),
 'fil': svg('<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M6 7h12M6 17h12M9 10h6M9 12.5h6M9 15h6"/>'),
 'perles': svg('<circle cx="12" cy="6" r="3"/><circle cx="6.5" cy="15" r="3"/><circle cx="17.5" cy="15" r="3"/><circle cx="12" cy="11.5" r="1.2"/>'),
 'croix': svg('<path d="M12 2v20M7 7.5h10"/>'),
 'images': svg('<path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/><path d="M19 15l.7 1.8 1.8.7-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7zM5 16l.5 1.2 1.2.5-1.2.5L5 19.4l-.5-1.2-1.2-.5 1.2-.5z"/>'),
}
OCC_ICON = {
 'bapteme': '<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/><path d="M12 10v7M9.5 12.5h5"/>',
 'communion': '<circle cx="12" cy="4.5" r="2.5"/><path d="M12 3.3v2.4M10.8 4.5h2.4"/><path d="M6 9h12c0 4-2.5 6.5-6 6.5S6 13 6 9z"/><path d="M12 15.5V19M8 21h8"/>',
 'confirmation': '<path d="M2.5 13.5c3.5.5 6-1 8-4.5.5 2.5 2.5 3.5 5 3.5l6-4-2.5 5.5c-1.5 4-5 6-9 6-3 0-5.5-1.2-7.5-3.5l3.5-.8c-2-.5-3.2-1.2-3.5-2.2z"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>',
 'mariage': '<circle cx="9" cy="14.5" r="5"/><circle cx="15" cy="14.5" r="5"/><path d="M13.5 5.5L15 3l1.5 2.5L15 7z"/>',
 'ordination': '<path d="M8 3c1.5 1.5 6.5 1.5 8 0"/><path d="M8 3l-1 18h4l1-11 1 11h4L16 3"/><path d="M14.5 13v4M13 14.5h3"/>',
 'intentions': '<path d="M12 21V9.5c0-2-1-3.5-2-4.5L8 3"/><path d="M12 21V9.5c0-2 1-3.5 2-4.5l2-2"/><path d="M10 5L7 10l-2 4 3 5h4M14 5l3 5 2 4-3 5h-4"/>',
 'pelerinages': '<circle cx="12" cy="6" r="2.4"/><path d="M8.5 3.2a5 5 0 0 1 7 0"/><path d="M12 8.5c-2.5 0-4 2-4 4.5L6.5 21h11L16 13c0-2.5-1.5-4.5-4-4.5z"/><path d="M10.5 13.5c.8.8 2.2.8 3 0"/>',
 'autres': '<path d="M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9z"/><path d="M12 9v6M10 11h4"/>',
}
def occ_icon(k, size=40): return svg(OCC_ICON[k], size, 1.3)

def emblem(size=54):
    """Emblème : chapelet en cercle, lotus, croix et monogramme M."""
    cx, cy, r = 50, 46, 34
    beads = []
    for a in range(0, 360, 12):
        if 78 <= a <= 102 or 258 <= a <= 282: continue
        rad = math.radians(a)
        big = a % 60 == 0
        beads.append(f'<circle cx="{cx + r*math.cos(rad):.1f}" cy="{cy + r*math.sin(rad):.1f}" r="{2.6 if big else 1.9}"/>')
    return (f'<svg class="emblem" viewBox="0 0 100 112" width="{size}" height="{size*1.12:.0f}" aria-hidden="true">'
            f'<g fill="currentColor">{"".join(beads)}</g>'
            '<g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">'
            '<path d="M50 4c-3 3-3 7 0 10 3-3 3-7 0-10z"/><path d="M50 14c-4-1-7-4-8-7 4 0 7 3 8 7zM50 14c4-1 7-4 8-7-4 0-7 3-8 7z"/>'
            '<path d="M50 81v28M42 90h16" stroke-width="3.2"/></g>'
            f'<text x="50" y="60" text-anchor="middle" font-family="Great Vibes, Parisienne, Brush Script MT, cursive" font-size="40" fill="currentColor">M</text></svg>')

FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='16' fill='%23B48A43'/%3E%3Ccircle cx='16' cy='13' r='7' fill='none' stroke='%23fff' stroke-width='1.6' stroke-dasharray='1.6 1.6'/%3E%3Cpath d='M16 20v8M13 23h6' stroke='%23fff' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E"

# ------------------------------------------------------------------ DONNÉES
CATEGORIES = [
    ('chapelets', 'Chapelets'),
    ('sur-mesure', 'Sur mesure'),
    ('maillons-fils', 'Maillons & fils'),
]
CAT = dict(CATEGORIES)

OCCASIONS = [
    ('bapteme', 'Baptême', 'Accueillir la lumière',
     "Un premier chapelet pour accompagner l'entrée dans la vie chrétienne. Perles blanc nacré, médaille de la Vierge, prénom de l'enfant : un souvenir précieux à garder toute une vie."),
    ('communion', 'Première communion & Communion', 'Suivre Jésus toujours',
     "Un chapelet pour marquer ce grand jour de foi, à offrir par les parents, le parrain ou la marraine. Couleurs et médaille choisies selon les goûts du communiant."),
    ('confirmation', 'Confirmation', "Recevoir l'Esprit Saint",
     "Pour accompagner ce sacrement, un chapelet élégant que l'on garde près de soi. Le modèle prestige, avec ses finitions dorées, est souvent choisi pour l'occasion."),
    ('mariage', 'Mariage', "S'unir dans l'amour",
     "Un chapelet pour les mariés, pour les témoins ou en souvenir de la cérémonie. Perles assorties à vos couleurs de mariage, médailles et détails sur mesure."),
    ('ordination', 'Ordination', 'Une mission au service de Dieu',
     "Un présent plein de sens pour accompagner une ordination ou des vœux : un chapelet sobre et solide, pensé pour la prière de chaque jour."),
    ('intentions', 'Intentions de prière', 'Confier · Remercier · Espérer',
     "Pour confier une intention, remercier ou espérer, et pour toutes les autres occasions religieuses : un chapelet créé autour de votre prière."),
    ('pelerinages', 'Pèlerinages', 'Sur les pas de la Vierge',
     "Avant un départ en pèlerinage ou en souvenir d'un sanctuaire, un chapelet robuste, monté sur fil marin, pour vous accompagner sur la route."),
    ('autres', 'Autres événements', 'Tout ce qui compte pour vous',
     "Anniversaire, fête, deuil, remerciement… Chaque moment important de votre vie de foi mérite sa création. Parlez-nous de votre projet."),
]
OCC_NOMS = [o[1] for o in OCCASIONS] + ['Cadeau / dévotion personnelle']

FINITION = ('Finition de la croix et des maillons', 'select', True, ['Doré', 'Argenté'])
OCC_OPT = ('Occasion', 'select', False, OCC_NOMS)
MEDAILLES = ['Vierge Marie', 'Vierge Miraculeuse', 'Sacré-Cœur de Jésus', 'Saint Michel Archange', 'Autre (à préciser ci-dessous)']

TYPES_OPTION = {'liste': 'select', 'texte': 'text', 'texte-long': 'textarea'}

def charger_produits():
    produits = []
    for chemin in sorted(glob.glob(os.path.join(CONTENU, 'produits', '*.json'))):
        slug = os.path.splitext(os.path.basename(chemin))[0]
        try:
            with open(chemin, encoding='utf-8') as f: d = json.load(f)
        except Exception as err:
            print('⚠️  Fichier produit ignoré (illisible) :', chemin, err); continue
        if d.get('masquer') is True or d.get('visible') is False or not d.get('nom'): continue
        cat = d.get('categorie') if d.get('categorie') in CAT else 'chapelets'
        options = []
        for o in d.get('options') or []:
            if not o or not o.get('libelle'): continue
            typ = TYPES_OPTION.get(o.get('type'), 'select')
            choix = [c for c in (o.get('choix') or []) if str(c).strip()]
            if typ == 'select' and not choix: typ = 'text'
            options.append((o['libelle'], typ, bool(o.get('obligatoire')), choix))
        photo = img(d.get('photo'))
        galerie = [img(x) for x in (d.get('galerie') or []) if x]
        produits.append(dict(
            slug=slug, cat=cat, nom=d['nom'], prix=nombre(d.get('prix')), image=photo,
            galerie=[photo] + [g for g in galerie if g != photo],
            badge=(d.get('badge') or '').strip(), court=d.get('resume') or '', accroche=d.get('accroche') or d.get('resume') or '',
            desc=paragraphes(d.get('description')), compo=d.get('composition') or '',
            points=[x for x in (d.get('points_forts') or []) if str(x).strip()],
            options=options, ordre=nombre(d.get('ordre')) or 999))
    produits.sort(key=lambda p: (p['ordre'], p['nom']))
    return produits

PRODUITS = charger_produits()
for p in PRODUITS: p['page'] = f"{p['slug']}.html"
def texte_livraison(l, gras=False):
    cout = 'gratuit' if not l['prix'] else prix(l['prix'])
    extra = f", offert dès {prix(l['offerteDes']).replace(',00', '')} d'achat" if l.get('offerteDes') else ''
    nom = f"<strong>{e(l['nom'])}</strong>" if gras else l['nom']
    return f"{nom} : {cout}{extra}" + (f" — {e(l['delai'])}" if gras and l['delai'] else '')

def affiche_prix(p): return prix(p['prix']) if p['prix'] is not None else 'Sur devis'

# ------------------------------------------------------------------ GABARIT
def page(fichier, titre, corps, actif='', description=SLOGAN, extra_head='', extra_scripts=''):
    nav = [('index.html', 'Accueil', 'accueil'), ('boutique.html', 'Boutique', 'boutique'), ('celebrations.html', 'Célébrations', 'celebrations'),
           ('creatrice.html', 'La créatrice', 'creatrice'), ('contact.html', 'Contact', 'contact')]
    if REALISATIONS: nav.insert(3, ('realisations.html', 'Réalisations', 'realisations'))
    nav_html = '\n        '.join(f'<a href="{h}"{" class=\"active\"" if k == actif else ""}>{l}</a>' for h, l, k in nav)
    titre_complet = f'{titre} · {NOM}' if titre else f'{NOM} — {METIER} en {LIEU}'
    doc = f'''<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{e(titre_complet)}</title>
  <meta name="description" content="{e(description)}">
  <link rel="icon" href="{FAVICON}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&amp;family=Great+Vibes&amp;family=Nunito+Sans:wght@400;600;700&amp;display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/style.css">{extra_head}
</head>
<body>

  <!-- ===== BANDEAU D'ANNONCE ===== -->
  <div class="announce">{e(REG.get('bandeau') or '')}</div>

  <!-- ===== EN-TÊTE ===== -->
  <header class="header">
    <div class="container header-inner">
      <button class="menu-toggle" aria-label="Menu" data-menu-toggle>{ICON['menu']}</button>
      <a href="index.html" class="logo">{emblem(46)}<span class="logo-text"><strong>{e(NOM)}</strong><small>{e(METIER)}</small></span></a>
      <nav class="nav" data-menu>
        {nav_html}
      </nav>
      <div class="header-actions">
        <a href="https://www.instagram.com/{INSTA}/" class="insta" data-lien-instagram target="_blank" rel="noopener" aria-label="Instagram">{ICON['insta']}</a>
        <a href="panier.html" class="cart-link" aria-label="Panier">{ICON['bag']}<span class="cart-count" data-compteur hidden>0</span></a>
      </div>
    </div>
  </header>

  <main>
{corps}
  </main>

  <!-- ===== PIED DE PAGE ===== -->
  <footer class="footer">
    <div class="container footer-grid">
      <div>
        <a href="index.html" class="logo">{emblem(46)}<span class="logo-text"><strong>{e(NOM)}</strong><small>{e(METIER)}</small></span></a>
        <p style="margin-top:16px"><span class="script">Un chapelet, une prière, une lumière dans ton cœur</span></p>
        <div class="social">
          <a href="https://wa.me/{WA}" data-lien-whatsapp target="_blank" rel="noopener" aria-label="WhatsApp">{ICON['wa']}</a>
          <a href="https://www.instagram.com/{INSTA}/" data-lien-instagram target="_blank" rel="noopener" aria-label="Instagram">{ICON['insta']}</a>
        </div>
      </div>
      <div>
        <h4>Boutique</h4>
        <a href="boutique.html">Toutes les créations</a>
        <a href="boutique.html?categorie=chapelets">Chapelets</a>
        <a href="creation-sur-mesure.html">Création sur mesure</a>
        <a href="boutique.html?categorie=maillons-fils">Maillons &amp; fils de marin</a>
      </div>
      <div>
        <h4>Informations</h4>
        <a href="celebrations.html">Célébrations</a>
        <a href="livraison.html">Délais &amp; livraison</a>
        <a href="cgv.html">Conditions générales de vente</a>
        <a href="mentions-legales.html">Mentions légales</a>
      </div>
      <div>
        <h4>Nous contacter</h4>
        <p>Nous sommes situés en {LIEU}<br>WhatsApp : <a href="https://wa.me/{WA}" data-lien-whatsapp target="_blank" rel="noopener">{TEL}</a><br>Instagram : <a href="https://www.instagram.com/{INSTA}/" data-lien-instagram target="_blank" rel="noopener">@{INSTA}</a></p>
      </div>
    </div>
    <div class="container footer-bottom">© 2026 {e(NOM)} · {e(METIER)} · Fait main avec amour et foi en {LIEU}</div>
  </footer>

  <a href="https://wa.me/{WA}" class="wa-float" data-lien-whatsapp target="_blank" rel="noopener" aria-label="Nous écrire sur WhatsApp">{ICON['wa']}</a>
  <script src="assets/js/reglages.js"></script>
  <script src="assets/js/main.js"></script>{extra_scripts}
</body>
</html>
'''
    with open(os.path.join(OUT, fichier), 'w', encoding='utf-8') as f: f.write(doc)

ORN = f'<div class="ornament">{ICON["heart"]}</div>'

def carte(p):
    badge = f'<span class="badge">{e(p["badge"])}</span>' if p.get('badge') else ''
    unite = '' if p['prix'] is None else ''
    return f'''        <!-- Produit : {e(p['nom'])} -->
        <article class="card" data-categorie="{p['cat']}" data-prix="{f"{p['prix']:g}" if p['prix'] is not None else 999}" data-nom="{e(p['nom'])}">
          <a href="{p['page']}" class="card-img">
            <img src="{p['image']}" alt="{e(p['nom'])}" loading="lazy">
            {badge}
          </a>
          <div class="card-body">
            <p class="card-cat">{e(CAT[p['cat']])}</p>
            <h3><a href="{p['page']}">{e(p['nom'])}</a></h3>
            <p class="card-desc">{e(p['court'])}</p>
            <div class="card-foot">
              <p class="price">{affiche_prix(p)}{unite}</p>
              <a href="{p['page']}" class="icon-btn">{'Personnaliser' if p['prix'] is not None else 'Commander'} →</a>
            </div>
          </div>
        </article>'''

def arche(p):
    return f'''        <div class="arch">
          <a href="{p['page']}" class="arch-img"><img src="{p['image']}" alt="{e(p['nom'])}" loading="lazy"></a>
          <h3><a href="{p['page']}">{e(p['nom'])}</a></h3>
          <span class="price-badge">{affiche_prix(p).replace(',00', '')}</span>
          <p>{e(p['court'])}</p>
          <a href="{p['page']}" class="btn btn-small">Choisir ce chapelet</a>
        </div>'''

def occasion_tuile(o):
    return f'''        <a class="occasion" href="celebrations.html#{o[0]}">
          <span class="occasion-icon">{occ_icon(o[0])}</span>
          <h3>{e(o[1])}</h3>
          <p>{e(o[2])}</p>
        </a>'''

def panneau_fourniture(p):
    points = ''.join(f'<li>{e(x)}</li>' for x in p['points'])
    return f'''        <div class="panel-cmd">
          <img src="{p['image']}" alt="{e(p['nom'])}" loading="lazy">
          <div>
            <h3>{e(p['nom'])}</h3>
            <span class="tag">{e(p['badge'] or 'Disponible sur commande')}</span>
            <p class="muted">{e(p['court'])}</p>
            {f'<ul class="checks">{points}</ul>' if points else ''}
            <a href="{p['page']}" class="btn btn-small">Commander</a>
          </div>
        </div>'''

# ------------------------------------------------------------------ ACCUEIL
def accueil():
    chapelets = [p for p in PRODUITS if p['cat'] == 'chapelets']
    atouts = [('main', 'Fait main'), ('fil', 'Fil marin'), ('perles', 'Perles'), ('croix', 'Croix & médailles'), ('images', "Et créations d'images")]
    fournitures = [p for p in PRODUITS if p['cat'] == 'maillons-fils'][:2]
    panneaux = '\n'.join(panneau_fourniture(p) for p in fournitures)
    bloc_fournitures = f'''
    <!-- ===== SUR COMMANDE : MAILLONS & FILS ===== -->
    <section class="section container">
      <div class="section-head">
        <span class="script">Pour vos créations</span>
        <h2>Maillons &amp; fils de marin</h2>
        {ORN}
        <p>Vous créez vous-même vos chapelets ? Je propose aussi les fournitures que j'utilise, disponibles sur commande.</p>
      </div>
      <div class="duo">
{panneaux}
      </div>
    </section>
''' if fournitures else ''
    trio = f'''      <div class="trio">
{chr(10).join(arche(p) for p in chapelets[:3])}
      </div>''' if chapelets else ''
    creat_paras = ''.join(f'<p>{e(t)}</p>' for t in paragraphes(TXT.get('creatrice_accueil')))
    corps = f'''
    <!-- ===== BANNIÈRE ===== -->
    <section class="hero">
      <div class="hero-img"><img src="{img(TXT.get('banniere_photo'), 'images/hero-vierge.jpg')}" alt="La Vierge Marie en prière, entourée de lys blancs"></div>
      <div class="hero-content container">
        <div class="hero-text">
          {emblem(84)}
          <p class="eyebrow">{e(METIER)} en {LIEU}</p>
          <h1>Toutes vos grandes</h1>
          <span class="big">Célébrations</span>
          <span class="sub">sont les bienvenues</span>
          {ORN}
          <p class="quote">{e(TXT.get('banniere_citation') or '')}</p>
          <div class="hero-actions">
            <a href="boutique.html" class="btn">Découvrir les chapelets</a>
            <a href="https://wa.me/{WA}" data-lien-whatsapp target="_blank" rel="noopener" class="btn btn-ghost">{ICON['wa']} Commander</a>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== LES CHAPELETS ===== -->
    <section class="section container">
      <div class="section-head">
        <span class="script">Nos chapelets</span>
        <h2>{e(SLOGAN)}</h2>
        {ORN}
      </div>
{trio}
      <div class="atouts">
        {''.join(f'<div class="atout">{ICON[k]}{l}</div>' for k, l in atouts)}
      </div>
    </section>

    <!-- ===== CÉLÉBRATIONS ===== -->
    <section class="section section-tint">
      <div class="container">
        <div class="section-head">
          <span class="script">Toutes vos grandes célébrations</span>
          <h2>sont les bienvenues</h2>
          {ORN}
          <p>Avec les plus beaux moments de foi : je crée le chapelet qui accompagnera chacune de vos célébrations.</p>
        </div>
        <div class="occasions">
{chr(10).join(occasion_tuile(o) for o in OCCASIONS)}
        </div>
      </div>
    </section>

    <!-- ===== CITATION ===== -->
    <section class="quote-band">
      <div class="container">
        <blockquote>{e(TXT.get('citation_milieu') or '')}</blockquote>
      </div>
    </section>

{bloc_fournitures}
    <!-- ===== LA CRÉATRICE ===== -->
    <section class="section section-tint">
      <div class="container story">
        <div class="story-img"><img src="{img(TXT.get('creatrice_photo'), 'images/creatrice.jpg')}" alt="La créatrice de La Main de Lumière" loading="lazy"></div>
        <div class="story-text">
          <span class="script">La créatrice</span>
          <h2>{e(TXT.get('creatrice_titre') or 'Des chapelets faits avec amour et foi')}</h2>
          {creat_paras}
          <a href="creatrice.html" class="btn btn-ghost">En savoir plus</a>
        </div>
      </div>
    </section>

    <!-- ===== APPEL À L'ACTION ===== -->
    <section class="cta-band">
      <div class="container">
        <span class="script">Commandez dès maintenant</span>
        <p>Pour toutes demandes ou personnalisations, écrivez-moi : je vous réponds avec plaisir.</p>
        <div class="hero-actions">
          <a href="https://wa.me/{WA}" data-lien-whatsapp target="_blank" rel="noopener" class="btn btn-whatsapp">{ICON['wa']} {TEL}</a>
          <a href="https://www.instagram.com/{INSTA}/" data-lien-instagram target="_blank" rel="noopener" class="btn">{ICON['insta']} @{INSTA}</a>
        </div>
      </div>
    </section>
'''
    page('index.html', '', corps, 'accueil')

# ------------------------------------------------------------------ BOUTIQUE
def boutique():
    chips = '\n'.join(f'          <a href="boutique.html?categorie={k}" class="chip" data-filtre="{k}">{e(v)}</a>' for k, v in CATEGORIES)
    corps = f'''
    <section class="page-head">
      <div class="container">
        <span class="script">La boutique</span>
        <h1 data-titre-catalogue>Toutes nos créations</h1>
        {ORN}
        <p class="lead">Chaque chapelet est créé à la main, sur commande, selon vos envies.</p>
      </div>
    </section>

    <section class="container catalog">
      <div class="toolbar">
        <div class="chips">
          <a href="boutique.html" class="chip active" data-filtre="tout">Tout</a>
{chips}
        </div>
        <div class="toolbar-right">
          <label class="search-inline">{ICON['search']}<input type="search" placeholder="Rechercher" data-filtre-recherche aria-label="Rechercher"></label>
          <div class="sort"><label>Trier :
            <select data-tri>
              <option value="defaut">Nos suggestions</option>
              <option value="prix-asc">Prix croissant</option>
              <option value="prix-desc">Prix décroissant</option>
              <option value="nom">Nom A → Z</option>
            </select></label>
          </div>
        </div>
      </div>
      <p class="muted" data-nb-resultats>{len(PRODUITS)} créations</p>

      <!-- ===== LISTE DES PRODUITS =====
           Pour ajouter un produit : copiez un bloc <article> … </article>
           et changez le nom, le prix, l'image, la catégorie et le lien. -->
      <div class="grid" data-catalogue>
{chr(10).join(carte(p) for p in PRODUITS)}
      </div>
      <div class="empty" data-aucun-resultat hidden><p>Aucune création ne correspond à votre recherche.</p><a class="btn" href="boutique.html">Voir toute la boutique</a></div>
    </section>
'''
    page('boutique.html', 'Boutique', corps, 'boutique')

# ------------------------------------------------------------------ FICHES PRODUITS
def champ_option(i, opt):
    label, typ, requis, choix = opt
    req = ' required' if requis else ''
    etoile = ' *' if requis else ' <span class="muted">(facultatif)</span>'
    if typ == 'select':
        opts = ''.join(f'<option>{e(c)}</option>' for c in choix)
        ctrl = f'<select data-option="{e(label)}"{req}><option value="">— Choisir —</option>{opts}</select>'
    elif typ == 'textarea':
        ctrl = f'<textarea data-option="{e(label)}" rows="4"{req} placeholder="Couleurs, prénom, date de la célébration, nombre de pièces…"></textarea>'
    else:
        ctrl = f'<input data-option="{e(label)}"{req}>'
    return f'<label>{e(label)}{etoile}{ctrl}</label>'

def fiche(p):
    devis = p['prix'] is None
    champs = [champ_option(i, o) for i, o in enumerate(p['options'])]
    # regroupe les petits champs "select" deux par deux
    lignes, tampon = [], []
    for o, c in zip(p['options'], champs):
        if o[1] == 'select':
            tampon.append(c)
            if len(tampon) == 2: lignes.append(f'<div class="row2">{"".join(tampon)}</div>'); tampon = []
        else:
            if tampon: lignes.append(f'<div class="row2">{"".join(tampon)}</div>'); tampon = []
            lignes.append(c)
    if tampon: lignes.append(f'<div class="row2">{"".join(tampon)}</div>')
    champs_html = '\n            '.join(lignes)
    prix_attr = '' if devis else f"{p['prix']:.2f}"
    bouton = (f'<button class="btn-ajouter btn btn-wide" data-item-id="{p["slug"]}" data-item-name="{e(p["nom"])}" '
              f'data-item-price="{prix_attr}" data-item-image="{p["image"]}" data-item-url="{p["page"]}" '
              f'data-options-depuis="#perso" data-qte-depuis="#qte">{"Ajouter à ma demande" if devis else "Ajouter au panier"}</button>')
    autres = [x for x in PRODUITS if x['cat'] == p['cat'] and x is not p] + [x for x in PRODUITS if x['cat'] != p['cat']]
    paras = '\n              '.join(f'<p>{e(t)}</p>' for t in p['desc'])
    vignettes = ''
    if len(p['galerie']) > 1:
        vignettes = '<div class="thumbs" data-vignettes>' + ''.join(
            f'<button type="button" class="thumb{" active" if i == 0 else ""}" data-photo="{g}" aria-label="Photo {i + 1}"><img src="{g}" alt="" loading="lazy"></button>'
            for i, g in enumerate(p['galerie'])) + '</div>'
    liste_livraisons = '\n                '.join(f'<li>{e(texte_livraison(l))}</li>' for l in LIVRAISONS)
    prix_html = '<p class="product-price">Sur devis <small>· prix confirmé par message</small></p>' if devis else f'<p class="product-price">{prix(p["prix"])}</p>'
    corps = f'''
    <section class="container">
      <nav class="crumbs"><a href="index.html">Accueil</a> / <a href="boutique.html">Boutique</a> / <a href="boutique.html?categorie={p['cat']}">{e(CAT[p['cat']])}</a> / <span>{e(p['nom'])}</span></nav>
      <div class="product">
        <div class="product-media">
          <div class="product-img"><img src="{p['image']}" alt="{e(p['nom'])}" data-photo-principale></div>
          {vignettes}
        </div>
        <div class="product-info">
          <p class="eyebrow">{e(CAT[p['cat']])}</p>
          <h1>{e(p['nom'])}</h1>
          {prix_html}
          <p class="lead">{e(p['accroche'])}</p>
          <p class="stock">{'Disponible sur commande' if p['cat'] == 'maillons-fils' else 'Créé à la main sur commande · délai ' + DELAI}</p>

          <!-- Choix de personnalisation (envoyés avec la commande) -->
          <div class="perso" id="perso">
            <h3>{'Votre demande' if devis else 'Personnalisez votre chapelet'}</h3>
            {champs_html}
          </div>

          <div class="add-form">
            <div class="qty" data-qty>
              <button type="button" data-step="-1" aria-label="Diminuer">−</button>
              <input type="number" id="qte" value="1" min="1" max="99" aria-label="Quantité">
              <button type="button" data-step="1" aria-label="Augmenter">+</button>
            </div>
            {bouton}
          </div>
          <p class="small muted">Une question avant de commander ? <a href="https://wa.me/{WA}" data-lien-whatsapp target="_blank" rel="noopener" class="link">Écrivez-moi sur WhatsApp</a></p>

          <div class="details">
            <details open><summary>Description</summary><div>
              {paras}
            </div></details>
            <details><summary>Composition</summary><div><p>{e(p['compo'] or 'Selon votre demande')}</p><p class="small">Selon les matériaux disponibles au moment de la création.</p></div></details>
            <details><summary>Délais &amp; livraison</summary><div>
              <ul>
                <li>Délai de création : {DELAI} selon la demande</li>
                {liste_livraisons}
              </ul>
              <p><a href="livraison.html">En savoir plus</a></p>
            </div></details>
          </div>
        </div>
      </div>
    </section>

    <section class="section container">
      <div class="section-head"><span class="script">Vous aimerez aussi</span>{ORN}</div>
      <div class="grid">
{chr(10).join(carte(x) for x in autres[:3])}
      </div>
    </section>
'''
    # Aperçu dessiné du chapelet si le produit propose une « couleur des perles »
    apercu = any('perle' in o[0].lower() for o in p['options'])
    page(p['page'], p['nom'], corps, 'boutique', p['accroche'],
         extra_scripts='\n  <script src="assets/js/apercu.js"></script>' if apercu else '')

# ------------------------------------------------------------------ PANIER
# ---------------------------------------------------------------- MOYENS DE PAIEMENT
def _lien_valide(x):
    return str(x or '').strip().startswith('http')

def modes_paiement():
    """Lit Réglages → « Moyens de paiement proposés sur le site ».
    Un choix laissé vide garde le fonctionnement d'avant (proposé)."""
    pm = REG.get('paiements') or {}
    ancienne_carte = REG.get('carte') or {}
    lien = str(ancienne_carte.get('lien') or '').strip()
    vir = (pm.get('virement') or 'oui').strip()
    rem = (pm.get('remise') or 'oui').strip()
    carte = (pm.get('carte') or '').strip()
    if not carte:
        carte = 'bouton' if (ancienne_carte.get('actif') and _lien_valide(lien)) else 'whatsapp'
    if carte == 'bouton' and not _lien_valide(lien):
        print('⚠️  Paiement par carte : « bouton automatique » choisi mais le lien ne commence pas par https:// '
              '→ remplacé par « j\'envoie un lien par WhatsApp ».')
        carte = 'whatsapp'
    return dict(virement=vir == 'oui', remise=rem == 'oui', carte=carte, lien=lien if carte == 'bouton' else '')

MODES = modes_paiement()

def html_paiements():
    m = MODES
    blocs, premier = [], [True]
    def coche():
        if premier[0]:
            premier[0] = False
            return ' checked'
        return ''
    if m['virement']:
        blocs.append(f'''              <label class="option"><input type="radio" name="paiement" value="virement"{coche()}>
                <span class="option-body"><strong>Virement bancaire</strong><small>Coordonnées communiquées après confirmation de la commande</small></span></label>''')
    if m['carte'] in ('whatsapp', 'bouton'):
        desc = 'Paiement sécurisé en ligne après envoi de la commande' if m['carte'] == 'bouton' else 'Je vous envoie un lien de paiement sécurisé'
        blocs.append(f'''              <label class="option"><input type="radio" name="paiement" value="carte"{coche()}>
                <span class="option-body"><strong>Carte bancaire</strong><small>{desc}</small></span>
                <span class="option-price">{ICON['lock']}</span></label>''')
    elif m['carte'] == 'bientot':
        blocs.append(f'''              <label class="option disabled" aria-disabled="true"><input type="radio" name="paiement" value="carte" disabled>
                <span class="option-body"><strong>Carte bancaire</strong><small>Bientôt disponible</small></span>
                <span class="option-price">{ICON['lock']}</span></label>''')
    if m['remise']:
        blocs.append('''              <label class="option" data-paiement-retrait><input type="radio" name="paiement" value="retrait">
                <span class="option-body"><strong>Paiement à la remise</strong><small>Espèces ou carte, lors de la remise en main propre</small></span></label>''')
    # Toujours un choix possible, même si tout est masqué ou si seule la remise est proposée
    autres = m['virement'] or m['carte'] in ('whatsapp', 'bouton')
    blocs.append(f'''              <label class="option" data-paiement-convenir{'' if not autres else ' hidden'}><input type="radio" name="paiement" value="aconvenir"{coche() if not autres else ''}>
                <span class="option-body"><strong>À convenir ensemble</strong><small>Je vous indique comment régler après confirmation de la commande</small></span></label>''')
    return '\n'.join(blocs)

def texte_cgv_paiement():
    m = MODES
    moyens = []
    if m['virement']: moyens.append('par virement bancaire')
    if m['carte'] in ('whatsapp', 'bouton'): moyens.append('par carte bancaire via un lien de paiement sécurisé')
    if m['remise']: moyens.append('lors de la remise en main propre')
    if not moyens:
        return "Les modalités de paiement sont communiquées au client lors de la confirmation de sa commande."
    phrase = moyens[0] if len(moyens) == 1 else ', '.join(moyens[:-1]) + ' ou ' + moyens[-1]
    return "Le paiement s'effectue " + phrase + "."

def panier():
    corps = f'''
    <section class="page-head"><div class="container"><span class="script">Votre panier</span><h1>Finaliser ma commande</h1>{ORN}</div></section>

    <section class="container" data-panier>

      <div class="empty" data-panier-vide hidden>
        <p>Votre panier est vide pour le moment.</p>
        <a class="btn" href="boutique.html">Découvrir les chapelets</a>
      </div>

      <div class="narrow" data-confirmation hidden></div>

      <form id="form-commande" class="checkout" data-panier-plein hidden novalidate>
        <div class="checkout-main">
          <fieldset>
            <legend>Vos créations</legend>
            <div data-lignes></div>
            <p style="margin:14px 0 6px"><a href="boutique.html" class="link">← Continuer mes achats</a></p>
          </fieldset>

          <fieldset>
            <legend>Vos coordonnées</legend>
            <div class="row2">
              <label>Nom complet *<input name="nom" required autocomplete="name"></label>
              <label>Téléphone *<input name="telephone" required autocomplete="tel" placeholder="0690 00 00 00" pattern="[0-9\\s\\.\\+\\-\\(\\)]{{9,}}"></label>
            </div>
            <div class="row2">
              <label>E-mail <span class="muted">(facultatif)</span><input type="email" name="email" autocomplete="email"></label>
              <label>Date de la célébration <span class="muted">(facultatif)</span><input type="date" name="date"></label>
            </div>
          </fieldset>

          <fieldset>
            <legend>Livraison</legend>
            <div class="options" data-livraisons></div>
          </fieldset>

          <fieldset data-adresse>
            <legend>Adresse de livraison</legend>
            <label>Adresse *<input name="adresse" data-requis autocomplete="street-address"></label>
            <div class="row3">
              <label>Code postal *<input name="cp" data-requis autocomplete="postal-code"></label>
              <label>Ville *<input name="ville" data-requis autocomplete="address-level2"></label>
              <label>Territoire<input name="territoire" value="Guadeloupe" autocomplete="country-name"></label>
            </div>
          </fieldset>

          <fieldset>
            <legend>Paiement souhaité</legend>
            <div class="options">
{html_paiements()}
            </div>
          </fieldset>

          <fieldset>
            <legend>Un mot pour moi ? <span class="muted">(facultatif)</span></legend>
            <textarea name="message" rows="3" placeholder="Intention, message cadeau, précisions…"></textarea>
          </fieldset>
          <label class="check"><input type="checkbox" name="cgv" required> J'accepte les&nbsp;<a href="cgv.html" target="_blank">conditions générales de vente</a>&nbsp;*</label>
        </div>

        <aside class="summary">
          <h3>Récapitulatif</h3>
          <div class="sum-row"><span>Sous-total</span><strong data-sous-total>—</strong></div>
          <div class="sum-row"><span>Livraison</span><strong data-livraison>—</strong></div>
          <div class="sum-row total"><span>Total</span><strong data-total>—</strong></div>
          <p class="hint" data-devis hidden>Votre panier contient des articles <strong>sur devis</strong> : leur prix vous sera confirmé par message.</p>
          <p class="hint" data-conseil hidden></p>
          <div class="send-buttons">
            <button type="button" class="btn btn-wide btn-whatsapp" data-envoi-whatsapp>{ICON['wa']} Commander par WhatsApp</button>
            <button type="button" class="btn btn-wide btn-ghost" data-envoi-email>Commander par e-mail</button>
          </div>
          <p class="note-statique">Votre commande m'est envoyée en un clic, avec tous vos choix de personnalisation. Je vous confirme la création et le paiement très rapidement.</p>
        </aside>
      </form>
    </section>
'''
    page('panier.html', 'Panier', corps)

# ------------------------------------------------------------------ CÉLÉBRATIONS
def celebrations():
    blocs = '\n'.join(f'''      <article class="occasion-detail" id="{o[0]}">
        <span class="occasion-icon">{occ_icon(o[0], 42)}</span>
        <div>
          <h2>{e(o[1])}</h2>
          <span class="caps">{e(o[2])}</span>
          <p>{e(o[3])}</p>
          <a href="chapelet-personnalise.html" class="link">Créer un chapelet pour cette occasion →</a>
        </div>
      </article>''' for o in OCCASIONS)
    page('celebrations.html', 'Célébrations', f'''
    <section class="page-head"><div class="container"><span class="script">Toutes vos grandes célébrations</span><h1>sont les bienvenues</h1>{ORN}
      <p class="lead">Un chapelet, une prière, une lumière pour chaque étape de la vie…</p></div></section>
    <section class="container narrow" style="padding-bottom:70px">
{blocs}
      <div class="center" style="margin-top:34px"><a href="creation-sur-mesure.html" class="btn">Me parler de votre projet</a></div>
    </section>
''', 'celebrations', 'Chapelets pour baptême, communion, confirmation, mariage, ordination, pèlerinage et intentions de prière.')

# ------------------------------------------------------------------ CRÉATRICE
def creatrice():
    page('creatrice.html', 'La créatrice', f'''
    <section class="page-head"><div class="container"><span class="script">La créatrice</span><h1>Un chapelet, une prière, une lumière</h1>{ORN}</div></section>
    <section class="container story" style="padding-bottom:70px">
      <div class="story-img"><img src="{img(TXT.get('creatrice_photo'), 'images/creatrice.jpg')}" alt="La créatrice de {e(NOM)}" loading="lazy"></div>
      <div class="story-text prose">
        {''.join(f'<p>{e(t)}</p>' for t in paragraphes(TXT.get('creatrice_page')))}
        <h3>Ma façon de travailler</h3>
        <ul>
          <li>Des chapelets <strong>entièrement faits main</strong>, sur commande</li>
          <li>Des matériaux choisis avec soin : perles, croix, médailles, maillons et fil marin</li>
          <li>Une création <strong>unique</strong>, selon vos envies : couleurs, médaille, prénom…</li>
          <li>Un échange personnalisé, par WhatsApp ou Instagram, du choix jusqu'à la remise</li>
        </ul>
        <p><span class="script" style="font-size:2rem">Chaque chapelet est unique, créé avec amour et selon vos envies.</span></p>
        <a href="boutique.html" class="btn">Découvrir mes créations</a>
      </div>
    </section>
''', 'creatrice')

# ------------------------------------------------------------------ CONTACT
def contact():
    page('contact.html', 'Contact', f'''
    <section class="page-head"><div class="container"><span class="script">Contact</span><h1>Pour toutes demandes ou personnalisations</h1>{ORN}</div></section>
    <section class="container contact-grid">
      <div class="prose">
        <p>Une question sur un chapelet, une création sur mesure ou une commande de maillons et de fils ? Écrivez-moi, je vous réponds avec plaisir.</p>
        <p><strong>WhatsApp</strong><br><a href="https://wa.me/{WA}" data-lien-whatsapp target="_blank" rel="noopener">{TEL}</a></p>
        <p><strong>Instagram</strong><br><a href="https://www.instagram.com/{INSTA}/" data-lien-instagram target="_blank" rel="noopener">@{INSTA}</a></p>
        <p><strong>Localisation</strong><br>Nous sommes situés en {LIEU}</p>
        <div class="hero-actions" style="justify-content:flex-start">
          <a href="https://wa.me/{WA}" data-lien-whatsapp target="_blank" rel="noopener" class="btn btn-whatsapp">{ICON['wa']} WhatsApp</a>
          <a href="https://www.instagram.com/{INSTA}/" data-lien-instagram target="_blank" rel="noopener" class="btn btn-ghost">{ICON['insta']} Instagram</a>
        </div>
      </div>
      <div>
        <div class="flash flash-success" data-contact-ok hidden>Merci ! Pensez à appuyer sur « Envoyer » dans WhatsApp ou votre messagerie.</div>
        <form id="form-contact" class="card-form" novalidate>
          <div class="row2">
            <label>Nom *<input name="nom" required></label>
            <label>E-mail <span class="muted">(facultatif)</span><input type="email" name="email"></label>
          </div>
          <label>Sujet<input name="sujet" placeholder="Ex. : chapelet de baptême"></label>
          <label>Message *<textarea name="message" rows="6" required></textarea></label>
          <div class="hero-actions" style="margin-top:6px;justify-content:flex-start">
            <button type="button" class="btn btn-whatsapp" data-contact-whatsapp>{ICON['wa']} Envoyer par WhatsApp</button>
            <button class="btn btn-ghost">Envoyer par e-mail</button>
          </div>
        </form>
      </div>
    </section>
''', 'contact')

# ------------------------------------------------------------------ PAGES LÉGALES
def simple(fichier, titre, surtitre, contenu):
    page(fichier, titre, f'''
    <section class="page-head"><div class="container"><span class="script">{e(surtitre)}</span><h1>{e(titre)}</h1>{ORN}</div></section>
    <section class="container narrow prose">
{contenu}
    </section>
''')

def legales():
    simple('livraison.html', 'Délais & livraison', 'Informations', f'''      <h3>Délai de création</h3>
      <p>Chaque chapelet est créé à la main, sur commande. Comptez <strong>{DELAI}</strong> selon la demande et les matériaux. Pour une célébration, pensez à commander à l'avance et indiquez-moi la date.</p>
      <h3>Modes de livraison</h3>
      <ul>
{chr(10).join('        <li>' + texte_livraison(l, True) + '</li>' for l in LIVRAISONS)}
      </ul>
      <p>Chaque création est emballée avec soin.</p>
      <h3>Retours</h3>
      <p>Les chapelets <strong>personnalisés</strong> (couleurs, médaille, prénom…) sont réalisés spécialement pour vous et ne peuvent pas être repris, conformément à l'article L221-28 du Code de la consommation. En cas de souci à la réception, <a href="contact.html">contactez-moi</a> : nous trouverons une solution ensemble.</p>''')
    simple('cgv.html', 'Conditions générales de vente', 'Informations', f'''      <p class="muted"><em>Modèle à faire relire et compléter par un professionnel avant mise en ligne.</em></p>
      <h3>1. Objet</h3><p>Les présentes conditions régissent les ventes de chapelets et fournitures réalisées par {e(NOM)}.</p>
      <h3>2. Prix</h3><p>Les prix sont indiqués en euros, hors frais de livraison. Les articles « sur devis » font l'objet d'un prix confirmé par message avant toute validation.</p>
      <h3>3. Commande</h3><p>La commande est transmise par WhatsApp ou par e-mail. Elle devient ferme après confirmation par {e(NOM)} et réception du paiement.</p>
      <h3>4. Paiement</h3><p>{texte_cgv_paiement()}</p>
      <h3>5. Création et livraison</h3><p>Les créations sont réalisées à la main, sur commande. Voir la page <a href="livraison.html">Délais &amp; livraison</a>.</p>
      <h3>6. Droit de rétractation</h3><p>Le droit de rétractation de 14 jours s'applique aux articles non personnalisés. Il ne s'applique pas aux biens confectionnés selon les spécifications du client ou nettement personnalisés (art. L221-28 du Code de la consommation).</p>
      <h3>7. Données personnelles</h3><p>Vos données sont uniquement utilisées pour le traitement de vos commandes et ne sont jamais revendues.</p>''')
    simple('mentions-legales.html', 'Mentions légales', 'Informations', f'''      <p class="muted"><em>À compléter avec vos informations légales.</em></p>
      <p><strong>Éditrice :</strong> {e(NOM)} — {e(LEGAL.get('editrice') or '')}<br>{LIEU}<br>WhatsApp : {TEL} · Instagram : @{INSTA}</p>
      <p><strong>Directrice de la publication :</strong> {e(LEGAL.get('directrice') or '')}</p>
      <p><strong>Hébergement :</strong> {e(LEGAL.get('hebergeur') or '')}</p>
      <p><strong>Données personnelles :</strong> ce site ne dépose aucun cookie publicitaire. Le contenu de votre panier est conservé uniquement dans votre navigateur.</p>
      <p><strong>Crédits :</strong> visuels d'illustration générés pour le site, à remplacer par vos propres photos.</p>''')

def realisations():
    if not REALISATIONS: return
    tuiles = '\n'.join(f'''        <figure class="realisation"><img src="{img(r['photo'])}" alt="{e(r.get('legende') or 'Réalisation')}" loading="lazy">{f'<figcaption>{e(r["legende"])}</figcaption>' if r.get('legende') else ''}</figure>''' for r in REALISATIONS)
    page('realisations.html', 'Mes réalisations', f'''
    <section class="page-head"><div class="container"><span class="script">Mes réalisations</span><h1>Chaque chapelet est unique</h1>{ORN}
      <p class="lead">Quelques créations réalisées avec amour pour vos célébrations.</p></div></section>
    <section class="container" style="padding-bottom:70px">
      <div class="galerie">
{tuiles}
      </div>
      <div class="center" style="margin-top:34px"><a href="chapelet-personnalise.html" class="btn">Créer mon chapelet</a></div>
    </section>
''', 'realisations', 'Galerie des chapelets réalisés par La Main de Lumière.')

def ecrire_reglages_js():
    carte = REG.get('carte') or {}
    vir = REG.get('virement') or {}
    exp = REG.get('expediteur') or {}
    expediteur = dict(nom=exp.get('nom') or NOM, adresse=exp.get('adresse') or '', cp=exp.get('cp') or '',
                      ville=exp.get('ville') or '', territoire=exp.get('territoire') or LIEU,
                      telephone=exp.get('telephone') or TEL, slogan=METIER)
    config = dict(nom=NOM, whatsapp=WA, email=EMAIL, instagram=INSTA, telephone=TEL, expediteur=expediteur, livraisons=LIVRAISONS,
                  virement=dict(titulaire=vir.get('titulaire') or NOM, iban=vir.get('iban') or '', bic=vir.get('bic') or ''),
                  carte=dict(actif=MODES['carte'] == 'bouton', lien=MODES['lien']),
                  paiements=dict(virement=MODES['virement'], carte=MODES['carte'], remise=MODES['remise']))
    os.makedirs(os.path.join(OUT, 'assets', 'js'), exist_ok=True)
    with open(os.path.join(OUT, 'assets', 'js', 'reglages.js'), 'w', encoding='utf-8') as f:
        f.write('/* Fichier fabriqué automatiquement à partir de contenu/reglages.json — ne pas modifier ici :\n'
                '   utilisez l\'espace admin (« Réglages de la boutique »). */\n'
                'var BOUTIQUE = ' + json.dumps(config, ensure_ascii=False, indent=2) + ';\n')

def commande():
    """Page « Bon de livraison & étiquette » (ouverte depuis le lien de chaque commande)."""
    page('commande.html', 'Bon de livraison', f'''
    <section class="container commande-outil">
      <div class="no-print">
        <div class="section-head" style="margin-top:34px"><span class="script">Récapitulatif de commande</span><h1>Bon de livraison &amp; étiquette</h1>{ORN}</div>

        <!-- Si la page est ouverte sans commande -->
        <div class="card-form narrow" data-chargement>
          <p><strong>Collez ici le message de commande</strong> reçu par WhatsApp ou par e-mail (ou seulement le lien « Récapitulatif imprimable ») :</p>
          <textarea id="coller" rows="6" placeholder="Bonjour La Main de Lumière ! Je souhaite passer commande : …"></textarea>
          <p class="flash flash-error" data-erreur hidden>Je ne trouve pas de lien « Récapitulatif imprimable » dans ce texte. Les commandes passées avant cette nouveauté n'en ont pas : utilisez « Bon vierge » et complétez-le à la main.</p>
          <div class="hero-actions" style="justify-content:flex-start">
            <button type="button" class="btn" data-charger>Afficher la commande</button>
            <button type="button" class="btn btn-ghost" data-vierge>Bon vierge (à remplir)</button>
          </div>
        </div>
      </div>

      <div data-documents hidden>
        <div class="doc-barre no-print">
          <div class="doc-actions">
            <button type="button" class="btn" data-imprimer-bon>🖨️ Imprimer le bon de livraison</button>
            <button type="button" class="btn btn-ghost" data-imprimer-etiquette>🏷️ Imprimer l'étiquette</button>
            <button type="button" class="link" data-autre-commande>Autre commande</button>
          </div>
          <div class="doc-options">
            <label class="check"><input type="checkbox" id="opt-prix" checked> Afficher les prix sur le bon</label>
            <label class="check"><input type="checkbox" id="opt-fragile" checked> Mention « Fragile » sur l'étiquette</label>
            <label>Format de l'étiquette :
              <select id="opt-format">
                <option value="a4">Feuille A4 (imprimante normale, à découper)</option>
                <option value="thermique">Imprimante d'étiquettes 10 × 15 cm</option>
              </select></label>
          </div>
          <p class="small muted">✏️ Vous pouvez cliquer sur n'importe quel texte du bon ou de l'étiquette pour le corriger avant d'imprimer.</p>
        </div>

        <h2 class="doc-legende no-print">Bon de livraison</h2>
        <article class="doc-feuille" data-bon></article>

        <h2 class="doc-legende no-print">Étiquette d'envoi <small>(10 × 15 cm)</small></h2>
        <div class="et-cadre"><article class="etiquette" data-etiquette></article></div>
      </div>
    </section>
''', '', 'Bon de livraison et étiquette d\'envoi', '\n  <meta name="robots" content="noindex, nofollow">', '\n  <script src="assets/js/commande.js"></script>')

def page404():
    page('404.html', 'Page introuvable', f'''
    <section class="container narrow center" style="padding:80px 0">
      <span class="script" style="font-size:3rem">Oups…</span>
      <h1>Cette page est introuvable</h1>
      <p>La page demandée n'existe pas ou plus.</p>
      <a href="boutique.html" class="btn">Retour à la boutique</a>
    </section>
''')

if __name__ == '__main__':
    for f in glob.glob(os.path.join(OUT, '*.html')): os.remove(f)
    ecrire_reglages_js()
    accueil(); boutique(); panier(); celebrations(); creatrice(); contact(); legales(); realisations(); commande(); page404()
    for p in PRODUITS: fiche(p)
    print('Pages générées :', sorted(os.path.basename(f) for f in glob.glob(os.path.join(OUT, '*.html'))))
