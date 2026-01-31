# Configuration de la synchronisation automatique GitHub

Ce document explique comment configurer la synchronisation automatique entre le dépôt principal `EcoMobile` et les dépôts `EcoMobile-backend` et `EcoMobile-frontend`.

## 📋 Prérequis

- Un compte GitHub avec accès aux 3 dépôts :
  - `EcoMobile` (dépôt principal)
  - `EcoMobile-backend` (dépôt backend)
  - `EcoMobile-frontend` (dépôt frontend)
- Les dépôts peuvent être **publics** ou **privés** (la configuration fonctionne pour les deux)

## 🔑 Étape 1 : Créer un Personal Access Token (PAT)

1. Allez sur GitHub → **Settings** (Paramètres) → **Developer settings** (Paramètres du développeur)
2. Cliquez sur **Personal access tokens** → **Tokens (classic)**
3. Cliquez sur **Generate new token** → **Generate new token (classic)**
4. Donnez un nom au token (ex: `EcoMobile Sync Token`)
5. Sélectionnez la durée d'expiration (recommandé : **No expiration** pour éviter les problèmes)
6. **Cochez les permissions suivantes** :
   - ✅ `repo` (accès complet aux dépôts)
     - ✅ `repo:status`
     - ✅ `repo_deployment`
     - ✅ `public_repo` (si repos publics)
     - ✅ `repo:invite`
     - ✅ `security_events`
7. Cliquez sur **Generate token**
8. **⚠️ IMPORTANT** : Copiez le token immédiatement (vous ne pourrez plus le voir après) et gardez-le dans un endroit sûr

## 🔐 Étape 2 : Ajouter le token comme secret dans le dépôt principal

1. Allez sur votre dépôt **EcoMobile** sur GitHub
2. Cliquez sur **Settings** (Paramètres)
3. Dans le menu de gauche, cliquez sur **Secrets and variables** → **Actions**
4. Cliquez sur **New repository secret**
5. Remplissez les champs :
   - **Name** : `ECOMOBILE_SYNC_TOKEN`
   - **Secret** : Collez le token que vous avez créé à l'étape 1
6. Cliquez sur **Add secret**

## ✅ Étape 3 : Vérifier les permissions du workflow

1. Toujours dans **Settings** du dépôt **EcoMobile**
2. Allez dans **Actions** → **General**
3. Dans la section **Workflow permissions**, vérifiez que :
   - ✅ **Read and write permissions** est sélectionné
   - ✅ **Allow GitHub Actions to create and approve pull requests** est coché (optionnel mais recommandé)

## 🧪 Étape 4 : Tester la synchronisation

### Méthode 1 : Déclenchement automatique
1. Faites un commit et un push dans le dossier `backend/` ou `frontend/` du dépôt principal
2. Allez dans l'onglet **Actions** de votre dépôt **EcoMobile**
3. Vous devriez voir le workflow se déclencher automatiquement

### Méthode 2 : Déclenchement manuel
1. Allez dans l'onglet **Actions** de votre dépôt **EcoMobile**
2. Sélectionnez le workflow **Sync EcoMobile Backend** ou **Sync EcoMobile Frontend**
3. Cliquez sur **Run workflow** → **Run workflow**

## 🔍 Vérification et dépannage

### Si le workflow échoue :

1. **Vérifiez que le secret est bien configuré** :
   - Settings → Secrets and variables → Actions
   - Le secret `ECOMOBILE_SYNC_TOKEN` doit être présent

2. **Vérifiez les permissions du token** :
   - Le token doit avoir la permission `repo` complète
   - Si les dépôts sont privés, le token doit avoir accès aux dépôts privés

3. **Vérifiez les noms des dépôts** :
   - Les workflows utilisent : `Xybronix/EcoMobile-backend` et `Xybronix/EcoMobile-frontend`
   - Si vos noms de dépôts sont différents, modifiez les fichiers `.github/workflows/sync-*.yml`

4. **Vérifiez les logs du workflow** :
   - Actions → Cliquez sur le workflow qui a échoué
   - Lisez les logs pour identifier l'erreur exacte

### Erreurs courantes :

- **"Permission denied"** : Le token n'a pas les bonnes permissions ou est expiré
- **"Repository not found"** : Vérifiez que les noms des dépôts sont corrects
- **"Authentication failed"** : Le secret `ECOMOBILE_SYNC_TOKEN` n'est pas correctement configuré

## 📝 Notes importantes

- Les workflows se déclenchent automatiquement uniquement lors d'un push sur la branche `main`
- Les workflows se déclenchent uniquement si des fichiers dans `backend/` ou `frontend/` sont modifiés
- Vous pouvez aussi déclencher manuellement les workflows via l'interface GitHub Actions
- Les commits dans les dépôts cibles auront le message : "Sync from EcoMobile main - [date]"

## 🔄 Comment ça fonctionne ?

1. Quand vous poussez des changements dans `backend/` ou `frontend/` sur `main`
2. GitHub Actions détecte le changement
3. Le workflow clone le dépôt cible (backend ou frontend)
4. Il copie tous les fichiers du dossier correspondant
5. Il commit et push les changements vers le dépôt cible

Cette méthode fonctionne pour les dépôts publics et privés, tant que le token a les bonnes permissions.
