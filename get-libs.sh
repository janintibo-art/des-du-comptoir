#!/bin/sh
# Télécharge Babylon.js et Cannon.js en local pour un fonctionnement 100 % hors-ligne.
set -e
mkdir -p www/lib
echo "Téléchargement de babylon.js…"
curl -sL https://cdn.babylonjs.com/babylon.js -o www/lib/babylon.js
echo "Téléchargement de cannon.js…"
curl -sL https://cdn.babylonjs.com/cannon.js -o www/lib/cannon.js
echo "Téléchargement de peerjs…"
curl -sL https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js -o www/lib/peerjs.min.js
echo "OK — les jeux n'ont plus besoin d'Internet (sauf le Salon multi-téléphones, qui utilise Internet pour connecter les joueurs)."
