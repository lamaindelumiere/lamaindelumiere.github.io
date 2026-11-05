#!/bin/bash
# La Main de Lumière — lancement du site en local (double-clic)
cd "$(dirname "$0")/site-html" || exit 1
if command -v python3 >/dev/null 2>&1 && python3 -c "" >/dev/null 2>&1; then
  echo ""
  echo "  Site disponible sur : http://localhost:8000/"
  echo "  Laissez cette fenêtre ouverte. Fermez-la pour arrêter le site."
  echo ""
  (sleep 1.5; open "http://localhost:8000/") &
  python3 -m http.server 8000
else
  echo "Python n'est pas disponible : ouverture directe du site."
  open index.html
fi
