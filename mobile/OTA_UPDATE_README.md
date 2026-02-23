# 📱 Guide de Mise à Jour OTA (Over-The-Air) - EcoMobile

## Vue d'ensemble

Ce guide explique comment configurer et utiliser **Expo Open OTA** pour distribuer des mises à jour de l'application EcoMobile sans passer par le Play Store ou l'App Store.

### Principe de fonctionnement

1. Vous modifiez le code de l'application
2. Vous publiez une mise à jour OTA sur votre serveur
3. Lorsque l'utilisateur ouvre l'application, elle détecte la nouvelle version
4. Un écran de mise à jour s'affiche avec un bouton "Mettre à jour"
5. L'application télécharge et applique les changements **sans effacer les données locales**

---

## 🛠️ Solution choisie : Expo Open OTA (Auto-hébergé)

**Expo Open OTA** est une solution open-source qui permet d'héberger votre propre serveur de mises à jour OTA, compatible avec le protocole Expo Updates.

### Avantages
- ✅ **Gratuit** (auto-hébergé sur GitHub Actions + Cloudflare R2 ou autre stockage)
- ✅ Compatible Android et iOS
- ✅ Préserve les données AsyncStorage/SecureStore
- ✅ Contrôle total sur les déploiements
- ✅ Pas de dépendance à EAS Update (payant)

---

## 📋 Prérequis

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- Un compte GitHub (pour héberger le serveur OTA)
- Un compte Cloudflare (gratuit) ou AWS S3 pour le stockage des bundles

---

## 🚀 Étapes de mise en œuvre

### Étape 1 : Configurer le serveur Expo Open OTA

#### Option A : Déploiement sur Cloudflare Workers (Recommandé - Gratuit)

1. **Cloner le dépôt Expo Open OTA**
```bash
git clone https://github.com/axelmarciano/expo-open-ota.git
cd expo-open-ota
npm install
```

