# Les Dés du Comptoir 🎲

Douze jeux de dés traditionnels en 3D (Babylon.js + physique Cannon.js), ambiance
bistrot, jouables dans le navigateur et empaquetés en APK Android via GitHub Actions.

## Les jeux
| Jeu | Dés | Joueurs | En bref |
|---|---|---|---|
| 421 | 3 | 2-4 | Charge / décharge, fiches et nénette |
| 10 000 | 5 | 2-4 | Banquez ou perdez tout |
| Yams | 5 | 1-4 | La feuille aux 13 cases |
| Poker d'as | 5 | 2-4 | Mains de poker aux dés |
| Zanzibar | 3 | 2-4 | 4·5·6 bat tout |
| Mexico | 2 | 2-4 | Trois vies, 21 imbattable |
| Chicago | 2 | 2-4 | Manches de 2 à 12 |
| Cochon | 1 | 2-4 | Gare au 1 ! |
| Passe-dix | 3 | 2-4 | Passe ou manque |
| Boston | 3 | 2-4 | On garde le plus fort |
| La Boîte | 2 | 1-4 | Shut the Box |
| Martinetti | 3 | 2-4 | La série de 1 à 12 |

**Jeux de cartes** (contre l'ordinateur ou à tour de rôle) : La Bataille (2 j.),
Le Président (3-4 j.), Le 8 loco (2-4 j.), **Le Tarot** simplifié à 4 joueurs
(atouts, Excuse, bouts — 91 points), **La Dame de pique / Hearts** (4 j., jeu à 50
avec la Lune) **Le Pouilleux / Mistigri** (2-4 j.) **La Scopa** (2-4 j., capture italienne à 11 points) **Le Menteur** (2-4 j., bluff et défis) et **Le Rami** (2-4 j., brelans/suites, manche bornée). Le Salon héberge le 8
américain en réseau ; les autres jeux de cartes en réseau viendront ensuite.

## Dominos 🁢
Trois jeux de dominos double-six, 2-4 joueurs : **Le Domino** (block/draw, `domino-classique.html`),
**Le Tout-Cinq / All Fives** (score sur les multiples de 5, `domino-toutcinq.html`) et **Le Matador**
(bouts qui totalisent 7, `domino-matador.html`) et **Le Train mexicain** (trains personnels + train
commun, doubles qui rejouent, `domino-train.html`), avec **10 styles de tuiles** (`www/dominos/<style>/<a>-<b>.webp`, découpés
de vos planches) sélectionnables en jeu. Module réutilisable `www/dominos.js`.

## Menu par catégories
Le menu (`index.html`) est organisé en trois familles — 🎲 Dés, 🃏 Cartes, 🁢 Dominos —
avec une barre de navigation qui saute à chaque section.

## Le Cochon troué 🐷
**Le Cochon troué** (« Pig Hole » d'Engelhart, `cochon-troue.html`) : jeu de dé « stop ou encore »
2-6 joueurs. On lance un dé, on pose ses cochons dans les trous ; un 6 en fait sortir un, un trou
occupé oblige à tout ramasser. Plateau et bâtonnet détourés de vos images (`www/cochon/`). Nombre
de cochons réglable (rapide/normale/officielle). Logique validée (terminaison, 2-6 joueurs).

## Les Dames ⚪
**Les Dames** (`dames-classique.html`) sur votre damier fleur de lys 8×8 : prise obligatoire
**et majoritaire**, rafles en chaîne (jouées pas à pas), **dame volante** couronnée 👑, règle
de nul (25 coups de dames). IA minimax alpha-bêta. Plateau et pions détourés (`www/dames/`),
grille calée au pixel sur l'image. Moteur validé par simulation (conservation des pièces).

## Réglages & Mexico réseau ⚙️
Écran **Réglages** (`reglages.html`) : interrupteurs Sons (`gc-sound`) et Vibrations (`gc-vibrate`),
test de vibration, bouton de mise à jour de l'app (PWA). Le **Mexico** (bluff aux dés) est désormais
jouable en réseau (`net-games4.js`), soit **21 jeux** au Salon.

## Confort damier ⚙️
Aux Dames et aux Échecs : messages en **toast discret**, bouton **↩ Annuler** (revient sur son dernier
coup et la réponse de l'IA, en solo), et **rotation du plateau** en jeu à deux sur le même téléphone
(chacun voit ses pièces devant soi). Le passe-téléphone est réservé aux jeux de cartes.

## Les Échecs ♞
**Les Échecs** (`echecs-classique.html`) avec vos pièces marquetées or : moteur complet
**certifié par perft** (positions de référence : initiale 20/400/8902/197281, kiwipete, pos.3),
roque, prise en passant, promotion au choix, échec/mat/pat, règle des 50 coups et triple
répétition. IA négamax + quiescence (3 niveaux). Sprites dans `www/echecs/`.

## Awalé 🌰
L'**Awalé / Oware** (`awale-oware.html`), jeu de semailles à 2 joueurs (famille mancala),
contre une **IA négamax** (alpha-bêta) ou à tour de rôle. Plateaux et graines détourés de vos
images (`www/awale/boards`, `www/awale/seeds`), rendu par `www/awale.js` — **2 plateaux** et
**14 modèles de graines** au choix. Trois jeux de la famille : **l'Awalé/Oware** (`awale-oware.html`),
la variante **« prise 2-3-4 »** (`awale-234.html`) et **le Kalah** (`awale-kalah.html`, mancala où l'on
sème dans son grenier, avec tours-bonus). Logique validée (48 graines conservées, terminaison).

Le tutoriel (`regles.html`) affiche désormais, sous chaque règle, une **note historique** sur l'origine
du jeu (`origins-data.js`).

## Multi-téléphones 🌐
Le **Salon** (`salon.html`) connecte 2 à 4 téléphones : l'hôte crée une table, obtient
un code de 4 lettres, les autres le saisissent. Chaque joueur a **son propre écran et
ses propres cartes** — la base pour les jeux de cartes à mains cachées. Premier jeu
inclus : le **8 américain**. La connexion passe par WebRTC (PeerJS) : Internet sert à
se trouver, puis les échanges sont directs entre téléphones.

Le Salon utilise un **cadre réseau générique** (`www/net-games.js`) : chaque jeu est un
module `{deal, view, apply, isOver, render}` avec l'hôte pour autorité. L'hôte choisit le
jeu dans le salon. Jeux en réseau (**20** — tous les jeux de cartes, dominos et plateaux) : **8 américain, 8 loco, Président, Pouilleux, Menteur, Scopa, Bataille, Dame de pique, Tarot, Rami, Domino, Matador, Tout-Cinq, Train mexicain, Awalé, Awalé 2-3-4, Kalah, Dames, Échecs, Cochon troué** (`net-games.js` + `net-games2.js` + `net-games3.js`) ; les 12 jeux de dés purs (tout y est public)
se branchent sur le même patron. Reducers validés hors-ligne (12 000 parties simulées).

Le fichier `www/net.js` (couche réseau, hôte = autorité) et `www/cards.js` (paquets de
52 cartes et tarot de 78, rendu) sont réutilisables pour ajouter d'autres jeux de cartes.

### Styles de cartes 🃏
`www/cards/` contient 5 jeux illustrés découpés depuis vos planches : `jeu1`, `jeu2`,
`jeu3` (52 cartes chacun) et deux **tarots complets de 78 cartes** (`taverne` et
`retro` : atouts 1-21, Excuse, et les Cavaliers) — prêts pour un futur jeu de Tarot.
Les libellés se renomment dans `CARD_SKINS` en tête de `www/cards.js`. Le style est
choisi en jeu, indépendamment sur chaque téléphone.

## Partager l'app 📤
- Dans l'app : bouton **Partager l'app** sur le menu → envoie l'APK installé par
  Bluetooth/WhatsApp/etc. (pont Android natif, fonctionne sans réseau).
- Par lien : chaque push publie l'APK en **Release GitHub publique** :
  `https://github.com/<votre-compte>/des-du-comptoir/releases/latest/download/app-debug.apk`
- Le destinataire doit autoriser l'installation de sources inconnues sur son téléphone.

## Fonctionnalités
- **1 à 4 joueurs** sur le même appareil : chaque joueur peut être **humain ou ordinateur**,
  avec trois niveaux d'IA (prudent / normal / audacieux).
- **📳 Secouez le téléphone** pour lancer les dés (activez le bouton dans un jeu).
- **🔊 Sons et vibrations** (synthèse Web Audio, aucun fichier) — coupables d'un bouton.
- **📜 Journal de partie** : tout l'historique des coups à portée de pouce.
- **🏆 Mode tournoi** : 3 ou 5 jeux tirés au sort, classement final (`tournoi.html`).
- **📊 Statistiques** : parties et victoires par jeu (`stats.html`).
- **🎨 12 styles de dés à débloquer** : 3 au départ, un nouveau à chaque victoire
  (bouton « tout débloquer » dans les statistiques pour les impatients).
- **❓ Tutoriel** : règles complètes dans `regles.html` et bouton Règles dans chaque jeu.
- **Hors-ligne complet** : la CI embarque Babylon.js/Cannon.js dans l'APK ; pour un usage
  local sans réseau, lancez `./get-libs.sh` une fois (sinon, repli automatique sur le CDN).

## Structure
- `www/` — le jeu web complet (ouvrez `www/index.html` dans un navigateur).
- `android/` — coquille WebView Android.
- `.github/workflows/build-apk.yml` — construit l'APK à chaque push (artefact
  `des-du-comptoir-apk` dans l'onglet Actions).

## Construire l'APK
Poussez sur GitHub : l'APK de debug est produit automatiquement par Actions.
Voir `TERMUX.md` pour tout faire depuis un téléphone Android.
