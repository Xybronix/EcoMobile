# 📦 EecoMobile - Guide d'Installation Complet

Ce guide vous accompagne étape par étape pour installer et configurer EecoMobile.

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir :

- ✅ **Node.js 18+** - [Télécharger ici](https://nodejs.org/)
- ✅ **npm** (inclus avec Node.js) ou **yarn**
- ✅ **Git** - [Télécharger ici](https://git-scm.com/)
- ✅ Un éditeur de code (VS Code recommandé)

### Vérifier les installations

```bash
# Vérifier Node.js
node --version
# Devrait afficher v18.x.x ou supérieur

# Vérifier npm
npm --version
# Devrait afficher 9.x.x ou supérieur

# Vérifier Git
git --version
# Devrait afficher git version 2.x.x
```

---

## 🚀 Installation - Méthode 1 : Sans Backend (Frontend uniquement)

**Durée estimée : 3 minutes**

Cette méthode permet de tester l'interface sans avoir besoin de configurer le backend. Les données sont mockées.

### Étape 1 : Cloner le projet

```bash
git clone https://github.com/votre-org/ecomobile.git
cd ecomobile
```

### Étape 2 : Installer les dépendances

```bash
npm install
```

Attendez que l'installation se termine (1-2 minutes).

### Étape 3 : Démarrer l'application

```bash
npm run dev
```

Vous devriez voir :

```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Étape 4 : Ouvrir dans le navigateur

Ouvrez votre navigateur et allez sur :
```
http://localhost:5173
```

✅ **C'est tout !** L'application fonctionne avec des données de test.

**Limitations :**
- Les données ne persistent pas (rechargement = reset)
- Pas de vraie authentification
- Pas de connexion API réelle

---

## 🔧 Installation - Méthode 2 : Installation Complète (Frontend + Backend)

**Durée estimée : 10 minutes**

Cette méthode installe le backend complet avec base de données.

### Partie A : Installation du Frontend

#### Étape 1 : Cloner le projet

```bash
git clone https://github.com/votre-org/ecomobile.git
cd ecomobile
```

#### Étape 2 : Installer les dépendances

```bash
npm install
```

#### Étape 3 : Vérifier la configuration

Le fichier `.env` est déjà créé avec les bonnes valeurs :

```bash
cat .env
```

Vous devriez voir :
```env
VITE_API_URL=http://localhost:3000/api
VITE_NODE_ENV=development
...
```

✅ Tout est prêt pour le frontend !

---

### Partie B : Installation du Backend

#### Étape 1 : Naviguer vers le dossier backend

```bash
cd backend
```

#### Étape 2 : Installer les dépendances

```bash
npm install
```

Attendez que l'installation se termine (2-3 minutes).

#### Étape 3 : Vérifier la configuration

Le fichier `.env` est déjà créé :

```bash
cat .env
```

Vérifiez que vous voyez :
```env
PORT=3000
DATABASE_TYPE=sqlite
DATABASE_URL="file:./data/ecomobile.db"
JWT_SECRET=ecomobile-super-secret-key...
...
```

#### Étape 4 : Créer le dossier de données

```bash
mkdir -p data
```

#### Étape 5 : Générer Prisma Client

```bash
npx prisma generate
```

Vous devriez voir :
```
✔ Generated Prisma Client (x.x.x) to ./node_modules/@prisma/client
```

#### Étape 6 : Créer la base de données

```bash
npx prisma migrate dev --name init
```

Cette commande va :
- Créer le fichier `data/ecomobile.db` (SQLite)
- Créer toutes les tables nécessaires
- Appliquer le schéma Prisma

Vous devriez voir :
```
✔ Your database is now in sync with your schema.
```

#### Étape 7 : Peupler la base de données (optionnel mais recommandé)

```bash
npx prisma db seed
```

Vous verrez :
```
🌱 Starting database seeding...
🗑️  Cleared existing data
✅ Created users
✅ Created wallets
✅ Created transactions
✅ Created bikes
✅ Created rides
...
🎉 Database seeding completed successfully!

📝 Test Accounts:

👤 Admin:
   Email: admin@ecomobile.cm
   Password: admin123
...
```

✅ La base de données est prête avec des données de test !

#### Étape 8 : Démarrer le serveur backend

```bash
npm run dev
```

Vous devriez voir :
```
🚀 Server is running on http://localhost:3000
📚 API Documentation available at http://localhost:3000/api-docs
```

✅ **Le backend est opérationnel !**

---

### Partie C : Démarrer le Frontend

#### Étape 1 : Ouvrir un nouveau terminal

Gardez le terminal du backend ouvert et ouvrez un nouveau terminal.

#### Étape 2 : Naviguer vers le dossier racine

```bash
cd /chemin/vers/ecomobile
# (pas le dossier backend, mais la racine du projet)
```

#### Étape 3 : Démarrer le frontend

```bash
npm run dev
```

Vous devriez voir :
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

#### Étape 4 : Ouvrir dans le navigateur

```
http://localhost:5173
```

✅ **Installation complète terminée !**

---

## 🎉 Vérification de l'Installation

### Test 1 : Frontend accessible

- Ouvrez `http://localhost:5173`
- Vous devriez voir la page d'accueil EecoMobile

### Test 2 : Backend accessible

- Ouvrez `http://localhost:3000/api-docs`
- Vous devriez voir la documentation Swagger

### Test 3 : Connexion Admin

1. Sur `http://localhost:5173`, cliquez sur "Admin Login"
2. Entrez :
   - Email: `admin@ecomobile.cm`
   - Password: `admin123`
3. Cliquez sur "Se connecter"
4. ✅ Vous devriez être redirigé vers le Dashboard

### Test 4 : Connexion Mobile

1. Sur `http://localhost:5173`, cliquez sur "Ouvrir l'App"
2. Cliquez sur "Se connecter"
3. Entrez :
   - Email: `user@ecomobile.cm`
   - Password: `user123`
4. Cliquez sur "Se connecter"
5. ✅ Vous devriez voir votre profil avec 5000 FCFA de solde

### Test 5 : API via Swagger

1. Allez sur `http://localhost:3000/api-docs`
2. Cliquez sur "POST /api/auth/login"
3. Cliquez sur "Try it out"
4. Entrez :
   ```json
   {
     "email": "user@ecomobile.cm",
     "password": "user123"
   }
   ```
5. Cliquez sur "Execute"
6. ✅ Vous devriez recevoir un token JWT dans la réponse

---

## ⚙️ Configuration Avancée

### Utiliser MySQL au lieu de SQLite

#### 1. Installer MySQL

- Windows : [MySQL Installer](https://dev.mysql.com/downloads/installer/)
- Mac : `brew install mysql`
- Linux : `sudo apt install mysql-server`

#### 2. Créer la base de données

```bash
mysql -u root -p
```

```sql
CREATE DATABASE ecomobile;
EXIT;
```

#### 3. Modifier `backend/.env`

```env
DATABASE_TYPE=mysql
DATABASE_URL="mysql://root:password@localhost:3306/ecomobile"
```

Remplacez `password` par votre mot de passe MySQL.

#### 4. Modifier `backend/prisma/schema.prisma`

```prisma
datasource db {
  provider = "mysql"  // Au lieu de "sqlite"
  url      = env("DATABASE_URL")
}
```

#### 5. Relancer les migrations

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

---

### Configurer les Emails

Pour activer l'envoi d'emails réels :

#### 1. Créer un mot de passe d'application Gmail

1. Allez sur votre compte Google
2. Sécurité → Validation en deux étapes → Mots de passe des applications
3. Créez un mot de passe pour "EecoMobile"
4. Copiez le mot de passe généré (16 caractères)

#### 2. Modifier `backend/.env`

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop  # Mot de passe d'application
EMAIL_FROM=EecoMobile <noreply@ecomobile.cm>
```

#### 3. Redémarrer le backend

```bash
# Dans le terminal du backend
# Ctrl+C pour arrêter
npm run dev
```

✅ Les emails seront maintenant envoyés lors de l'inscription, réinitialisation de mot de passe, etc.

---

### Configurer My-CoolPay

Pour les paiements réels :

#### 1. Obtenir vos clés API

- Créez un compte sur [My-CoolPay](https://my-coolpay.com)
- Allez dans Paramètres → API
- Copiez votre API Key et Merchant ID

#### 2. Modifier `backend/.env`

```env
COOLPAY_API_URL=https://api.my-coolpay.com
COOLPAY_API_KEY=votre-vraie-api-key
COOLPAY_MERCHANT_ID=votre-merchant-id
COOLPAY_WEBHOOK_SECRET=votre-webhook-secret
```

#### 3. Redémarrer le backend

```bash
npm run dev
```

✅ Les paiements seront maintenant traités en réel via My-CoolPay.

---

## 🛠️ Outils Utiles

### Prisma Studio (Interface graphique pour la DB)

```bash
cd backend
npx prisma studio
```

Ouvrez `http://localhost:5555` pour voir et modifier la base de données visuellement.

### Voir les logs du backend

Les logs sont affichés dans le terminal et sauvegardés dans `backend/logs/`

### Nettoyer la base de données

```bash
cd backend
npx prisma migrate reset
# Puis re-seed
npx prisma db seed
```

---

## 🐛 Dépannage

### Problème : `Cannot find module '@prisma/client'`

**Solution :**
```bash
cd backend
npx prisma generate
```

---

### Problème : `Port 3000 already in use`

**Solution 1 : Changer le port**

Modifier `backend/.env` :
```env
PORT=3001
```

Modifier `.env` (frontend) :
```env
VITE_API_URL=http://localhost:3001/api
```

**Solution 2 : Tuer le processus sur le port 3000**

```bash
# Mac/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

### Problème : `ECONNREFUSED` lors de la connexion API

**Causes possibles :**
1. Le backend n'est pas démarré
2. Mauvaise URL dans `.env`

**Solution :**
1. Vérifier que le backend tourne : `http://localhost:3000/api-docs`
2. Vérifier `.env` : `VITE_API_URL=http://localhost:3000/api`
3. Redémarrer le frontend après modification de `.env`

---

### Problème : Les données ne persistent pas

**Cause :** Vous utilisez les données mockées au lieu de l'API

**Solution :** Vérifiez que :
1. Le backend est démarré
2. `.env` contient `VITE_API_URL=http://localhost:3000/api`
3. Vous avez redémarré le frontend après avoir créé `.env`

---

## 📚 Ressources

- [QUICKSTART.md](QUICKSTART.md) - Guide de démarrage rapide
- [README.md](README.md) - Documentation complète
- [backend/README.md](backend/README.md) - Documentation backend
- [ADMIN_README.md](ADMIN_README.md) - Guide admin
- [MOBILE_README.md](MOBILE_README.md) - Guide mobile

---

## 🆘 Besoin d'aide ?

- 📧 Email : wekobrayan163@gmail.com
- 💬 GitHub Issues : [Créer une issue](https://github.com/votre-org/ecomobile/issues)
- 📱 WhatsApp : +237 690 37 44 20

---

**Bonne installation ! 🚀**
