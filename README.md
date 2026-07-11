# Les Dés du Comptoir

## Reprise de partie & accueil 💾
Les **échecs, dames, Reversi** sauvegardaient déjà leur partie (`gc-resume-*`) ; **Monopoli** le fait
maintenant aussi (état complet sauvé à chaque tour, proposition « Reprendre » au lancement, purge en fin
de partie — validé headless : sauvegarde + reprise sans crash). Une **bulle de bienvenue** s'affiche au
tout premier lancement pour orienter (❓ règles, 🌐 Salon, ⚙️ Réglages).

## Niveau de l'IA 🧠
Dans **Réglages**, choisissez 😌 Facile / 🙂 Normale / 😈 Forte : la profondeur de réflexion des IA
d'échecs, dames et Reversi s'adapte (le réglage `gc-ai` existait dans le moteur, il est maintenant exposé),
et les IA des jeux de dés/cartes modulent leur prise de risque.

## Application Android native (v2.0) 📱
La coquille Android est maintenant une **vraie application** : **splash screen** (logo sur fond sombre),
**icône adaptative** (toutes formes de launchers), **plein écran immersif** (barres masquées, glissement
pour les réafficher), bouton **retour** naturel, **vibrations** (permission ajoutée), son sans geste requis,
écran toujours allumé, liens externes ouverts hors de l'app, partage de l'APK intégré.
**Serveur local embarqué (jeu sans Internet)** 📡 : dans le Salon (app Android), bouton
**« Démarrer le serveur local »** — le téléphone sert le jeu sur le réseau (`LocalServer.java`, port 8765,
sans dépendance). Activez le **point d'accès Wi-Fi** (ou même Wi-Fi), les invités scannent le **QR code**
(lib embarquée par le CI) ou tapent l'adresse : tous les jeux, **rien à installer, zéro Internet**.
**Multijoueur temps réel sans Internet (étape B)** ✅ : relais **WebSocket** intégré au serveur
(`/ws`, trames routées `@dest|json`, écrit à la main), et `net.js` bascule automatiquement dessus
(même API que PeerJS). L'hôte crée sa table dans l'app, les invités (navigateur, page servie par le
téléphone) entrent juste leur nom — les **24 jeux réseau + mode Table** fonctionnent en local pur.
Protocole validé par simulation headless (hello/welcome, noms en double, vues privées, départs).
**Raccourcis d'app** : un appui long sur l'icône propose **Salon**, **Règles** et **Statistiques**
(liens profonds `comptoir://…`). **AAB Play Store** : avec le keystore configuré, le CI produit aussi le
bundle `.aab` prêt à téléverser sur la Play Console.
**Signature release (optionnelle)** : créez un keystore (`keytool -genkeypair -v -keystore release.keystore -alias comptoir -keyalg RSA -validity 10000`),
puis sur GitHub ajoutez la variable `HAS_KEYSTORE=true` et les secrets `KEYSTORE_B64` (keystore en base64 :
`base64 -w0 release.keystore`), `KEYSTORE_PASS`, `KEY_ALIAS`, `KEY_PASS` — le CI produira en plus un
**APK release signé** (installable en mise à jour, prêt pour un store). Sans keystore, l'APK debug
continue d'être produit comme avant. 🎲

**40 jeux de comptoir** — dés en 3D, cartes, dominos, Awalé, dames, échecs, UNO et Puissance 4 —
jouables **dans le navigateur**, **installables** (appli hors-ligne) et jouables **à plusieurs téléphones**.
Ambiance bistrot, code ouvert.

## 🎮 Comment jouer

- **En ligne, tout de suite** : ouvrez le site (GitHub Pages) — rien à installer.
- **Installer l'appli** : sur le site, touchez « 📲 Installer l'appli » (ou « Ajouter à l'écran d'accueil »).
  Une fois installée, elle **fonctionne hors connexion**.
- **À plusieurs téléphones** (Salon 🌐) : un joueur crée une table, partage un **code à 4 lettres**,
  les autres le tapent. Nouveau **mode Table** : une tablette au centre affiche le plateau commun,
  chacun garde sa main privée sur son téléphone.

## 📶 Hors-ligne : ce qui marche sans Internet

