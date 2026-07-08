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
Le **jeu de dominos double-six** (`domino-classique.html`), 2-4 joueurs, contre l'ordinateur
ou à tour de rôle, avec **10 styles de tuiles** (`www/dominos/<style>/<a>-<b>.webp`, découpés
de vos planches) sélectionnables en jeu. Module réutilisable `www/dominos.js`.

## Menu par catégories
Le menu (`index.html`) est organisé en trois familles — 🎲 Dés, 🃏 Cartes, 🁢 Dominos —
avec une barre de navigation qui saute à chaque section.

## Multi-téléphones 🌐
Le **Salon** (`salon.html`) connecte 2 à 4 téléphones : l'hôte crée une table, obtient
un code de 4 lettres, les autres le saisissent. Chaque joueur a **son propre écran et
ses propres cartes** — la base pour les jeux de cartes à mains cachées. Premier jeu
inclus : le **8 américain**. La connexion passe par WebRTC (PeerJS) : Internet sert à
se trouver, puis les échanges sont directs entre téléphones.

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
