# 🚴 EcoMobile - Système de Location de Vélos Électriques

Application complète de gestion de location de vélos électriques pour le Cameroun, avec interface web admin, application mobile progressive (PWA) et backend Node.js robuste.

## 📋 Table des Matières

- [Vue d'ensemble](#vue-densemble)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Installation](#installation)
- [Structure du Projet](#structure-du-projet)
- [Fonctionnalités](#fonctionnalités)
- [Documentation](#documentation)

## 🎯 Vue d'ensemble

**EcoMobile** est une solution complète de micro-mobilité qui permet aux utilisateurs de :
- 🚲 Louer des vélos électriques via une application mobile
- 💰 Gérer leur portefeuille et effectuer des paiements via My-CoolPay
- 🗺️ Localiser les vélos disponibles en temps réel
- 📱 Scanner des QR codes pour déverrouiller les vélos
- 💬 Contacter le support client directement dans l'app

Et aux administrateurs de :
- 📊 Suivre la flotte en temps réel
- 👥 Gérer les utilisateurs et les employés
- 💸 Analyser les revenus et statistiques
- 🔧 Gérer la maintenance des vélos
- 📧 Envoyer des emails en masse

## 🏗️ Architecture

Le projet est divisé en **3 parties principales** :

```
EcoMobile/
├── backend/    # API Node.js + TypeScript
├── frontend/   # Interface Web Admin (React)
└── mobile/     # Application Mobile PWA (React)
```

### Schéma d'architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  Mobile App     │      │   Admin Web     │      │   Backend API   │
│  (React PWA)    │─────▶│   (React)       │─────▶│  (Node.js)      │
│                 │      │                 │      │                 │
│  - Utilisateurs │      │  - Admins       │      │  - Auth JWT     │
│  - Location     │      │  - Dashboard    │      │  - Multi-DB     │
│  - Paiement     │      │  - Gestion      │      │  - i18n         │
│  - Chat         │      │  - Analytics    │      │  - Emails       │
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
- **Node.js 18+** - Runtime JavaScript
- **TypeScript** - Typage statique
- **Express.js** - Framework web
- **Prisma** - ORM multi-database
- **JWT** - Authentification
- **Swagger** - Documentation API
- **Nodemailer** - Envoi d'emails
- **Joi** - Validation des données

### Frontend
- **React 18+** - UI Library
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styling
- **Radix UI** - Composants accessibles
- **Recharts** - Graphiques
- **Lucide** - Icons
- **React Hook Form** - Gestion des formulaires
- **Sonner** - Toasts/notifications

### Services Externes
- **My-CoolPay** - Paiements mobiles (Orange Money, MTN, etc.)
- **SMTP** - Envoi d'emails
- **Geolocation API** - Localisation

## 🚀 Installation

### Prérequis

- **Node.js 18+**
- **npm** ou **yarn**
- **MySQL**, **PostgreSQL** ou **SQLite**

### Installation Rapide (5 minutes)

#### 1. Cloner le repository
```bash
git clone https://github.com/votre-org/EcoMobile.git
cd EcoMobile
```

#### 2. Installer et démarrer le Backend

```bash
cd backend
npm install

# Copier et configurer .env
cp .env.example .env
# Éditer .env et configurer au minimum :
# - DATABASE_TYPE=sqlite (pour démarrer rapidement)
# - JWT_SECRET=votre-secret-key
# - EMAIL_* (si vous voulez tester les emails)

# Initialiser la base de données
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed  # (optionnel) Données de test

# Démarrer le serveur
npm run dev
```

✅ Le backend démarre sur `http://localhost:3000`  
✅ Documentation Swagger disponible sur `http://localhost:3000/api-docs`

#### 3. Installer et démarrer le Frontend

```bash
# Dans un nouveau terminal, retourner au dossier racine
cd ..

# Installer les dépendances
npm install

# Copier et configurer .env
cp .env.example .env
# Par défaut, VITE_API_URL=http://localhost:3000/api

# Démarrer l'application
npm run dev
```

✅ Le frontend démarre sur `http://localhost:5173`

#### 4. Accéder aux interfaces

**Site Vitrine**
```
http://localhost:5173
```

**Application Mobile (PWA)**
```
http://localhost:5173
Puis cliquer sur "Ouvrir l'App" dans le header
```

**Interface Admin**
```
http://localhost:5173
Puis cliquer sur "Admin Login" dans le header
```

**Swagger API Documentation**
```
http://localhost:3000/api-docs
```

### Comptes de Test (Développement)

Une fois le backend démarré avec les données de seed :

**Admin**
- Email: `admin@ecomobile.cm`
- Password: `admin123`

**Utilisateur Mobile**
- Email: `user@ecomobile.cm`
- Password: `user123`

**Manager**
- Email: `manager@ecomobile.cm`
- Password: `manager123`

### Variables d'Environnement

#### Backend (.env)
```env
# Serveur
PORT=3000
NODE_ENV=development

# Base de données
DATABASE_TYPE=mysql
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=EcoMobile
DATABASE_USER=root
DATABASE_PASSWORD=

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-password

# My-CoolPay
COOLPAY_API_KEY=your-api-key
COOLPAY_MERCHANT_ID=your-merchant-id
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

## 📁 Structure du Projet

```
EcoMobile/
│
├── backend/                      # Backend Node.js
│   ├── src/
│   │   ├── config/              # Configuration (DB, Swagger)
│   │   ├── controllers/         # Contrôleurs HTTP
│   │   ├── services/            # Logique métier
│   │   ├── repositories/        # Accès aux données (Pattern Repository)
│   │   ├── middleware/          # Auth, i18n, rate limiting, etc.
│   │   ├── routes/              # Routes API
│   │   ├── models/              # Types TypeScript
│   │   ├── locales/             # Traductions (fr/en)
│   │   └── server.ts            # Point d'entrée
│   ├── prisma/
│   │   └── schema.prisma        # Schéma de base de données
│   └── package.json
│
├── components/                   # Interface Web Admin
│   ├── Dashboard.tsx            # Tableau de bord principal
│   ├── BikeManagement.tsx       # Gestion des vélos
│   ├── UserManagement.tsx       # Gestion des utilisateurs
│   ├── FinancialDashboard.tsx   # Analytics financières
│   ├── AdminChat.tsx            # Chat support
│   ├── Sidebar.tsx              # Navigation latérale
│   ├── AdminTopBar.tsx          # Barre supérieure
│   └── ...                      # Autres composants admin
│
├── components/mobile/            # Application Mobile PWA
│   ├── MobileApp.tsx            # App principale + navigation
│   ├── MobileHome.tsx           # Page d'accueil
│   ├── MobileBikeMap.tsx        # Carte des vélos
│   ├── MobileQRScanner.tsx      # Scanner QR
│   ├── MobileRideInProgress.tsx # Trajet en cours
│   ├── MobileWallet.tsx         # Portefeuille
│   ├── MobileChat.tsx           # Chat support
│   ├── MobileProfile.tsx        # Profil utilisateur
│   └── ...                      # Autres composants mobile
│
├── components/landing/           # Site vitrine
│   ├── Hero.tsx                 # Section héro
│   ├── Features.tsx             # Fonctionnalités
│   ├── Pricing.tsx              # Tarifs
│   └── ...                      # Autres sections
│
├── lib/                          # Utilitaires partagés
│   ├── api-client.ts            # Client API (connexion backend)
│   ├── auth.tsx                 # Contexte d'authentification admin
│   ├── mobile-auth.tsx          # Contexte d'authentification mobile
│   ├── i18n.tsx                 # i18n admin
│   ├── mobile-i18n.tsx          # i18n mobile
│   └── types.ts                 # Types TypeScript
│
├── App.tsx                       # Point d'entrée frontend
└── README.md                     # Ce fichier
```

## ✨ Fonctionnalités

### 📱 Application Mobile (Utilisateurs)

#### Authentification
- ✅ Inscription avec email/téléphone
- ✅ Connexion sécurisée
- ✅ Réinitialisation de mot de passe
- ✅ Vérification d'email
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

#### Employés & Rôles
- 👨‍💼 Gestion des employés
- 🔐 Système de rôles et permissions
- 📝 Logs d'activité (audit trail)

#### Support
- 💬 Chat avec les utilisateurs
- 🎫 Système de tickets
- 📧 Emails en masse
- 🔔 Gestion des notifications

### 🔧 Backend API

#### Authentification & Sécurité
- 🔐 JWT avec refresh tokens
- 🛡️ Rate limiting intelligent
- 🔒 Hachage bcrypt
- ✅ Validation Joi
- 📝 Audit logs complet

#### Base de Données
- 🗄️ Support MySQL, PostgreSQL, SQLite
- 🔄 Migrations Prisma
- 🏗️ Pattern Repository (abstraction DB)
- 📊 Indexation optimisée

#### Paiements
- 💳 Intégration My-CoolPay
- 💰 Gestion frais (CoolPay + Orange)
- 🔄 Webhooks de confirmation
- 💸 Remboursements automatiques

#### Notifications & Emails
- 📧 Templates d'emails (inscription, factures, etc.)
- 📨 Envoi en masse
- 🔔 Notifications push
- 🌍 Support multilingue (FR/EN)

#### Fonctionnalités Avancées
- 🗺️ Géofencing (zones autorisées)
- ⭐ Système d'évaluation
- 🎟️ Codes promo
- 🏥 Health check endpoint
- 📊 Statistiques avancées

## 📚 Documentation

### Guides Spécifiques

- **[Backend README](backend/BACKEND_README.md)** - Documentation complète de l'API Node.js
- **[Admin README](ADMIN_README.md)** - Guide de l'interface d'administration
- **[Mobile README](MOBILE_README.md)** - Guide de l'application mobile

### API Documentation

Une fois le backend démarré, accéder à Swagger UI :
```
http://localhost:3000/api-docs
```

### Guides de Développement

#### Ajouter une nouvelle fonctionnalité Backend

1. Créer le service dans `backend/src/services/`
2. Créer le repository dans `backend/src/repositories/`
3. Créer le contrôleur dans `backend/src/controllers/`
4. Ajouter les routes dans `backend/src/routes/`
5. Mettre à jour Swagger
6. Ajouter les traductions dans `locales/`

#### Créer un nouveau composant Frontend

1. Créer le composant dans `frontend/src` ou `mobile/components`
2. Utiliser les hooks d'authentification (`useAuth` ou `useMobileAuth`)
3. Utiliser i18n (`useTranslation` ou `useMobileI18n`)
4. Connecter aux APIs via `lib/api-client.ts`
5. Ajouter les traductions nécessaires

## 🧪 Tests

```bash
# Tests backend
cd backend
npm test

# Tests frontend
npm test
```

## 🚀 Déploiement

### Backend

```bash
cd backend
npm run build
NODE_ENV=production npm start
```

### Frontend

```bash
npm run build
# Les fichiers de build sont dans dist/
```

### Docker (Optionnel)

```bash
docker-compose up -d
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Copyright © 2025 EcoMobile Cameroun. Tous droits réservés.

## 📞 Support

- 📧 Email : wekobrayan163@gmail.com
- 📱 WhatsApp : +237 690 37 44 20
- 🌐 Site web : https://brayan-weko.dev

---

Développé avec ❤️ par Brayan Weko pour la mobilité urbaine au Cameroun 🇨🇲
