# 🚴 FreeBike - Système de Location de Vélos Électriques

Application complète de gestion de location de vélos électriques pour le Cameroun, avec interface web admin, application mobile et backend Node.js robuste.

## 📋 Table des Matières

- [Vue d'ensemble](#vue-densemble)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Installation](#installation)
- [Structure du Projet](#structure-du-projet)
- [Fonctionnalités](#fonctionnalités)
- [Déploiement](#déploiement)
- [Documentation](#documentation)
- [Support](#support)

## 🎯 Vue d'ensemble

**FreeBike** est une solution complète de micro-mobilité qui permet aux utilisateurs de :
- 🚲 Louer des vélos électriques via une application mobile
- 💰 Gérer leur portefeuille et effectuer des paiements via My-CoolPay
- 🗺️ Localiser les vélos disponibles en temps réel
- 📱 Scanner des QR codes pour déverrouiller les vélos
- 💬 Contacter le support client directement dans l'app
- ⭐ Soumettre des avis et témoignages

Et aux administrateurs de :
- 📊 Suivre la flotte en temps réel
- 👥 Gérer les utilisateurs et les employés
- 💸 Analyser les revenus et statistiques
- 🔧 Gérer la maintenance des vélos
- 📧 Envoyer des emails en masse
- ⚙️ Configurer les tarifs et promotions

## 🏗️ Architecture

Le projet est divisé en **3 parties principales** :

```
FreeBike/
├── backend/    # API Node.js + TypeScript + Prisma
├── frontend/   # Interface Web Admin + Site Vitrine (React + Vite)
└── mobile/     # Application Mobile (React Native + Expo)
```

### Schéma d'architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  Mobile App     │      │   Frontend Web  │      │   Backend API   │
│  (Expo/RN)      │─────▶│   (React+Vite)  │─────▶│  (Node.js+TS)   │
│                 │      │                 │      │                 │
│  - Utilisateurs │      │  - Admin Panel  │      │  - Auth JWT     │
│  - Location     │      │  - Landing Page│      │  - Multi-DB     │
│  - Paiement     │      │  - Reviews Page │      │  - i18n         │
│  - Chat         │      │  - Dashboard    │      │  - Emails/SMS   │
└─────────────────┘      └─────────────────┘      └─────────────────┘
                                                           │
                                                           ▼
                                                   ┌─────────────────┐
                                                   │   Databases     │
                                                   │  MySQL/PG/SQLite│
                                                   └─────────────────┘
```

## 🛠️ Technologies

### Backend
- **Node.js 20+** - Runtime JavaScript
- **TypeScript 5.9+** - Typage statique
- **Express.js 4.18+** - Framework web
- **Prisma 6.19+** - ORM multi-database (MySQL, PostgreSQL, SQLite)
- **JWT** - Authentification avec refresh tokens
- **Swagger** - Documentation API interactive
- **Nodemailer** - Envoi d'emails
- **Twilio** - Envoi de SMS
- **Joi** - Validation des données
- **Socket.io** - Communication temps réel
- **i18next** - Internationalisation (FR/EN)

### Frontend
- **React 19+** - UI Library
- **TypeScript** - Typage statique
- **Vite 6.4+** - Build tool et dev server
- **Tailwind CSS** - Styling utility-first
- **Radix UI** - Composants accessibles
- **Recharts** - Graphiques et visualisations
- **Lucide React** - Icons
- **React Hook Form** - Gestion des formulaires
- **Sonner** - Toasts/notifications
- **React Router** - Navigation
- **Leaflet** - Cartes interactives

### Mobile
- **React Native 0.81+** - Framework mobile
- **Expo 54+** - Outils et services
- **Expo Router** - Navigation basée sur les fichiers
- **NativeWind** - Tailwind CSS pour React Native
- **Expo Location** - Géolocalisation
- **Expo Image Picker** - Sélection d'images

## 🚀 Installation

### Prérequis

- **Node.js 20+** ([Télécharger](https://nodejs.org/))
- **npm** ou **yarn**
- **MySQL**, **PostgreSQL** ou **SQLite** (pour le backend)
- **Git**

### Installation Rapide

#### 1. Cloner le repository

```bash
git clone https://github.com/Xybronix/EcoMobile.git
cd EcoMobile
```

#### 2. Installer et démarrer le Backend

```bash
cd backend
npm install

# Copier et configurer .env
cp .env.example .env
# Éditer .env et configurer au minimum :
# - DB_TYPE=mysql (ou sqlite pour développement rapide)
# - JWT_SECRET=votre-secret-key
# - MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE

# Générer Prisma Client
npx prisma generate

# Créer la base de données et appliquer les migrations
npx prisma migrate dev --name init

# Seed la base de données (crée les données initiales)
npm run db:seed

# Démarrer le serveur en développement
npm run dev
```

✅ Le backend démarre sur `http://localhost:10000`  
✅ Documentation Swagger disponible sur `http://localhost:10000/api-docs`

#### 3. Installer et démarrer le Frontend

```bash
# Dans un nouveau terminal, retourner au dossier racine
cd ../frontend

# Installer les dépendances
npm install

# Créer le fichier .env
cat > .env << EOF
VITE_API_URL=http://localhost:10000/api/v1
VITE_APP_DOWNLOAD_URL=
VITE_APP_NAME=FreeBike
EOF

# Démarrer l'application
npm run dev
```

✅ Le frontend démarre sur `http://localhost:3000`

#### 4. Accéder aux interfaces

**Site Vitrine**
```
http://localhost:3000
```

**Interface Admin**
```
http://localhost:3000/login
```

**Swagger API Documentation**
```
http://localhost:10000/api-docs
```

### Comptes de Test (Développement)

Une fois le backend démarré avec les données de seed :

**Admin**
- Email: `admin@freebike.cm`
- Password: `admin123`

**Manager**
- Email: `manager@freebike.cm`
- Password: `admin123`

**Utilisateur Mobile**
- Email: `user@freebike.cm`
- Password: `user123`

**Support**
- Email: `support@freebike.cm`
- Password: `admin123`

## 📁 Structure du Projet

```
FreeBike/
│
├── backend/                      # Backend Node.js + TypeScript
│   ├── src/
│   │   ├── config/              # Configuration (DB, Swagger, Prisma)
│   │   ├── controllers/         # Contrôleurs HTTP (13 fichiers)
│   │   ├── services/            # Logique métier (32 fichiers)
│   │   ├── repositories/        # Accès aux données (Pattern Repository)
│   │   ├── middleware/          # Auth, i18n, rate limiting, validation
│   │   ├── routes/              # Routes API (16 fichiers)
│   │   ├── models/              # Types TypeScript
│   │   ├── locales/             # Traductions (fr.json, en.json)
│   │   ├── types/               # Types Express personnalisés
│   │   ├── utils/               # Utilitaires
│   │   └── server.ts            # Point d'entrée
│   ├── prisma/
│   │   ├── schema.prisma        # Schéma de base de données
│   │   ├── migrations/          # Migrations Prisma
│   │   └── seed.ts              # Seed intelligent (production-safe)
│   ├── scripts/                 # Scripts utilitaires
│   ├── uploads/                 # Fichiers uploadés
│   └── package.json
│
├── frontend/                     # Frontend React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/           # Composants admin (Dashboard, Bikes, Users, etc.)
│   │   │   ├── landing/         # Site vitrine (Hero, Features, Pricing, etc.)
│   │   │   ├── auth/            # Authentification
│   │   │   ├── layout/          # Layouts (AdminLayout, Sidebar, TopBar)
│   │   │   ├── ui/              # Composants UI réutilisables (shadcn/ui)
│   │   │   └── shared/          # Composants partagés
│   │   ├── services/            # Services API (21 fichiers)
│   │   ├── hooks/               # Hooks React personnalisés
│   │   ├── lib/                 # Utilitaires (i18n, etc.)
│   │   ├── contexts/            # Contextes React
│   │   ├── types/               # Types TypeScript
│   │   ├── utils/               # Fonctions utilitaires
│   │   ├── styles/              # Styles globaux
│   │   ├── App.tsx              # Point d'entrée React
│   │   └── main.tsx             # Bootstrap React
│   ├── public/                  # Fichiers statiques
│   ├── vite.config.ts           # Configuration Vite
│   └── package.json
│
├── mobile/                       # Application Mobile Expo
│   ├── app/                     # Routes (Expo Router)
│   │   ├── (auth)/             # Routes d'authentification
│   │   ├── (tabs)/             # Navigation par onglets
│   │   └── (modals)/           # Modales
│   ├── components/              # Composants React Native (65 fichiers)
│   ├── services/                # Services API (18 fichiers)
│   ├── hooks/                   # Hooks personnalisés
│   ├── lib/                     # Utilitaires
│   ├── constants/               # Constantes (fonts, theme)
│   ├── types/                   # Types TypeScript
│   ├── utils/                   # Fonctions utilitaires
│   ├── assets/                  # Images, fonts, etc.
│   ├── app.json                 # Configuration Expo
│   └── package.json
│
├── .github/
│   ├── workflows/
│   │   ├── sync-backend.yml     # Sync automatique vers FreeBike-backend
│   │   ├── sync-frontend.yml   # Sync automatique vers FreeBike-frontend
│   │   └── deploy-frontend.yml # Déploiement automatique sur GitHub Pages
│   ├── SYNC_SETUP.md           # Guide de configuration de synchronisation
│   └── DEPLOY_FRONTEND.md      # Guide de déploiement frontend
│
├── README.md                    # Ce fichier
└── .gitignore
```

## ✨ Fonctionnalités

### 📱 Application Mobile (Utilisateurs)

#### Authentification
- ✅ Inscription avec email/téléphone
- ✅ Connexion sécurisée
- ✅ Réinitialisation de mot de passe
- ✅ Vérification d'email/SMS
- ✅ Support bilingue (FR/EN)

#### Location de Vélos
- 🚲 Carte interactive avec vélos disponibles en temps réel
- 🔍 Filtres : distance, batterie, type de vélo
- 📸 Scanner QR code pour déverrouiller
- 🔐 Inspection avant/après trajet (photos)
- ⏱️ Chronomètre de trajet en temps réel
- 📍 Géolocalisation et navigation

#### Portefeuille
- 💰 Solde en temps réel
- 💳 Recharge via My-CoolPay (Orange Money, MTN)
- 📊 Historique des transactions
- 🧾 Factures téléchargeables

#### Profil & Historique
- 👤 Gestion du profil
- 📜 Historique des trajets
- 🔔 Notifications personnalisées
- 💬 Chat avec le support
- 🌍 Changement de langue (FR/EN)

### 💼 Interface Admin (Web)

#### Dashboard
- 📊 Vue d'ensemble temps réel
- 🗺️ Carte de la flotte
- 📈 Statistiques clés (revenus, utilisateurs, trajets)
- ⚠️ Alertes et incidents

#### Gestion des Vélos
- ➕ Ajout/modification/suppression
- 🔋 Suivi batterie et état
- 🛠️ Planification maintenance
- 📍 Tracking GPS temps réel
- 📊 Historique d'utilisation
- 🔓 Gestion des déverrouillages

#### Gestion des Utilisateurs
- 👥 Liste paginée avec recherche
- 🔍 Détails utilisateur (trajets, wallet, etc.)
- 🚫 Blocage/déblocage de comptes
- 📧 Envoi d'emails personnalisés

#### Finances
- 💰 Revenus journaliers/mensuels
- 📈 Graphiques de performance
- 💸 Gestion des remboursements
- 🎟️ Codes promo et vouchers
- 📊 Analytics avancées

#### Employés & Rôles
- 👨‍💼 Gestion des employés
- 🔐 Système de rôles et permissions granulaire
- 📝 Logs d'activité (audit trail)

#### Support
- 💬 Chat avec les utilisateurs
- 🎫 Système de tickets
- 📧 Emails en masse
- 🔔 Gestion des notifications

#### Avis & Témoignages
- ⭐ Gestion des avis utilisateurs
- ✅ Modération et publication
- 📊 Statistiques de satisfaction

### 🌐 Site Vitrine

- 🏠 Page d'accueil avec Hero section
- ✨ Présentation des fonctionnalités
- 💰 Affichage des tarifs dynamiques
- 📱 Section téléchargement de l'app
- ⭐ Témoignages utilisateurs
- 📝 Formulaire de soumission d'avis
- 🌍 Support multilingue (FR/EN)

### 🔧 Backend API

#### Authentification & Sécurité
- 🔐 JWT avec refresh tokens
- 🛡️ Rate limiting intelligent
- 🔒 Hachage bcrypt
- ✅ Validation Joi
- 📝 Audit logs complet
- 🔐 Système de permissions granulaire

#### Base de Données
- 🗄️ Support MySQL, PostgreSQL, SQLite
- 🔄 Migrations Prisma
- 🏗️ Pattern Repository (abstraction DB)
- 📊 Indexation optimisée
- 🌱 Seed intelligent (production-safe)

#### Paiements
- 💳 Intégration My-CoolPay
- 💰 Gestion frais (CoolPay + Orange)
- 🔄 Webhooks de confirmation
- 💸 Remboursements automatiques

#### Notifications & Communications
- 📧 Templates d'emails (inscription, factures, etc.)
- 📨 Envoi en masse
- 📱 Envoi de SMS (Twilio)
- 🔔 Notifications push
- 🌍 Support multilingue (FR/EN)

#### Fonctionnalités Avancées
- 🗺️ Géofencing (zones autorisées)
- ⭐ Système d'évaluation
- 🎟️ Codes promo et promotions
- 🏥 Health check endpoint
- 📊 Statistiques avancées
- 💬 Chat en temps réel (Socket.io)

## 🚀 Déploiement

### Backend

#### Production

```bash
cd backend
npm run build
npm start
```

Le script `start` exécute automatiquement :
1. Build TypeScript
2. Migration de la base de données (`prisma db push`)
3. Seed intelligent (crée uniquement les éléments manquants)
4. Démarrage du serveur

**Variables d'environnement requises** :
```env
NODE_ENV=production
PORT=10000
DB_TYPE=mysql
MYSQL_HOST=votre-host
MYSQL_USER=votre-user
MYSQL_PASSWORD=votre-password
MYSQL_DATABASE=ecomobile_db
JWT_SECRET=votre-secret-jwt
```

### Frontend

#### Développement

```bash
cd frontend
npm run dev
```

#### Production (Build)

```bash
cd frontend
npm run build
npm start
```

Le build est dans le dossier `build/`.

#### Déploiement automatique sur GitHub Pages

Un workflow GitHub Actions est configuré pour déployer automatiquement le frontend sur GitHub Pages lors d'un push sur `main` qui modifie `frontend/**`.

Voir [.github/DEPLOY_FRONTEND.md](.github/DEPLOY_FRONTEND.md) pour plus de détails.

**Variables d'environnement** (à ajouter comme secrets GitHub) :
- `VITE_API_URL` : URL de l'API backend
- `VITE_APP_DOWNLOAD_URL` : URL de téléchargement de l'app mobile
- `VITE_APP_NAME` : Nom de l'application

### Mobile

#### Développement

```bash
cd mobile
npm start
# ou
npx expo start
```

#### Build de production

```bash
# Android
npx expo build:android

# iOS
npx expo build:ios
```

## 🔄 Synchronisation Automatique

Le projet principal `EcoMobile` est synchronisé automatiquement avec deux dépôts séparés :
- `EcoMobile-backend` : Contenu du dossier `backend/`
- `EcoMobile-frontend` : Contenu du dossier `frontend/`

Voir [.github/SYNC_SETUP.md](.github/SYNC_SETUP.md) pour la configuration.

## 📚 Documentation

### Guides Spécifiques

- **[Backend README](backend/README.md)** - Documentation complète de l'API Node.js
- **[Frontend README](frontend/README.md)** - Guide de l'interface d'administration
- **[Mobile README](mobile/README.md)** - Guide de l'application mobile

### API Documentation

Une fois le backend démarré, accéder à Swagger UI :
```
http://localhost:10000/api-docs
```

### Guides de Développement

#### Ajouter une nouvelle fonctionnalité Backend

1. Créer le service dans `backend/src/services/`
2. Créer le repository dans `backend/src/repositories/`
3. Créer le contrôleur dans `backend/src/controllers/`
4. Ajouter les routes dans `backend/src/routes/`
5. Mettre à jour Swagger dans `backend/src/config/swagger.ts`
6. Ajouter les traductions dans `backend/src/locales/`

#### Créer un nouveau composant Frontend

1. Créer le composant dans `frontend/src/components/`
2. Utiliser les hooks d'authentification (`useAuth`)
3. Utiliser i18n (`useI18n`)
4. Connecter aux APIs via `frontend/src/services/api/`
5. Ajouter les traductions dans `frontend/src/lib/i18n.tsx`

## 🧪 Scripts npm

### Backend

```bash
npm run dev          # Démarrage en développement (nodemon)
npm run build        # Compilation TypeScript
npm start            # Démarrage en production (build + migrate + seed + start)
npm run db:seed      # Exécuter le seed
npm run migrate      # Migration Prisma (dev)
npm run migrate:deploy # Migration Prisma (production)
```

### Frontend

```bash
npm run dev          # Démarrage en développement (Vite)
npm run build        # Build de production
npm start            # Serveur de production (serve)
npm run deploy       # Déploiement manuel sur GitHub Pages
```

### Mobile

```bash
npm start            # Démarrage Expo
npm run android      # Build Android
npm run ios          # Build iOS
npm run web          # Version web
```

## 🔐 Variables d'Environnement

### Backend (.env)

```env
# Serveur
PORT=10000
NODE_ENV=production

# Base de données
DB_TYPE=mysql
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=ecomobile_db
MYSQL_USER=root
MYSQL_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# My-CoolPay
COOLPAY_API_URL=https://api.my-coolpay.com
COOLPAY_API_KEY=your-api-key
COOLPAY_MERCHANT_ID=your-merchant-id

# CORS
CORS_ORIGIN=https://votre-frontend.com,http://localhost:3000
```

### Frontend (.env)

```env
VITE_API_URL=https://env-freebike-xybronix.hidora.com/api/v1
VITE_APP_DOWNLOAD_URL=https://expo.dev/artifacts/...
VITE_APP_NAME=FreeBike
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📞 Support

- 📧 Email : wekobrayan163@gmail.com
- 📱 WhatsApp : +237 690 37 44 20
- 🌐 Site web : https://brayan-weko.dev
- 🐛 Issues : [GitHub Issues](https://github.com/Xybronix/EcoMobile/issues)

## 📄 Licence

Copyright © 2025 FreeBike Cameroun. Tous droits réservés.

---

Développé avec ❤️ par Brayan Weko pour la mobilité urbaine au Cameroun 🇨🇲
