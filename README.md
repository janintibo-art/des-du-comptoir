# 🎲 Les Dés du Comptoir — 421 & 10 000

Jeux de dés en 3D (Babylon.js + physique Cannon.js) contre une IA, avec 12 styles
de dés. Jouable dans le navigateur et empaquetable en APK Android.

## Arborescence
```
des-du-comptoir/
├── www/                        # L'application web
│   ├── index.html              #   Menu d'accueil
│   ├── game-421.html           #   Le 421 (charge & décharge)
│   ├── game-10000.html         #   Le 10 000
│   ├── dice-engine.js          #   Moteur partagé (scène, physique, skins)
│   ├── style.css               #   Habillage commun
│   ├── demo-simple.html        #   Mini démo sans physique
│   └── textures/<style>/       #   12 styles : atlas.jpg + face-1..6.png
├── android/                    # Coquille Android (WebView)
│   └── app/src/main/           #   Manifest, MainActivity, icônes
├── .github/workflows/
│   └── build-apk.yml           # CI : compile l'APK à chaque push sur main
└── README.md
```

## Jouer en local
```bash
cd www
python3 -m http.server 8000     # puis ouvrir http://localhost:8000
```

## Obtenir l'APK
La compilation se fait **sur GitHub** (aucun SDK Android à installer) :
1. Poussez le dépôt sur GitHub (voir TERMUX.md pour la marche à suivre depuis Termux).
2. Le workflow **Build APK** se lance automatiquement (onglet *Actions*).
3. Une fois terminé, téléchargez l'artefact **des-du-comptoir-apk** (app-debug.apk).
4. Installez-le sur le téléphone (autoriser les sources inconnues).

Ou depuis Termux avec le CLI GitHub :
```bash
gh run watch                            # suivre la compilation
gh run download -n des-du-comptoir-apk  # récupérer l'APK
```

Note : l'appli charge Babylon.js/Cannon.js depuis leur CDN, une connexion est
donc nécessaire au lancement. Pour un APK 100 % hors-ligne, placez
`babylon.js` et `cannon.js` dans `www/lib/` et pointez les balises `<script>`
des pages HTML dessus.

## Règles
**421** — 21 fiches au pot. Charge : le perdant du tour ramasse la valeur de la
combinaison du gagnant. Pot vide → décharge : le gagnant refile ses fiches.
Premier à zéro gagne. 421 (8 f.) > 111 (7) > paire d'as/brelan (n) > suites (2)
> simples (1) ; nénette 2-2-1 = 4 f. Égalité → rampeau.

**10 000** — 5 dés. 1 = 100, 5 = 50, brelan de n = n×100 (as = 1000, doublé par
dé supplémentaire), suite = 1500. Mettez de côté au moins un dé qui marque puis
relancez ou banquez ; aucun dé qui marque = tour perdu. Ouverture à 500.
Premier à 10 000 gagne.

## Ajouter un jeu
```js
const T = DiceTable({diceCount: 5});   // scène + physique prêtes
T.buildSkinSelect(mySelect);
await T.throwDice(T.dice);             // lance, attend l'arrêt, lit les faces
T.dice.map(d => d.value);              // valeurs 1..6
T.onPick(d => {...}); T.setHalo(d, '#e0a34c'); await T.moveTo(d, x, z);
```
