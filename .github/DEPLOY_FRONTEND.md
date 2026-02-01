# Guide de déploiement automatique du Frontend sur GitHub Pages

Ce workflow déploie automatiquement le frontend sur GitHub Pages à chaque push sur la branche `main` qui modifie des fichiers dans le dossier `frontend/`.

## 🚀 Fonctionnement

Le workflow `.github/workflows/deploy-frontend.yml` :
1. Se déclenche automatiquement lors d'un push sur `main` qui modifie `frontend/**`
2. Peut aussi être déclenché manuellement depuis l'onglet Actions
3. Installe les dépendances avec `npm ci` (plus rapide et fiable que `npm install`)
4. Build le frontend avec `npm run build`
5. Déploie automatiquement sur GitHub Pages

## ⚙️ Configuration requise

### 1. Activer GitHub Pages

1. Allez sur votre dépôt GitHub → **Settings** (Paramètres)
2. Dans le menu de gauche, cliquez sur **Pages**
3. Sous **Source**, sélectionnez :
   - **Branch** : `gh-pages`
   - **Folder** : `/ (root)`
4. Cliquez sur **Save**

### 2. Variables d'environnement (optionnel)

Si vous avez besoin de variables d'environnement pour le build, ajoutez-les comme secrets :

1. Allez sur **Settings** → **Secrets and variables** → **Actions**
2. Cliquez sur **New repository secret**
3. Ajoutez les secrets suivants si nécessaire :
   - `VITE_API_URL` : URL de l'API backend
   - `VITE_APP_DOWNLOAD_URL` : URL de téléchargement de l'app
   - `VITE_APP_NAME` : Nom de l'application

**Note** : Le workflow utilise des valeurs par défaut si les secrets ne sont pas définis.

## 📝 Utilisation

### Déploiement automatique

Le workflow se déclenche automatiquement quand :
- Vous poussez des changements dans `frontend/` sur la branche `main`
- Le workflow s'exécute et déploie automatiquement

### Déclenchement manuel

1. Allez sur l'onglet **Actions** de votre dépôt
2. Sélectionnez le workflow **Deploy Frontend to GitHub Pages**
3. Cliquez sur **Run workflow**
4. Sélectionnez la branche (généralement `main`)
5. Cliquez sur **Run workflow**

## 🔍 Vérification

Après le déploiement :
1. Attendez quelques minutes (le workflow prend généralement 2-5 minutes)
2. Vérifiez l'onglet **Actions** pour voir si le workflow a réussi
3. Votre site sera disponible à : `https://Xybronix.github.io/EcoMobile/`

**Note** : Si votre dépôt est privé, vous devrez peut-être activer GitHub Pages dans les paramètres du dépôt.

## 🐛 Dépannage

### Le workflow échoue

1. **Vérifiez les logs** : Allez dans Actions → Cliquez sur le workflow qui a échoué → Consultez les logs
2. **Erreur de build** : Vérifiez que toutes les dépendances sont dans `package.json`
3. **Erreur de permissions** : Vérifiez que les permissions du workflow sont correctes (elles sont déjà configurées)

### Le site ne se met pas à jour

1. GitHub Pages peut prendre quelques minutes pour se mettre à jour
2. Videz le cache de votre navigateur (Ctrl+F5)
3. Vérifiez que la branche `gh-pages` a bien été mise à jour dans votre dépôt

### Variables d'environnement manquantes

Si le build nécessite des variables d'environnement :
1. Ajoutez-les comme secrets (voir section Configuration)
2. Ou modifiez le workflow pour utiliser des valeurs par défaut

## 📌 Notes importantes

- Le workflow utilise `npm ci` au lieu de `npm install` pour une installation plus rapide et reproductible
- Le cache npm est activé pour accélérer les builds
- Le workflow ne déploie que si des fichiers dans `frontend/` sont modifiés
- La branche `gh-pages` est créée automatiquement si elle n'existe pas

## 🔄 Mise à jour

Pour modifier le workflow :
1. Éditez `.github/workflows/deploy-frontend.yml`
2. Committez et poussez les changements
3. Le workflow utilisera automatiquement la nouvelle version
