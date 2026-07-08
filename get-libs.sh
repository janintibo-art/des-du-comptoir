#!/bin/sh
# Télécharge Babylon.js et Cannon.js en local pour un fonctionnement 100 % hors-ligne.
set -e
mkdir -p www/lib
echo "Téléchargement de babylon.js…"
curl -sL https://cdn.babylonjs.com/babylon.js -o www/lib/babylon.js
echo "Téléchargement de cannon.js…"
curl -sL https://cdn.babylonjs.com/cannon.js -o www/lib/cannon.js
echo "OK — les jeux n'ont plus besoin d'Internet."
