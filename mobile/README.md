# 📱 FreeBike - Application Mobile

Application mobile React Native avec Expo pour la location de vélos électriques.

## 📋 Table des Matières

- [Vue d'ensemble](#vue-densemble)
- [Technologies](#technologies)
- [Installation](#installation)
- [Structure](#structure)
- [Fonctionnalités](#fonctionnalités)
- [Déploiement](#déploiement)

## 🎯 Vue d'ensemble

L'application mobile FreeBike permet aux utilisateurs de :
- 🚲 Louer des vélos électriques
- 🗺️ Localiser les vélos disponibles en temps réel
- 📱 Scanner des QR codes pour déverrouiller
- 💰 Gérer leur portefeuille et effectuer des paiements
- 💬 Contacter le support client
- 📊 Consulter leur historique de trajets

## 🛠️ Technologies

- **React Native 0.81+** - Framework mobile
- **Expo 54+** - Outils et services
- **Expo Router 6.0+** - Navigation basée sur les fichiers
- **TypeScript 5.9+** - Typage statique
- **NativeWind 4.2+** - Tailwind CSS pour React Native
- **Expo Location** - Géolocalisation
- **Expo Image Picker** - Sélection d'images
- **React Navigation** - Navigation native
- **Expo Font** - Gestion des polices
- **Expo Constants** - Constantes de l'application
- **Expo Haptics** - Retour haptique
- **Lottie React Native** - Animations
- **React Native Toast Message** - Notifications

## 🚀 Installation

### Prérequis

- Node.js 20+
- npm ou yarn
- Expo CLI (installé globalement ou via npx)
- Un appareil physique ou un émulateur/simulateur

### Installation

```bash
cd mobile
npm install
```

### Configuration

Créer un fichier `.env` (si nécessaire) :

```env
EXPO_PUBLIC_API_URL=https://env-freebike-xybronix.hidora.com/api/v1
```

### Démarrage

```bash
# Démarrer Expo
npm start
# ou
npx expo start

# Démarrer sur Android
npm run android
# ou
npx expo run:android

# Démarrer sur iOS
npm run ios
# ou
npx expo run:ios

# Démarrer sur Web
npm run web
# ou
npx expo start --web
```

## 📁 Structure

```
mobile/
├── app/                        # Routes (Expo Router)
│   ├── (auth)/                 # Routes d'authentification
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── forgot-password.tsx
│   │   └── verify-phone.tsx
│   ├── (tabs)/                 # Navigation par onglets
│   │   ├── index.tsx           # Accueil
│   │   ├── map.tsx             # Carte des vélos
│   │   ├── wallet.tsx          # Portefeuille
│   │   ├── history.tsx         # Historique
│   │   ├── profile.tsx         # Profil
│   │   └── chat.tsx            # Chat support
│   ├── (modals)/               # Modales
│   │   ├── bike-details.tsx
│   │   ├── start-ride.tsx
│   │   └── ...
│   ├── _layout.tsx             # Layout racine
│   └── index.tsx                # Point d'entrée
├── components/                  # Composants React Native (65 fichiers)
│   ├── auth/                   # Composants d'authentification
│   ├── bike/                   # Composants liés aux vélos
│   ├── map/                    # Composants de carte
│   ├── wallet/                 # Composants de portefeuille
│   ├── chat/                   # Composants de chat
│   └── ui/                     # Composants UI réutilisables
├── services/                    # Services API (18 fichiers)
│   ├── api/
│   │   ├── client.ts           # Client API de base
│   │   ├── auth.service.ts
│   │   ├── bike.service.ts
│   │   ├── ride.service.ts
│   │   └── ...
├── hooks/                       # Hooks React personnalisés
│   ├── useAuth.ts
│   ├── useLocation.ts
│   └── ...
├── lib/                         # Utilitaires
│   ├── auth.tsx                # Contexte d'authentification
│   ├── i18n.tsx                # Internationalisation
│   └── ...
├── constants/                   # Constantes
│   ├── fonts.ts                # Configuration des polices
│   └── theme.ts                # Thème de l'application
├── types/                       # Types TypeScript
├── utils/                       # Fonctions utilitaires
├── assets/                      # Ressources
│   ├── images/                 # Images
│   ├── fonts/                  # Polices
│   └── animations/             # Animations Lottie
├── styles/                      # Styles globaux
│   └── globalStyles.ts
├── app.json                     # Configuration Expo
├── eas.json                     # Configuration EAS Build
└── package.json
```

## ✨ Fonctionnalités

### Authentification

- ✅ Inscription avec email/téléphone
- ✅ Connexion sécurisée
- ✅ Réinitialisation de mot de passe
- ✅ Vérification d'email
- ✅ Vérification de téléphone (SMS)
- ✅ Support bilingue (FR/EN)

### Location de Vélos

- 🚲 **Carte interactive** avec vélos disponibles en temps réel
- 🔍 **Filtres** : distance, batterie, type de vélo
- 📸 **Scanner QR code** pour déverrouiller
- 🔐 **Inspection** avant/après trajet (photos)
- ⏱️ **Chronomètre** de trajet en temps réel
- 📍 **Géolocalisation** et navigation
- 🔓 **Déverrouillage** à distance

### Portefeuille

- 💰 **Solde** en temps réel
- 💳 **Recharge** via My-CoolPay (Orange Money, MTN)
- 📊 **Historique** des transactions
- 🧾 **Factures** téléchargeables
- 💸 **Remboursements** automatiques

### Profil & Historique

- 👤 **Gestion du profil** (photo, nom, email, téléphone)
- 📜 **Historique des trajets** avec détails
- 🔔 **Notifications** personnalisées
- 💬 **Chat** avec le support
- 🌍 **Changement de langue** (FR/EN)
- ⭐ **Évaluations** des trajets

### Support

- 💬 **Chat en temps réel** avec le support
- 🎫 **Création de tickets** de support
- 📸 **Envoi de photos** pour signaler des problèmes
- 📍 **Partage de localisation**

## 🔐 Authentification

### Connexion

1. Ouvrir l'application
2. Entrer email/téléphone et mot de passe
3. Optionnel : Vérification par SMS
4. Accès à l'application

### Comptes de Test

**Utilisateur**
- Email: `user@freebike.cm`
- Password: `user123`

## 🌍 Internationalisation

L'application supporte **français** et **anglais**.

### Utilisation

```typescript
import { useI18n } from '../lib/i18n';

function MyComponent() {
  const { t, language, setLanguage } = useI18n();
  
  return (
    <View>
      <Text>{t('home.welcome')}</Text>
      <Button onPress={() => setLanguage('en')}>English</Button>
    </View>
  );
}
```

## 📱 Navigation

L'application utilise **Expo Router** avec navigation basée sur les fichiers :

- `app/(auth)/` - Routes d'authentification
- `app/(tabs)/` - Navigation par onglets (principale)
- `app/(modals)/` - Modales

### Onglets Principaux

1. **Accueil** - Vue d'ensemble et actions rapides
2. **Carte** - Carte interactive des vélos
3. **Portefeuille** - Solde et transactions
4. **Historique** - Trajets passés
5. **Profil** - Paramètres et informations
6. **Chat** - Support client

## 🗺️ Géolocalisation

L'application utilise **Expo Location** pour :
- Localiser l'utilisateur
- Afficher les vélos à proximité
- Suivre le trajet en cours
- Vérifier les zones autorisées (géofencing)

### Permissions

L'application demande les permissions suivantes :
- **Localisation** : Pour afficher la carte et localiser les vélos
- **Caméra** : Pour scanner les QR codes
- **Photos** : Pour prendre des photos d'inspection

## 📸 Scanner QR Code

L'application permet de scanner les QR codes des vélos pour :
- Déverrouiller un vélo
- Vérifier l'identité du vélo
- Accéder aux détails du vélo

## 💳 Paiements

L'application intègre **My-CoolPay** pour :
- Recharger le portefeuille
- Payer les trajets
- Recevoir des remboursements

### Méthodes de paiement supportées

- Orange Money
- MTN Mobile Money
- Autres méthodes via My-CoolPay

## 🔔 Notifications

L'application envoie des notifications pour :
- Nouveau trajet disponible
- Trajet terminé
- Solde faible
- Messages du support
- Promotions

## 📦 Scripts npm

```json
{
  "start": "Démarrer Expo",
  "android": "Build et démarrage sur Android",
  "ios": "Build et démarrage sur iOS",
  "web": "Démarrer sur Web",
  "reset-project": "Réinitialiser le projet",
  "lint": "Linter le code"
}
```

## 🚀 Déploiement

### Développement

```bash
npm start
```

Puis scanner le QR code avec Expo Go ou ouvrir dans un émulateur.

### Build de Production

#### Android

```bash
# Build APK
npx eas build --platform android

# Build AAB (pour Google Play)
npx eas build --platform android --profile production
```

#### iOS

```bash
# Build pour App Store
npx eas build --platform ios --profile production
```

### Configuration EAS

Le fichier `eas.json` contient les profils de build :

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "distribution": "store"
    }
  }
}
```

### Publication

#### Google Play Store

```bash
npx eas submit --platform android
```

#### Apple App Store

```bash
npx eas submit --platform ios
```

## 🎨 Personnalisation

### Thème

Le thème est configuré dans `constants/theme.ts` et utilise NativeWind (Tailwind CSS).

### Polices

Les polices sont configurées dans `constants/fonts.ts` et chargées via Expo Font.

## 🐛 Dépannage

### L'application ne se connecte pas à l'API

1. Vérifier que le backend est démarré
2. Vérifier `EXPO_PUBLIC_API_URL` dans `.env`
3. Redémarrer l'application

### Erreurs de build

1. Vérifier que toutes les dépendances sont installées
2. Nettoyer le cache : `npx expo start -c`
3. Vérifier la version de Node.js (20+)

### Problèmes de géolocalisation

1. Vérifier les permissions de localisation
2. Vérifier que la localisation est activée sur l'appareil
3. Tester sur un appareil physique (les émulateurs peuvent avoir des problèmes)

## 📚 Ressources

- [Documentation Expo](https://docs.expo.dev/)
- [Documentation React Native](https://reactnative.dev/)
- [Documentation Expo Router](https://docs.expo.dev/router/introduction/)
- [Documentation NativeWind](https://www.nativewind.dev/)

## 📞 Support

- 📧 Email : wekobrayan163@gmail.com
- 📱 WhatsApp : +237 690 37 44 20
- 🌐 Documentation complète : [README principal](../README.md)

## 📝 Licence

Copyright © 2025 FreeBike Cameroun. Tous droits réservés.
