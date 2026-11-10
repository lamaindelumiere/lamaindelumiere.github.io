# La Main de Lumière — votre espace admin

Ce guide explique comment **modifier vous-même votre site** (prix, photos, produits, textes, réglages) depuis un ordinateur **ou votre téléphone**, sans toucher au code.

**Comment ça marche :**

```
 Vous (espace admin Pages CMS)  →  GitHub (stocke vos fichiers)  →  votre site en ligne
   « Je change un prix »              enregistre la modification        mis à jour en ~1 minute
```

Tout est **gratuit** : GitHub (stockage + hébergement du site) et Pages CMS (l'espace admin).

---

## PARTIE 1 — Mise en place (une seule fois, sur ordinateur, ~15 minutes)

### Étape 1 · Créer le « dépôt » GitHub (le dossier en ligne de votre site)

1. Décompressez le fichier **`la-main-de-lumiere-depot.zip`** sur votre ordinateur. Vous obtenez un dossier `la-main-de-lumiere`.
2. Connectez-vous sur **https://github.com**.
3. En haut à droite, cliquez sur **＋** puis **New repository**.
4. Remplissez :
   - **Repository name** : `la-main-de-lumiere`
   - Cochez **Public** (obligatoire pour l'hébergement gratuit, et votre site est public de toute façon)
   - Ne cochez **rien d'autre** (pas de README, pas de .gitignore)
5. Cliquez sur **Create repository**.

### Étape 2 · Envoyer les fichiers du site

1. Sur la page qui s'affiche, cliquez sur le lien **« uploading an existing file »**.
2. Ouvrez le dossier `la-main-de-lumiere` sur votre ordinateur, **sélectionnez tout son contenu** (Ctrl + A sur Windows, Cmd + A sur Mac) et **glissez-le** dans la page GitHub.
3. Attendez la fin du chargement, puis cliquez en bas sur le bouton vert **Commit changes**.
4. **Vérification importante** : dans la liste des fichiers du dépôt, vous devez voir **`.github`** et **`.pages.yml`** (ils commencent par un point).
   - 🍏 Sur **Mac**, ces fichiers sont cachés. Dans le dossier, appuyez sur **Cmd + Maj + .** (point) pour les faire apparaître, puis glissez-les aussi.
   - S'ils manquent encore, voir l'annexe A en bas de ce guide.

### Étape 3 · Activer la mise en ligne

1. Dans votre dépôt, cliquez sur **Settings** (⚙️, en haut).
2. Dans le menu de gauche, cliquez sur **Pages**.
3. Sous **Build and deployment → Source**, choisissez **GitHub Actions**.
4. Cliquez sur l'onglet **Actions** (en haut), puis sur **Publier le site** à gauche, puis sur **Run workflow** → **Run workflow**.
5. Après environ 1 minute, une coche verte ✅ apparaît. **Votre site est en ligne** à l'adresse :

   **`https://VOTRE-PSEUDO.github.io/la-main-de-lumiere/`**

   (remplacez VOTRE-PSEUDO par votre nom d'utilisateur GitHub ; l'adresse exacte est aussi affichée dans *Settings → Pages*).

> 💡 Plus tard, vous pourrez utiliser votre propre nom de domaine (ex. `lamaindelumiere.fr`) dans *Settings → Pages → Custom domain*.

### Étape 4 · Brancher l'espace admin

1. Allez sur **https://app.pagescms.org**.
2. Cliquez sur **Sign in with GitHub** et acceptez.
3. Pages CMS vous demande d'installer son application GitHub : choisissez **Only select repositories** → **la-main-de-lumiere** → **Install**.
4. Ouvrez le dépôt **la-main-de-lumiere** : votre espace admin s'affiche ! 🎉

📱 **Sur téléphone** : ouvrez https://app.pagescms.org dans votre navigateur, connectez-vous, puis « Ajouter à l'écran d'accueil » pour l'avoir comme une application.

---

## PARTIE 2 — Utilisation au quotidien

Dans l'espace admin, le menu contient :

| Menu | Ce que vous pouvez y faire |
|---|---|
| 🛍️ **Produits** | Changer un prix, une photo, un texte · ajouter / masquer / supprimer un produit · modifier les choix proposés (couleurs, médailles…) |
| 🖼️ **Accueil & page « La créatrice »** | Grande photo d'accueil, citations, votre photo, votre histoire |
| 📷 **Mes réalisations** | Ajouter des photos de vos créations (la page « Réalisations » apparaît dans le menu du site dès la 1ʳᵉ photo) |
| ⚙️ **Réglages de la boutique** | WhatsApp, e-mail, Instagram, délai, **modes et prix de livraison**, **moyens de paiement proposés**, **IBAN / BIC**, adresse d'expéditeur, mentions légales |
| **Media** | Toutes vos photos (envoyer, supprimer) |

**Après chaque modification, cliquez sur `Save` (Enregistrer).** Le site en ligne est mis à jour **1 à 2 minutes** plus tard (actualisez la page du site).

### ✏️ Changer un prix
Produits → cliquez sur le produit → **Prix en euros** → tapez le nouveau prix (ex. `12` ou `12.5`) → **Save**.
👉 Laissez le prix **vide** pour afficher « Sur devis ».

### 📸 Remplacer une photo
Produits → le produit → **Photo principale** → cliquez sur la photo → **Upload** (envoyer) → choisissez votre photo → sélectionnez-la → **Save**.
Les photos de téléphone sont automatiquement **réduites et remises droites** à la mise en ligne : pas besoin de les retoucher.

### 🖼️ Ajouter plusieurs photos à un produit
Produits → le produit → **Photos supplémentaires** → ajoutez jusqu'à 8 photos → **Save**. Elles s'affichent en vignettes sous la photo principale.

### ➕ Ajouter un nouveau produit
Produits → bouton **Add an entry** (ajouter) → remplissez au minimum : **nom, prix, catégorie, photo, phrase courte** → **Save**.
Pour proposer des choix au client (couleur, médaille…), utilisez **Choix proposés au client** → *Add an entry* :
- *Intitulé* : ex. `Couleur des perles`
- *Type* : **Liste de choix** (menu déroulant) ou **Texte** (le client écrit)
- *Choix possibles* : ajoutez une ligne par choix (`Blanc nacré`, `Rose poudré`…)
- *Obligatoire* : cochez si le client doit choisir avant de commander

### 🙈 Cacher un produit temporairement
Produits → le produit → cochez **Masquer ce produit** → **Save**. Décochez pour le remettre.
(Préférez « masquer » à « supprimer » : vous gardez les photos et textes.)

### 🔢 Changer l'ordre des produits
Champ **Ordre d'affichage** : 10, 20, 30… Le plus petit apparaît en premier. Les 3 premiers chapelets sont mis en avant sur l'accueil.

### 🚚 Modifier la livraison, l'e-mail, l'IBAN
⚙️ Réglages de la boutique → modifiez → **Save**. Les prix de livraison sont mis à jour partout (panier, fiches produits, page Livraison).

---

## ✨ Aperçu du chapelet personnalisé

Sur les fiches des chapelets, le client peut cliquer sur **« ✨ Aperçu de mes choix »** (l'aperçu s'ouvre aussi tout seul dès qu'il fait un choix). Le site assemble en direct une **photo de chapelet** posée sur un **décor photo** :

- **couleur des perles** : les perles de la photo sont recolorées. Les couleurs sont reconnues par leur nom (blanc nacré, ivoire, cristal, rose poudré, bleu ciel, doré, multicolore, vert d'eau, lavande, noir…) ;
- **finition** : croix, maillons et médaille en doré ou en argenté ;
- **occasion** : un décor différent (baptême, communion, confirmation, mariage, ordination, intentions de prière, pèlerinage, fête, cadeau).

La médaille et la croix de l'aperçu sont des exemples ; le choix de médaille du client est rappelé sous l'image.

Vous pouvez ajouter des couleurs dans vos listes de choix depuis l'espace admin : si le nom contient une couleur connue (« rose », « bleu », « vert »…), l'aperçu la reconnaît. Une couleur inconnue (ou « Autre ») s'affiche en perles nacrées, avec la mention « couleur à préciser ».

Un aperçu apparaît sur tout produit qui a un choix dont le nom contient « perle ». Les images se trouvent dans `site-html/assets/chapelet/` (le chapelet) et `site-html/assets/scenes/` (les décors).

---

## 💳 Choisir les moyens de paiement proposés

Espace admin → ⚙️ Réglages de la boutique → **💳 Moyens de paiement proposés sur le site** :

| Moyen | Choix possibles |
|---|---|
| Virement bancaire | ✅ Proposé · ⛔ Masqué |
| Carte bancaire | ✅ j'envoie moi-même un lien de paiement (WhatsApp) · ✅ bouton « Payer par carte » automatique · ⏳ affiché grisé « Bientôt disponible » · ⛔ Masqué |
| Paiement à la remise | ✅ Proposé (seulement si le client choisit la remise en main propre) · ⛔ Masqué |

Cliquez sur **Save** : le site est à jour environ 1 minute plus tard. Les conditions générales de vente s'adaptent toutes seules.

- Si vous masquez tout, le client voit « À convenir ensemble » et vous lui indiquez comment payer.
- Le « bouton automatique » ne fonctionne qu'avec un lien commençant par `https://`, à mettre dans **Lien du bouton « Payer par carte »**. Sans lien valable, le site revient à « j'envoie moi-même un lien ».

---

## 📦 Bon de livraison & étiquette d'envoi

Chaque commande reçue (WhatsApp ou e-mail) se termine par un lien **« 📄 Récapitulatif imprimable »**.

1. **Cliquez sur ce lien** (sur ordinateur, c'est plus pratique pour imprimer).
2. La page affiche le **bon de livraison** (format A4) et l'**étiquette d'envoi** (10 × 15 cm), déjà remplis avec la commande.
3. Choisissez vos options : prix affichés ou non, mention « Fragile », format de l'étiquette (feuille A4 à découper, ou imprimante d'étiquettes 10 × 15).
4. Cliquez sur **🖨️ Imprimer le bon de livraison** puis sur **🏷️ Imprimer l'étiquette**. Dans la fenêtre d'impression, vous pouvez aussi choisir « Enregistrer au format PDF ».

✏️ Avant d'imprimer, vous pouvez **cliquer sur n'importe quel texte** pour le corriger (adresse, quantité, prix d'un article sur devis…).

**Votre adresse d'expéditeur** : à remplir une fois dans l'espace admin → ⚙️ Réglages de la boutique → *Expéditeur*.

**Commande reçue sans lien ?** Ouvrez `https://lamaindelumiere.github.io/commande.html`, collez le message de la commande, ou choisissez « Bon vierge » pour tout remplir à la main.

> ℹ️ L'étiquette porte les adresses (expéditeur et destinataire). L'affranchissement et le numéro de suivi s'achètent à La Poste (timbre, Lettre suivie ou Colissimo) : collez-les dans la case « Timbre » prévue en haut à droite.

---

## Petit lexique (l'interface Pages CMS est en anglais)

| Anglais | Français |
|---|---|
| Save | Enregistrer |
| Add an entry | Ajouter un élément |
| Delete | Supprimer |
| Upload | Envoyer une photo |
| Media | Photos |
| Collections / Content | Contenu |
| Sign in / Log out | Se connecter / Se déconnecter |

---

## En cas de souci

- **Ma modification n'apparaît pas** : attendez 2 minutes, puis actualisez la page (sur téléphone : tirez la page vers le bas). Votre navigateur garde parfois l'ancienne version en mémoire.
- **Vérifier la publication** : sur github.com, dans votre dépôt, onglet **Actions** : ✅ vert = en ligne ; ❌ rouge = échec. En cas de ❌, l'ancienne version reste en ligne (rien n'est cassé). Annulez la dernière modification ou envoyez-moi une capture d'écran.
- **Erreur de manipulation** : GitHub garde **l'historique de toutes les versions** ; on peut toujours revenir en arrière.

---

## Annexe A — Si `.github` ou `.pages.yml` n'ont pas été envoyés

Dans votre dépôt sur github.com : **Add file → Create new file**.
- Nom du fichier : `.pages.yml` → collez le contenu du fichier `.pages.yml` (ouvrez-le avec le Bloc-notes) → **Commit changes**.
- Recommencez avec le nom `.github/workflows/publier.yml` (tapez les `/`, GitHub crée les dossiers) → collez le contenu du fichier `publier.yml` → **Commit changes**.

## Annexe B — Pour la personne qui s'occupe de la technique

- `contenu/` : les données modifiables (JSON) : `produits/*.json`, `reglages.json`, `textes.json`, `realisations.json`.
- `outils/generer_site.py` : fabrique les pages HTML de `site-html/` à partir de `contenu/` (Python 3, sans dépendance).
- `outils/optimiser_images.py` : réduit et réoriente les photos (Pillow) ; lancé uniquement lors de la publication.
- `.github/workflows/publier.yml` : à chaque modification de la branche `main`, génère le site puis le publie sur GitHub Pages.
- `.pages.yml` : configuration de l'espace admin Pages CMS.
- `site-html/` : le site final 100 % HTML/CSS/JS. Il fonctionne aussi seul (ouvrir `index.html`), ou en le glissant sur Netlify Drop.
- Le nom du fichier d'un produit (ex. `chapelet-classique.json`) donne l'adresse de sa page (`chapelet-classique.html`). Renommer le produit dans l'admin ne change pas l'adresse.
