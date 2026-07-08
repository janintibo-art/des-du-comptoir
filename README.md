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
