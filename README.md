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

### Database
1. Open `Database/schema.sql` in MySQL Workbench (or run it directly as a privileged user) to create the `vetapp` database and its tables.
2. Create a least-privilege application user and grant it access:
   ```sql
   CREATE USER IF NOT EXISTS 'vetapp_app'@'localhost' IDENTIFIED BY 'your_password_here';
   GRANT SELECT, INSERT, UPDATE, DELETE ON vetapp.* TO 'vetapp_app'@'localhost';
   FLUSH PRIVILEGES;
   ```

### Backend
```bash
cd Backend
npm install
cp .env.example .env   # fill in DB_PASSWORD/JWT_SECRET etc. to match the user you created above
npm run dev
```
Verify it's up: `GET http://localhost:4000/api/health` should return `{"status":"ok","db":"connected"}`.

### Bootstrapping the first user
There's no signup flow — every account is created by an admin (or, for the very first admin, via this CLI script):
```bash
node scripts/create-user.js --email=admin@vetapp.local --password=<password> --fullName="Clinic Admin" --role=admin
```

### Frontend
```bash
cd Frontend
npm install
cp .env.example .env   # VITE_API_BASE_URL defaults to http://localhost:4000/api
npm run dev
```
Opens at `http://localhost:3000` (port is fixed in `vite.config.mjs`, not Vite's usual 5173). You'll land on the Login page — sign in with a user created via `scripts/create-user.js` or `npm run seed-test-users` in `Backend/`.

**Note:** if `Backend/.env`'s `FRONTEND_ORIGIN` doesn't match the frontend's actual origin (`http://localhost:3000`), login will fail with a CORS error in the browser console, not a clean 401.

## Authentication

All endpoints except `POST /api/auth/login` require a valid JWT (`Authorization: Bearer <token>`), obtained by logging in with a user created via `scripts/create-user.js` or the admin-only `POST /api/users` endpoint. Roles (`admin`, `vet`, `staff`) gate access per-endpoint — see the wiki's permission matrix. The frontend's own login page, router guards, and role-filtered navigation mirror this but are a UI convenience only; the backend is the actual enforcement point.

## Documentation

See [`docs/PROJECT_WIKI.md`](./docs/PROJECT_WIKI.md) for full architecture details, database schema, API endpoints, and open design decisions.
