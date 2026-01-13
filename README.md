```markdown
<div align="center">

# 🧴 JakartaEE Parfumerie

**Application e-commerce full-stack “Parfumerie”**  
Backend Jakarta EE (Payara Micro) + PostgreSQL + Frontend React (Vite)

[![Backend Status](https://img.shields.io/badge/Backend-Payara%20Micro-brightgreen?style=flat&logo=java)](https://jakarta.ee/)
[![Frontend Status](https://img.shields.io/badge/Frontend-React%20Vite-blue?style=flat&logo=react)](https://react.dev/)
[![Database](https://img.shields.io/badge/DB-PostgreSQL-blue?style=flat&logo=postgresql)](https://www.postgresql.org/)

[🚀 Démo Live](http://localhost:5173) | [📖 API Docs](http://localhost:8080/starter/api/application.wadl)

</div>

## ✨ Fonctionnalités

- 🛒 Catalogue parfums (recherche, filtres, détail)
- 🧑‍💼 Espace client (connexion, panier, commandes)
- 👨‍💼 Admin (gestion parfums/commandes)
- 💾 Base de données PostgreSQL avec seed automatique
- 📱 Responsive design
- 🔒 Authentification JWT + rôles (ADMIN/CLIENT)

## 🛠️ Stack Technique

| **Backend** | **Frontend** | **Base de données** |
|-------------|--------------|---------------------|
| Jakarta EE 11 | React 18 | PostgreSQL 16 |
| JAX-RS | Vite | JPA/EclipseLink |
| Payara Micro | TailwindCSS | ActiveMQ Artemis |

## 🚀 Lancement Rapide (Docker)

À la racine du projet :

```bash
# Clone & lance tout
git clone <ton-repo>
cd jakartaee-parfumerie
docker compose up -d --build
```

✅ **Frontend** : `http://localhost:5173`  
✅ **Backend/API** : `http://localhost:8080/starter/api`  
✅ **Base de données** : Auto-créée (seedée)

```bash
# Arrêter
docker compose down
```

## 📱 Utilisation

### Comptes de démonstration (seedés automatiquement)
| **Type** | **Email** | **Mot de passe** |
|----------|-----------|------------------|
| **ADMIN** | `admin@parfumerie.local` | `admin123` |
| **CLIENT** | `client@parfumerie.local` | `client123` |

### APIs principales
```
GET    /api/perfumes          → Liste parfums
POST   /api/auth/login        → Connexion
POST   /api/users             → Inscription client
POST   /api/orders            → Créer commande
```

## 🏗️ Installation manuelle

### Backend (Payara Micro)
```bash
cd backend
mvn clean package
java -jar target/jakartaee-parfumerie-microbundle.jar
```

### Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

## 📁 Structure du projet

```
jakartaee-parfumerie/
├── backend/                 # Jakarta EE API
│   ├── src/main/java/com/parfumerie/
│   │   ├── domain/         # Entités JPA
│   │   ├── rest/           # Ressources JAX-RS
│   │   └── bootstrap/      # DataSeeder (données auto)
│   └── pom.xml
├── frontend/                # React + Vite
├── docker-compose.yml
└── README.md
```

## 🔧 Prérequis

```bash
# Docker & Docker Compose
docker --version
docker compose version

# Java 21 + Maven
java --version
mvn --version

# Node.js 18+ + npm
node --version
npm --version
```

