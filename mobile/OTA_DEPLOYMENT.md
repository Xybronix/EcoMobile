# Guide de déploiement OTA — EcoMobile

Ce guide explique comment mettre à jour l'application **FreeBike** sans passer par le Play Store / App Store en utilisant **expo-open-ota** (serveur OTA auto-hébergé).

**Architecture retenue :**
- **expo-open-ota** hébergé sur **Render** (gratuit) — sert les mises à jour JS
- **EAS Update** (`eas update`) — publie les bundles sur les serveurs Expo
- expo-open-ota agit en **proxy** : il reçoit les requêtes de l'app, vérifie auprès d'Expo si une nouvelle version est disponible, et la sert

---

## Prérequis

- Node.js 18+
- EAS CLI : `npm install -g eas-cli`
- Compte Expo (gratuit) : créer sur [expo.dev](https://expo.dev) puis `eas login`
- Le projet est déjà connecté à l'Expo account **xybronix** (projectId dans `app.json`)
- Compte Render (gratuit) : [render.com](https://render.com)
- Dépôt GitHub forké depuis [axelmarciano/expo-open-ota](https://github.com/axelmarciano/expo-open-ota)

---

## PARTIE A — Déployer expo-open-ota sur Render

### A1. Ce qu'il faut modifier dans le fork GitHub

**Bonne nouvelle : aucune modification de code n'est nécessaire.** Il suffit de configurer les variables d'environnement lors de la création du service Render.

Optionnel — si tu veux que Render soit configuré automatiquement via `render.yaml`, ajoute ce fichier à la racine du fork :

```yaml
# render.yaml — à ajouter à la racine de ton fork expo-open-ota
services:
  - type: web
    name: expo-open-ota
    env: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: EXPO_TOKEN
        sync: false
      - key: BASE_URL
        sync: false
      - key: STORAGE_TYPE
        value: s3
```

### A2. Créer le service Web sur Render

1. Aller sur [dashboard.render.com](https://dashboard.render.com) → **New +** → **Web Service**
2. Sélectionner **"Build and deploy from a Git repository"**
3. Connecter ton compte GitHub si ce n'est pas déjà fait
4. Choisir ton fork de **expo-open-ota**
5. Configurer :

| Paramètre | Valeur |
|---|---|
| **Name** | `expo-open-ota` (ou autre nom) |
| **Region** | Frankfurt EU (ou la plus proche) |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Plan** | Free |

6. Cliquer **"Create Web Service"**

> Render attribuera automatiquement une URL du type `https://expo-open-ota-xxxx.onrender.com`.

### A3. Variables d'environnement à créer dans Render

Dans le tableau de bord du service → **Environment** → **Add Environment Variable** :

#### Variables obligatoires

| Clé | Valeur | Description |
|---|---|---|
| `EXPO_TOKEN` | `expo_xxxx...` | Token Expo (voir ci-dessous) |
| `BASE_URL` | `https://ton-service.onrender.com` | URL publique de ton service Render |
| `NODE_ENV` | `production` | Mode d'exécution |

#### Générer le token Expo
1. Aller sur [expo.dev/settings/access-tokens](https://expo.dev/settings/access-tokens)
2. **Create Token** → nommer "render-ota"
3. Copier le token → l'ajouter comme `EXPO_TOKEN` dans Render

#### Variables de stockage (choisir UNE option)

**Option 1 — Cloudflare R2 (recommandé, gratuit jusqu'à 10 GB)**

| Clé | Description |
|---|---|
| `STORAGE_TYPE` | `cloudflare_r2` |
| `CLOUDFLARE_R2_BUCKET_NAME` | Nom du bucket R2 |
| `CLOUDFLARE_ACCOUNT_ID` | ID du compte Cloudflare |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | Clé d'accès R2 |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | Clé secrète R2 |
| `CLOUDFLARE_R2_ENDPOINT` | `https://ACCOUNT_ID.r2.cloudflarestorage.com` |

**Option 2 — AWS S3**

| Clé | Description |
|---|---|
| `STORAGE_TYPE` | `s3` |
| `S3_BUCKET_NAME` | Nom du bucket S3 |
| `S3_REGION` | `eu-west-3` (ou autre région) |
| `AWS_ACCESS_KEY_ID` | Clé d'accès AWS |
| `AWS_SECRET_ACCESS_KEY` | Clé secrète AWS |

**Option 3 — Local (développement uniquement)**

| Clé | Description |
|---|---|
| `STORAGE_TYPE` | `local` |

> **Attention** : le stockage local est effacé à chaque redéploiement sur Render (filesystem éphémère). Ne l'utiliser qu'en test.

### A4. Vérifier que le serveur fonctionne

Après le déploiement, tester l'endpoint :
```
GET https://ton-service.onrender.com/healthcheck
```
Doit retourner `{"status": "ok"}`.

---

## PARTIE B — Configurer l'application mobile

### B1. Mettre à jour app.json

Dans `mobile/app.json`, remplacer `YOUR_OTA_SERVER` par l'URL Render :

```json
"updates": {
  "url": "https://ton-service.onrender.com/api/v1/manifest",
  "enabled": true,
  "checkAutomatically": "ON_LOAD",
  "fallbackToCacheTimeout": 0
}
```

### B2. Initialiser EAS Update (une seule fois)

```bash
cd mobile
eas update:configure
```

---

## PARTIE C — Générer le premier build APK

Le premier APK doit être compilé **après** la configuration OTA pour inclure l'URL du serveur dans le binaire.

```bash
cd mobile

# Build Android (APK)
eas build --platform android --profile preview

# Ou pour un build de production signé
eas build --platform android --profile production
```

Le build est réalisé sur les serveurs Expo (cloud build). L'APK téléchargeable est disponible dans ton tableau de bord Expo.

---

## PARTIE D — Publier une mise à jour OTA

Après chaque modification du code JS/TypeScript :

```bash
cd mobile
eas update --branch production --message "Description de la mise à jour"
```

Les utilisateurs verront le modal "Mise à jour disponible" au prochain démarrage.

---

## PARTIE E — Automatisation avec GitHub Actions

Le fichier `.github/workflows/ota-update.yml` est déjà créé dans ce dépôt. Il publie automatiquement une mise à jour OTA à chaque `git push` sur `main` affectant le dossier `mobile/`.

### Ajouter le secret GitHub requis

Dans les paramètres du dépôt GitHub → **Settings** → **Secrets and variables** → **Actions** → **New repository secret** :

| Secret | Valeur |
|---|---|
| `EXPO_TOKEN` | Ton token Expo (le même que dans Render) |

### Déclenchement manuel

Le workflow peut aussi être déclenché manuellement depuis **Actions** → **OTA Mobile Update** → **Run workflow** (avec un message personnalisé).

---

## Workflow complet

```
Tu modifies le code JS/TS dans mobile/
       │
       ▼
git push origin main
       │
       ▼
GitHub Actions → eas update --branch production
       │
       ▼
Bundle JS publié sur les serveurs Expo (EAS)
       │
       ▼
expo-open-ota (Render) proxy → reçoit la requête de l'app
       │
       ▼
Utilisateur démarre l'app → UpdateChecker détecte la MAJ
       │
       ▼
Modal "Mise à jour disponible" → bouton "Mettre à jour"
       │
       ▼
fetchUpdateAsync() → reloadAsync() → app rechargée (données conservées)
```

---

## Types de mise à jour

| Type de changement | OTA possible ? | Action requise |
|---|---|---|
| Code JS/TS, composants, styles | Oui | `eas update` |
| Assets (images, fonts) | Oui | `eas update` |
| Nouvelles dépendances natives | Non | Nouveau build APK via `eas build` |
| Changement de permissions Android | Non | Nouveau build APK |

---

## Informations importantes

- L'OTA est **désactivé en mode développement** (`expo start`)
- `runtimeVersion: { policy: "sdkVersion" }` assure la compatibilité des bundles avec le SDK installé
- En cas d'indisponibilité du serveur, l'app fonctionne avec le dernier bundle en cache
- Les données AsyncStorage et SQLite sont **conservées** lors d'une mise à jour OTA
- Le plan Free de Render met le service en veille après 15 min d'inactivité — prévoir ~30s de démarrage à froid

---

## Commandes utiles

```bash
# Vérifier les mises à jour publiées
eas update:list

# Voir les détails d'un canal
eas channel:list

# Créer un canal de staging pour les tests
eas update --branch staging --message "Test interne"

# Voir l'état du build
eas build:list
```
