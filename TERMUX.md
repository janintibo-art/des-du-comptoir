# Depuis Termux : dézipper, créer le dépôt GitHub, récupérer l'APK

## 1. Préparer Termux
```bash
pkg update -y && pkg upgrade -y
pkg install -y git gh unzip python
termux-setup-storage        # autoriser l'accès au stockage (une seule fois)
```

## 2. Dézipper le projet
Le zip étant dans le dossier Téléchargements du téléphone :
```bash
cd ~
unzip ~/storage/downloads/des-du-comptoir.zip
cd des-du-comptoir
ls        # www/  android/  .github/  README.md ...
```

## 3. (Facultatif) Tester le jeu dans le navigateur du téléphone
```bash
cd ~/des-du-comptoir/www
python -m http.server 8080
# puis ouvrir http://localhost:8080 dans Chrome/Firefox
# Ctrl+C pour arrêter le serveur
```

## 4. Créer le dépôt GitHub et pousser
```bash
cd ~/des-du-comptoir
git init -b main
git config user.name  "VotreNom"
git config user.email "vous@exemple.com"
git add .
git commit -m "Les Dés du Comptoir : 421 et 10 000 en Babylon.js"

gh auth login
# → GitHub.com → HTTPS → Login with a web browser
# → copier le code affiché, ouvrir l'URL, coller le code

gh repo create des-du-comptoir --public --source=. --push
# (--private au lieu de --public si vous préférez)
```

## 5. Récupérer l'APK compilé par GitHub
Le push déclenche automatiquement le workflow **Build APK**.
```bash
gh run watch                              # suivre la compilation (~3 à 5 min)
gh run download -n des-du-comptoir-apk -D ~/storage/downloads
```
L'APK `app-debug.apk` arrive dans les Téléchargements du téléphone :
ouvrez-le pour l'installer (autoriser l'installation de sources inconnues).

Pour relancer une compilation à la main :
```bash
gh workflow run "Build APK" && gh run watch
```

## 6. Mettre à jour le jeu plus tard
```bash
cd ~/des-du-comptoir
# ... modifications ...
git add . && git commit -m "Description du changement" && git push
gh run watch && gh run download -n des-du-comptoir-apk -D ~/storage/downloads
```
