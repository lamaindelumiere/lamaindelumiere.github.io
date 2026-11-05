#!/usr/bin/env python3
"""Allège les photos avant la mise en ligne (utilisé automatiquement par GitHub).

- remet droites les photos de téléphone (orientation EXIF) ;
- réduit les très grandes photos (côté le plus long : 1600 px max) ;
- recompresse les JPEG (qualité 82) — invisible à l'œil, 5 à 10 fois plus léger.

Usage : python outils/optimiser_images.py site-html/images
"""
import os
import sys

from PIL import Image, ImageOps

MAX = 1600
QUALITE = 82
EXTENSIONS = ('.jpg', '.jpeg', '.png', '.webp')


def optimiser(chemin):
    taille_avant = os.path.getsize(chemin)
    with Image.open(chemin) as im:
        im.load()
        exif_orientation = im.getexif().get(0x0112, 1)
        im2 = ImageOps.exif_transpose(im)
        trop_grande = max(im2.size) > MAX
        if trop_grande:
            im2.thumbnail((MAX, MAX), Image.LANCZOS)
        ext = os.path.splitext(chemin)[1].lower()
        if ext in ('.jpg', '.jpeg'):
            if im2.mode not in ('RGB', 'L'):
                im2 = im2.convert('RGB')
            if not trop_grande and exif_orientation == 1 and taille_avant < 450_000:
                return None  # déjà légère et bien orientée
            im2.save(chemin, 'JPEG', quality=QUALITE, optimize=True, progressive=True)
        elif ext == '.webp':
            if not trop_grande and exif_orientation == 1:
                return None
            im2.save(chemin, 'WEBP', quality=QUALITE)
        else:  # PNG
            if not trop_grande and exif_orientation == 1:
                return None
            im2.save(chemin, 'PNG', optimize=True)
    return taille_avant, os.path.getsize(chemin)


def main(dossier):
    total = 0
    for racine, _, fichiers in os.walk(dossier):
        for nom in sorted(fichiers):
            if not nom.lower().endswith(EXTENSIONS):
                continue
            chemin = os.path.join(racine, nom)
            try:
                res = optimiser(chemin)
            except Exception as err:  # une photo abîmée ne doit pas bloquer la publication
                print(f'⚠️  {nom} : ignorée ({err})')
                continue
            if res:
                total += 1
                print(f'✓ {nom} : {res[0] // 1024} Ko → {res[1] // 1024} Ko')
    print(f'{total} photo(s) optimisée(s).')


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'site-html/images')
