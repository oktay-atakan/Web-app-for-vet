# VetApp

A three-tier web application for managing a veterinary clinic's customers, pets, procedures (vaccinations, checkups, etc.), and appointments.

## Tech Stack

- **Frontend:** Vue 3 + Vuetify
- **Backend:** Node.js (Express)
- **Database:** MySQL (raw SQL via `mysql2`, no ORM)


## Getting Started

### Prerequisites
- Node.js (LTS)
- MySQL Server
- MySQL Workbench (optional, for schema design)

### Setup
```bash
# Backend
cd backend
npm install
cp .env.example .env   # fill in your DB credentials
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

### Database
1. Open `database/schema.sql` in MySQL Workbench (or run it directly).
2. Create the `vetapp` database and apply the schema.

## Authentication

All endpoints require a valid JWT. There's no login page yet — for now, obtain a token by sending a request to `POST /auth/login` (e.g. via Postman) using a manually created user.

## Documentation

See [`PROJECT_WIKI.md`](./PROJECT_WIKI.md) for full architecture details, database schema, API endpoints, and open design decisions.
