# JakartaEE Parfumerie — Full Stack

Application e-commerce “Parfumerie” avec backend Jakarta EE (Payara Micro) + PostgreSQL + frontend React (Vite).

## Stack
- Backend: Jakarta EE (JAX-RS, JPA/EclipseLink), Payara Micro
- DB: PostgreSQL
- Messaging: ActiveMQ Artemis
- Frontend: React + Vite

## URLs
- Backend base: `http://localhost:8080/starter`
- API base: `http://localhost:8080/starter/api`
- WADL (liste des endpoints): `http://localhost:8080/starter/api/application.wadl`
- Frontend: `http://localhost:5173`

## Prérequis
- Docker + Docker Compose
- Java 21 + Maven
- Node.js + npm

## Lancer avec Docker
À la racine du repo:

```bash
docker compose up -d --build
Logs backend:

bash
docker logs -f parfumerie-app
Arrêter:

bash
docker compose down
Reset complet (⚠️ supprime la DB):

bash
docker compose down -v
docker compose up -d --build
Backend (Maven)
Dans le dossier backend (si ton projet est monorepo, adapte le chemin):

bash
mvn clean package
Puis rebuild Docker:

bash
docker compose up -d --build
Frontend (Vite)
Dans le dossier frontend:

bash
npm install
npm run dev
Endpoints principaux
Auth

POST /auth/login

Users

POST /users (création d’un compte client)

Perfumes

GET /perfumes

POST /perfumes (admin only côté UI)

Orders

GET /orders

POST /orders

OrderItems

GET /orderitems

POST /orderitems

Pour vérifier les routes réellement exposées, ouvrir .../application.wadl.

Rôles / Accès admin
Le login renvoie un objet user avec un champ role.

Le frontend protège les routes admin avec une AdminRoute et redirige vers /admin si role === "ADMIN".

Ports (par défaut)
Backend: 8080

Postgres: 5432

Artemis console: 8161

Artemis JMS: 61616

Frontend: 5173