| Mode | Hors-ligne ? |
|---|---|
| Solo (contre l'ordinateur) | ✅ Oui |
| À un seul téléphone (passe-téléphone) | ✅ Oui |
| Mode **Table local** (une tablette + joueurs sur le **même Wi-Fi**… voir note) | ⚠️ Voir ci-dessous |
| Multi-téléphones (appareils différents) | ❌ A besoin d'un peu d'Internet pour que les appareils **se trouvent** |

> **Pourquoi ?** Une page web (même en appli) ne peut pas, pour des raisons de sécurité du navigateur,
> ouvrir un réseau **Bluetooth/Wi-Fi Direct** entre téléphones. La connexion multi utilise WebRTC :
> les données passent en direct entre les téléphones, mais un petit service en ligne sert **uniquement**
> à ce qu'ils se découvrent (très peu de données). Le solo et le mode Table **local** n'en ont pas besoin.
> Une vraie connexion 100 % hors-ligne entre téléphones nécessiterait une brique **native** (Wi-Fi Direct /
> Nearby) — c'est un chantier prévu plus tard.

## 📱 L'application Android (APK)

L'APK est une **coquille WebView** : elle embarque tout le jeu et le sert depuis une origine locale sûre,
donc **le solo et le mode Table local marchent entièrement hors-ligne**. Elle a les **mêmes possibilités
de connexion** que la version web (le multi entre appareils différents demande un peu d'Internet).

- **Construction automatique** : à chaque `push` sur `main`, GitHub Actions build l'APK
  (`.github/workflows/build-apk.yml`) et le publie en **Release `latest`**.
- **Partager l'appli** : l'APK peut se partager lui-même (bouton relié à `window.AndroidApp.shareApk()`).
- Permission demandée : **INTERNET** uniquement.

> **Pour les joueurs : aucune installation compliquée.** On installe simplement l'APK (ou on ouvre le
> lien web) et on joue. **Termux n'est pas nécessaire** : c'est seulement une commodité *optionnelle*
> pour le développeur qui veut publier depuis un téléphone (voir `TERMUX.md`).

## 📜 Licence

Code sous licence **MIT** (voir `LICENSE`). Les images fournies par l'auteur peuvent avoir leurs propres
conditions. Contributions bienvenues !

---

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

## Puissance 4 🔴🟡
**Puissance 4** (`p4.html`) : 7×6, jetons rouge/jaune, **IA minimax alpha-bêta** (imbattable par
le hasard, gagne/bloque parfaitement), chute animée des jetons. En **réseau** aussi (`net-games6.js`).
Plateau et jetons détourés (`www/p4/`), grille calée au pixel. Salon : **23 jeux**.

## Monopoly 🎩🏠 (jeu complet 40 cases)
**Monopoli** (`monopoly.html`) : vrai plateau **40 cases**, deux thèmes (Paris à l'ancienne / Néo Monopole futuriste) qui **correspondent aux cartes de propriété** fournies. Économie complète : achats, **loyers exacts** (barème par tableau + gares/compagnies), Départ +200, **Chance/Caisse**, **prison**, **taxes**, **maisons & hôtels** (loyers progressifs), **faillite**. Valeur hypothécaire affichée, **hypothèques jouables**, et **mode réseau 2-5 joueurs** (`net-games8.js`) : l'hôte arbitre automatiquement (loyers, cartes, prison, faillites), décisions (achat/construction/hypothèque) sur le téléphone de chacun, compatible **mode Table**. Validé : 400 parties simulées (~300 000 actions), 0 anomalie.

## Cochon troué 3D 🐷
Bouton **« Vue 3D »** : petits **cochons roses modélisés** (corps + groin + oreilles + queue) sur
**bâtonnet** qui **plongent** dans les trous du plateau (`pig3d.js`) ; un 6 fait s'envoler un cochon par
le trou de sortie. Le dé se lance en surimpression pour garder la scène 3D intacte.

## Dominos 3D 🁢
Bouton **« Vue 3D »** sur le **domino classique** : vraies **tuiles 3D** (vos textures) posées sur un
**tapis de feutre**, chaîne auto-ajustée + main cliquable (`dom3d.js`). Aussi actif sur **Matador** et **Tout-cinq** (le Train, à chaînes multiples, reste en 2D). Les pièces d'échecs/dames 3D **glissent** vers leur case.

## Reversi 3D ⚫⚪
Bouton **« Vue 3D »** : pions = disques 3D **à deux faces** (noir/blanc) qui se **retournent** physiquement
lors des captures (`r3d.js`, diff d'état automatique). Deux plateaux (bois/marbre) en texture, orientable.

## Puissance 4 3D 🔴🟡
Bouton **« Vue 3D »** : grille bleue verticale (votre image, trous transparents) et **jetons-cylindres qui
tombent** dans les colonnes avec gravité et rebond (`p43d.js`). Réutilise la logique 2D (chute pilotée par
l'état). Bascule 2D⇄3D à tout moment.

## Awalé 3D 🌰
Bouton **« Vue 3D »** sur les trois Awalé (Oware, Kalah, 2-3-4) : rendu **Babylon.js** (`awale3d.js`) avec
de **vraies graines 3D** qui s'empilent dans les trous et les greniers, plateau orientable. Réutilise la
géométrie et l'état du moteur 2D, avec **semis animé** (les graines tombent une à une dans l'ordre du semis).

## Mode 3D (échecs & dames) 🧊
Bouton **« Vue 3D »** optionnel sur **Les Échecs** et **Les Dames** : un rendu **Babylon.js** (`board3d.js`)
qui réutilise la logique 2D existante — plateau posé à plat (votre image), pièces en « standees » qui
font face à la caméra, sélection/mouvements au doigt, plateau orientable. Bascule 2D⇄3D à tout moment.

## Abalone 3D 🎱
**Abalone** (`abalone.html`) en **3D temps réel (Babylon.js)**, plein écran : plateau hexagonal (votre
texture), **billes 3D qui glissent et se poussent**. Règles complètes (déplacement de 1-3 billes alignées,
**sumito**, pas-de-côté, **éjection**, victoire à 6 billes sorties). IA gloutonne ou 2 joueurs. Logique
validée sur 300 parties simulées (0 incohérence). Assets dans `abalone/`.

## Reversi / Othello ⚫⚪
**Reversi/Othello** (`reversi.html`) : 8×8, **IA forte** (alpha-bêta, poids positionnels, coins, mobilité),
**2 plateaux** (bois vert, marbre bleu), départ **Othello** ou **Reversi** au choix, en solo, à deux et
**en réseau** (`net-games7.js`, mode Table inclus). Pions et plateaux dans `reversi/`.

## Jeux de parcours 🦢🎲
Nouvelle famille **Parcours** : **Jeu des échelles**, **Jeu de l'oie** classique (63 cases, oies/pont/puits/
labyrinthe/prison/mort), et deux **Oies délirantes** (72 et 108 cases) où **chaque case a un effet** montré
en **grande carte** (avancer, reculer, sauter, passer son tour). 1 à 5 joueurs, **pions au choix** (Roi,
Fusée, Monstre, Clown, Magicien, ou pastilles) — `parcours.js` + `pions/`.

## Mode « Table + Joueurs » 📺
Dans le Salon, à la création on peut cocher **« Cet appareil est la Table »** : ce device devient
l'**arbitre non-joueur** et affiche le **plateau public** que tout le monde voit (façon Jackbox/AirConsole) ;
chaque joueur rejoint et garde sa **main privée** sur son téléphone. Implémenté par une **vue Table
générique** dérivée de la vue publique (`renderTable`/`tableUI` dans `salon.html`) — fonctionne pour les
**23 jeux** réseau, sans image dédiée. Embellissements par jeu possibles ensuite.

## UNO 🎴
**UNO** (`uno.html`) : jeu complet (0-9, Passer, Inverser, +2, Jokers, +4), 2-4 joueurs contre
l'IA ou à plusieurs, et **en réseau** (`net-games5.js`). 54 faces détourées de vos planches
(`www/uno/`). Moteur validé (108 cartes conservées, terminaison sur 24 000 parties). Salon : **22 jeux**.

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
Poussez sur `main` : GitHub Actions construit l'APK et le publie en **Release `latest`**
(lien stable à partager). Rien à installer sur votre machine.
`TERMUX.md` explique comment tout faire depuis un téléphone Android — **optionnel**, réservé au
développeur ; **les joueurs n'en ont pas besoin**.