2. **Configurer Cloudflare R2 (stockage des bundles)**
   - Créer un compte sur [cloudflare.com](https://cloudflare.com)
   - Aller dans **R2 Object Storage** → Créer un bucket nommé `ecomobile-ota`
   - Créer un token API R2 avec les permissions Read/Write

3. **Configurer les variables d'environnement**
```bash
# Dans le dossier expo-open-ota
cp .env.example .env
```

Éditer `.env` :
```env
STORAGE_TYPE=cloudflare-r2
CLOUDFLARE_R2_BUCKET_NAME=ecomobile-ota
CLOUDFLARE_R2_ACCESS_KEY_ID=votre_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=votre_secret_key
CLOUDFLARE_R2_ENDPOINT=https://votre_account_id.r2.cloudflarestorage.com
EXPO_APP_ID=9eecef1f-106f-411c-9764-092a45decd93
```

4. **Déployer sur Cloudflare Workers**
```bash
npm run deploy
```

Notez l'URL du worker : `https://expo-open-ota.votre-compte.workers.dev`

#### Option B : Déploiement sur un VPS/Serveur (Alternative)

```bash
# Sur votre serveur
git clone https://github.com/axelmarciano/expo-open-ota.git
cd expo-open-ota
npm install
npm run build
npm start
```

---

### Étape 2 : Configurer l'application mobile EcoMobile

1. **Installer expo-updates**
```bash
cd mobile
npx expo install expo-updates
```

2. **Mettre à jour `app.json`**

Ajouter la configuration OTA dans `mobile/app.json` :
```json
{
  "expo": {
    "name": "FreeBike",
    "slug": "Eco-Mobile",
    "version": "1.0.0",
    "runtimeVersion": {
      "policy": "appVersion"
    },
    "updates": {
      "url": "https://expo-open-ota.votre-compte.workers.dev/api/manifest",
      "enabled": true,
      "checkAutomatically": "ON_LOAD",
      "fallbackToCacheTimeout": 0
    },
    ...
  }
}
```

> ⚠️ Remplacez `https://expo-open-ota.votre-compte.workers.dev` par l'URL réelle de votre serveur OTA.

3. **Créer le composant de mise à jour**

Créer le fichier `mobile/components/UpdateScreen.tsx` :
```tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import * as Updates from 'expo-updates';

export function UpdateScreen() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      setIsUpdating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>🚀 Mise à jour disponible</Text>
        <Text style={styles.description}>
          Une nouvelle version de l'application est disponible.
          Mettez à jour pour profiter des dernières améliorations.
        </Text>
        
        {isUpdating ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#16a34a" />
            <Text style={styles.loadingText}>Mise à jour en cours...</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleUpdate}>
            <Text style={styles.buttonText}>Mettre à jour</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#16a34a',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 14,
  },
});
```

4. **Intégrer la vérification de mise à jour dans l'application**

Modifier `mobile/app/_layout.tsx` pour vérifier les mises à jour au démarrage :
```tsx
import { useEffect, useState } from 'react';
import * as Updates from 'expo-updates';
import { UpdateScreen } from '../components/UpdateScreen';

export default function RootLayout() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      if (__DEV__) return; // Ne pas vérifier en mode développement
      
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        setUpdateAvailable(true);
      }
    } catch (error) {
      console.log('Vérification des mises à jour impossible:', error);
    }
  };

  if (updateAvailable) {
    return <UpdateScreen />;
  }

  // ... reste du layout existant
}
```

---

### Étape 3 : Configurer EAS Build pour les builds natifs

1. **Se connecter à EAS**
```bash
cd mobile
eas login
```

2. **Configurer `eas.json`** (déjà présent dans le projet)

Vérifier que `mobile/eas.json` contient :
```json
{
  "cli": {
    "version": ">= 12.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

3. **Construire l'APK initial**
```bash
# Build APK Android (distribué directement)
eas build --platform android --profile production

# Build IPA iOS (nécessite un compte Apple Developer)
eas build --platform ios --profile production
```

---

### Étape 4 : Publier une mise à jour OTA

Après avoir modifié le code de l'application :

1. **Incrémenter la version dans `app.json`** (si changements natifs)
```json
{
  "expo": {
    "version": "1.0.1"
  }
}
```

2. **Exporter le bundle JavaScript**
```bash
cd mobile
npx expo export --platform all
```

3. **Publier sur le serveur OTA**
```bash
# Utiliser l'outil CLI d'Expo Open OTA
npx expo-open-ota publish \
  --server-url https://expo-open-ota.votre-compte.workers.dev \
  --channel production \
  --platform android

npx expo-open-ota publish \
  --server-url https://expo-open-ota.votre-compte.workers.dev \
  --channel production \
  --platform ios
```

---

### Étape 5 : Automatiser avec GitHub Actions

Créer `.github/workflows/ota-update.yml` :
```yaml
name: OTA Update

on:
  push:
    branches: [main]
    paths:
      - 'mobile/**'
      - '!mobile/android/**'
      - '!mobile/ios/**'

jobs:
  publish-ota:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd mobile
          npm install
          
      - name: Export bundle
        run: |
          cd mobile
          npx expo export --platform all
          
      - name: Publish OTA update
        env:
          OTA_SERVER_URL: ${{ secrets.OTA_SERVER_URL }}
          OTA_API_KEY: ${{ secrets.OTA_API_KEY }}
        run: |
          cd mobile
          npx expo-open-ota publish \
            --server-url $OTA_SERVER_URL \
            --channel production \
            --platform android
          npx expo-open-ota publish \
            --server-url $OTA_SERVER_URL \
            --channel production \
            --platform ios
```

Ajouter les secrets GitHub :
- `OTA_SERVER_URL` : URL de votre serveur OTA
- `OTA_API_KEY` : Clé API de votre serveur OTA

---

## 📱 Comportement de l'application

### Flux de mise à jour

```
Ouverture de l'app
       ↓
Vérification de mise à jour (en arrière-plan)
       ↓
Mise à jour disponible ?
   ├── OUI → Afficher l'écran de mise à jour
   │          ↓
   │    Utilisateur clique "Mettre à jour"
   │          ↓
   │    Téléchargement du bundle
   │          ↓
   │    Redémarrage de l'app (données préservées)
   │
   └── NON → Afficher l'app normalement
```

### Données préservées lors d'une mise à jour OTA

✅ **Préservées** :
- AsyncStorage (tokens, préférences)
- SecureStore (données sensibles)
- Fichiers locaux (photos de profil, cache)

❌ **Non préservées** (nécessite un nouveau build natif) :
- Changements dans les modules natifs
- Nouvelles permissions Android/iOS
- Changements dans `app.json` (icône, splash screen)

---

## ⚠️ Limitations importantes

### Quand utiliser OTA vs Nouveau Build

| Changement | OTA | Nouveau Build |
|-----------|-----|---------------|
| Modification de composants React | ✅ | ❌ |
| Ajout de nouvelles pages | ✅ | ❌ |
| Correction de bugs JS | ✅ | ❌ |
| Ajout d'une nouvelle librairie native | ❌ | ✅ |
| Changement de permissions | ❌ | ✅ |
| Modification de l'icône/splash | ❌ | ✅ |
| Mise à jour d'Expo SDK | ❌ | ✅ |

---

## 🔧 Dépannage

### L'application ne détecte pas les mises à jour

1. Vérifier que `updates.url` dans `app.json` est correct
2. Vérifier que le serveur OTA est accessible
3. Vérifier que `runtimeVersion` correspond entre l'app et le bundle publié

### Erreur "Runtime version mismatch"

Cela signifie que le bundle publié n'est pas compatible avec la version native installée. Vous devez publier un nouveau build natif.

### Rollback d'une mise à jour

```bash
# Lister les mises à jour publiées
npx expo-open-ota list --server-url $OTA_SERVER_URL --channel production

# Revenir à une version précédente
npx expo-open-ota rollback --server-url $OTA_SERVER_URL --channel production --update-id <ID>
```

---

## 📊 Monitoring

Le serveur Expo Open OTA fournit des métriques sur :
- Nombre de téléchargements par version
- Taux d'adoption des mises à jour
- Erreurs de mise à jour

Accéder au dashboard : `https://expo-open-ota.votre-compte.workers.dev/dashboard`

---

## 🔐 Sécurité

1. **Signer les bundles** : Configurer la signature des bundles pour éviter les mises à jour malveillantes
2. **HTTPS obligatoire** : Le serveur OTA doit utiliser HTTPS
3. **Authentification** : Protéger l'API de publication avec une clé API

---

## 📚 Ressources

- [Expo Open OTA GitHub](https://github.com/axelmarciano/expo-open-ota)
- [Documentation Expo Updates](https://docs.expo.dev/versions/latest/sdk/updates/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)

---

## 🎯 Résumé des commandes

```bash
# 1. Installer les dépendances
cd mobile && npx expo install expo-updates

# 2. Construire l'APK initial
eas build --platform android --profile production

# 3. Après modification du code, publier une mise à jour OTA
npx expo export --platform all
npx expo-open-ota publish --server-url $OTA_SERVER_URL --channel production --platform android

# 4. Vérifier les mises à jour publiées
npx expo-open-ota list --server-url $OTA_SERVER_URL --channel production
```
