# La Main de Lumière — site 100 % HTML

👉 **Pour modifier le site (prix, photos, produits, textes, livraison, IBAN…), utilisez l'espace admin.**
Le mode d'emploi complet est dans le fichier **`README.md`**, à la racine du dossier `la-main-de-lumiere`.

⚠️ Les pages `.html` et le fichier `assets/js/reglages.js` sont **fabriqués automatiquement** à partir du dossier `contenu/`.
Si vous les modifiez à la main, vos changements seront **effacés** à la prochaine modification faite dans l'espace admin.

## Contenu de ce dossier
| Élément | Rôle |
|---|---|
| `index.html`, `boutique.html`, fiches produits… | Pages du site (générées) |
| `assets/css/style.css` | Couleurs, polices et mise en page (ivoire et or) |
| `assets/js/reglages.js` | WhatsApp, e-mail, livraisons, IBAN, carte (généré depuis `contenu/reglages.json`) |
| `assets/js/main.js` | Panier et envoi des commandes par WhatsApp / e-mail |
| `images/` | Photos (gérées depuis l'onglet « Media » de l'espace admin) |

## Déroulement d'une commande
1. Le client choisit ses options (couleur, médaille, finition…) et ajoute au panier.
2. Il remplit ses coordonnées, la livraison et le paiement souhaité.
3. Il clique sur **Commander par WhatsApp** (ou e-mail) : un message tout prêt vous est envoyé, avec le numéro de commande, toutes les options, le total et la date de la célébration.
4. Vous confirmez avec lui et lui envoyez le RIB ou un lien de paiement par carte.
