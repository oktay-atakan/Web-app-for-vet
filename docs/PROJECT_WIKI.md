# VetApp — Project Wiki

This file is intended as a reference while developing the project in VS Code with Claude Code. Keep it up to date as the project grows; Claude Code can read this file at the start of a session to quickly understand the project context.

---

## 1. Project Overview

**VetApp** is a three-tier web application that lets a veterinary clinic manage its customers, their pets, procedures performed on pets (vaccinations, etc.), and appointments.

- **Purpose:** Let clinic staff maintain customer/pet records, both log and create new procedures (vaccinations, checkups, etc.), and schedule appointments.
- **Users:** The app is used by clinic staff (`admin`, `vet`, `staff`). There is **no self-service signup** — every account is created by an admin (or, to bootstrap the very first admin, via the `scripts/create-user.js` CLI). The frontend has a real login page (see §2.1) — there's no separate "customer-facing" login, since `staff` is itself a clinic-employee role.
- **Authorization:** Authentication and authorization are required for all operations except `POST /auth/login`. Both the backend (real enforcement) and the frontend (router guards + role-filtered nav, UI convenience only) implement the same three-role permission matrix — see §4.

---

## 2. Architecture (3-Tier)

```
┌─────────────┐      HTTP/REST (JSON)      ┌──────────────┐      SQL      ┌──────────────┐
│  Frontend   │  ───────────────────────►  │   Backend    │  ──────────►  │  Database    │
│  Vue 3      │  ◄───────────────────────  │  Node.js     │  ◄──────────  │  MySQL       │
│  (SPA)      │                            │  Express     │               │              │
└─────────────┘                            └──────────────┘               └──────────────┘
```

### 2.1 Frontend
- **Technology:** Vue 3 (Composition API, `<script setup>`), plain JavaScript (no TypeScript — decided in favor of speed for this small app).
- **Scaffolded with:** `npm create vuetify@latest` (Vite + Vuetify + Pinia + Vue Router + ESLint). Dev server fixed to port **3000** in `vite.config.mjs` (not Vite's usual 5173).
- **State management:** Pinia (`src/stores/auth.js` — token + user, persisted to `localStorage`).
- **HTTP client:** Axios (`src/services/api.js`) — a shared instance with a request interceptor that attaches the JWT automatically, and a response interceptor that clears the session and redirects to `/login` on any `401`.
- **UI library:** Vuetify (Material Design components — tables, forms, dialogs).
- **No third-party admin template** — decided against using one (e.g. Creative Tim's Material Dashboard) to avoid license ambiguity; the app shell (nav drawer + app bar, in `App.vue`) is hand-built directly on top of Vuetify's own components.
- **Routing:** manual routes in `src/router/index.js` (not file-based routing) — each resource has a `list.vue` and a combined `form.vue` (the same component handles create/edit/read-only-detail depending on route params and the user's role). A global `router.beforeEach` guard redirects unauthenticated users to `/login` and wrong-role users to `/forbidden`, based on each route's `meta.roles`.
- **Login page:** built (`src/pages/login.vue`) — this was originally deferred in early planning but is now live as part of the frontend phase.

### 2.2 Backend
- **Technology:** Node.js + Express.
- **Layers** (`Backend/src/`):
  - `routes/` — HTTP endpoint definitions + `express-validator` chains + `authenticate`/`authorize` middleware wiring
  - `controllers/` — thin request/response shaping only, no SQL or business logic
  - `services/` — business rules (existence checks, role-conditional shaping, delete-conflict guards), throws `ApiError`
  - `repositories/` — raw parameterized SQL only, via `pool.execute(sql, [params])`
  - `middlewares/` — `auth.middleware.js` (JWT verify), `authorize.middleware.js` (role gate factory), `validate.middleware.js`, `error.middleware.js`
  - `utils/` — `ApiError`, `asyncHandler`
- **Database access:** Raw SQL via `mysql2/promise` — no ORM.
- **Auth:** JWT-based (`jsonwebtoken`), payload is `{ userId, role }`. Passwords hashed with **`bcryptjs`** (pure JS, not native `bcrypt` — avoids a Windows `node-gyp` build step; same API, swappable later if needed).
- **All routes mounted under `/api`** (e.g. `POST /api/auth/login`, `GET /api/customers`).

### 2.3 Database
- **Technology:** MySQL, InnoDB engine (required for foreign keys/transactions).
- **Schema file:** `Database/schema.sql` — hand-written (not exported from Workbench), versioned in the repo. Applied manually by a privileged MySQL account; the app itself connects as a least-privilege `vetapp_app` user (`SELECT`/`INSERT`/`UPDATE`/`DELETE` only).
- **IDs:** `INT AUTO_INCREMENT` on every table.

---

## 3. Database Schema

Matches `Database/schema.sql` exactly — see that file for the authoritative DDL (column widths, indexes, `ON UPDATE CURRENT_TIMESTAMP`, etc.). Summary:

### 3.1 `users` (clinic staff)
| Field | Type | Notes |
|---|---|---|
| id | INT AUTO_INCREMENT PK | |
| email | VARCHAR(255) | `UNIQUE` |
| password_hash | VARCHAR(255) | bcryptjs hash |
| full_name | VARCHAR(150) | |
| role | ENUM('admin','vet','staff') | default `staff` |
| is_active | TINYINT(1) | default 1 — **soft-disable, no hard delete** (keeps `performed_by`/`assigned_to` history meaningful) |
| created_at, updated_at | TIMESTAMP | |

### 3.2 `customers`
| Field | Type | Notes |
|---|---|---|
| id | INT AUTO_INCREMENT PK | |
| full_name | VARCHAR(150) | |
| phone, email | VARCHAR | nullable |
| address | TEXT | nullable |
| created_at, updated_at | TIMESTAMP | |

### 3.3 `pets`
| Field | Type | Notes |
|---|---|---|
| id | INT AUTO_INCREMENT PK | |
| customer_id | FK → customers.id | `ON DELETE RESTRICT` |
| name, species | VARCHAR | required |
| breed | VARCHAR | nullable |
| birth_date | DATE | nullable |
| weight_kg | DECIMAL(6,2) | nullable (named `_kg` to remove unit ambiguity — the original draft just called it `weight`) |
| notes | TEXT | nullable |
| created_at, updated_at | TIMESTAMP | |

### 3.4 `procedures` (vaccination / checkup / treatment / surgery / other)
Not just a historical log — new procedures are actively logged/performed through the system in real time.

| Field | Type | Notes |
|---|---|---|
| id | INT AUTO_INCREMENT PK | |
| pet_id | FK → pets.id | `ON DELETE RESTRICT` |
| type | ENUM('vaccination','checkup','treatment','surgery','other') | |
| name | VARCHAR(150) | e.g. "Rabies vaccine" |
| date_administered | DATE | required |
| next_due_date | DATE | nullable |
| performed_by | FK → users.id | `ON DELETE SET NULL`; must reference an `admin`/`vet` user (enforced in `procedures.service.js`) |
| notes | TEXT | nullable |
| created_at | TIMESTAMP | |

### 3.5 `appointments`
| Field | Type | Notes |
|---|---|---|
| id | INT AUTO_INCREMENT PK | |
| customer_id | FK → customers.id | `ON DELETE RESTRICT` |
| pet_id | FK → pets.id | nullable, `ON DELETE RESTRICT` |
| scheduled_at | **DATETIME** (not TIMESTAMP) | avoids MySQL's automatic session-timezone conversion on appointment times |
| status | ENUM('scheduled','completed','cancelled','no_show') | default `scheduled` |
| reason | VARCHAR(255) | nullable |
| assigned_to | FK → users.id | `ON DELETE SET NULL`; must reference an `admin`/`vet` user if set |
| created_at, updated_at | TIMESTAMP | |

**Relationships:** `customers` 1—N `pets` | `pets` 1—N `procedures` | `customers`/`pets` 1—N `appointments`

**Delete semantics:** parent-data FKs (`pets→customers`, `procedures→pets`, `appointments→customers`/`pets`) are `ON DELETE RESTRICT` — deleting a customer/pet with dependents returns a clean `409 Conflict` from the service layer (checked proactively, not by catching a raw MySQL FK error). Staff-reference FKs (`procedures.performed_by`, `appointments.assigned_to`) are `ON DELETE SET NULL`.

---

## 4. Authentication & Authorization

- JWT payload: `{ userId, role }`. All endpoints require it except `POST /auth/login`.
- **Role permission matrix** (fully implemented, both backend-enforced and frontend-mirrored):

| Resource | admin | vet | staff |
|---|---|---|---|
| `POST /auth/login` | public | public | public |
| `/users` (all verbs) | full access | 403 | 403 |
| `GET /customers`, `GET /customers/:id` | yes | yes | yes |
| `POST/PUT /customers` | yes | yes | 403 |
| `DELETE /customers/:id` | yes | 403 | 403 |
| `GET /pets`, `GET /pets/:id` | yes (full, incl. procedures) | yes (full, incl. procedures) | yes (demographic fields only — `procedures` key omitted from the response) |
| `POST/PUT /pets` | yes | yes | 403 |
| `DELETE /pets/:id` | yes | 403 | 403 |
| `/pets/:petId/procedures`, `/procedures/:id` (GET/POST/PUT) | yes | yes | 403 (no access at all, not even read) |
| `DELETE /procedures/:id` | yes | 403 | 403 |
| `/appointments` (GET/POST/PUT) | yes | yes | yes |
| `DELETE /appointments/:id` | yes | 403 (the one role excluded from delete here) | yes |

- **Additional service-layer checks:** an appointment's `pet_id` (if set) must belong to its `customer_id`; `procedures.performed_by` and `appointments.assigned_to` must reference an `admin`/`vet` user, never `staff`.
- **User creation:** `scripts/create-user.js` (CLI, bootstraps the first admin) or `POST /api/users` (admin-only, for everyone after that). `npm run seed-test-users` creates three ready-made test accounts (one per role) for local testing.
- **Known gap:** there's no password-reset/change endpoint yet — a user's password is only ever set at account creation. Flagged as a future addition, not built.
- **Known simplification:** the frontend's procedure/appointment forms don't expose a picker for `performed_by`/`assigned_to` (defaults to the logged-in user, or left unassigned for appointments) — populating a real picker would require `GET /api/users`, which only `admin` can call, and `vet`/`staff` also need to create these records.

---

## 5. API Endpoints

All routes are mounted under **`/api`** (e.g. `http://localhost:4000/api/...`).

```
POST   /api/auth/login                    → public, returns { token, user }

GET    /api/users                         → admin only
GET    /api/users/:id                     → admin only
POST   /api/users                         → admin only
PUT    /api/users/:id                     → admin only (fullName/role/isActive — no email or password change)

GET    /api/customers                     → all roles
GET    /api/customers/:id                 → all roles
POST   /api/customers                     → admin, vet
PUT    /api/customers/:id                 → admin, vet
DELETE /api/customers/:id                 → admin only (409 if pets/appointments still reference it)

GET    /api/pets?customerId=              → all roles
GET    /api/pets/:id                      → all roles (procedures array omitted for staff)
POST   /api/pets                          → admin, vet
PUT    /api/pets/:id                      → admin, vet (customer_id cannot be changed after creation)
DELETE /api/pets/:id                      → admin only (409 if procedures/appointments still reference it)

GET    /api/pets/:petId/procedures        → admin, vet only
POST   /api/pets/:petId/procedures        → admin, vet only
PUT    /api/procedures/:id                → admin, vet only
DELETE /api/procedures/:id                → admin only

GET    /api/appointments?status=&customerId=  → all roles
GET    /api/appointments/:id              → all roles
POST   /api/appointments                  → all roles
PUT    /api/appointments/:id              → all roles
DELETE /api/appointments/:id              → admin, staff (not vet)

GET    /api/health                        → public, checks DB connectivity
```

All error responses share one JSON shape: `{ "error": { "code": "...", "message": "...", "details": [...] } }` (`details` only present for `422` validation errors).

---

## 6. Folder Structure (Actual)

```
Web app Vet/
├── Backend/
│   ├── src/
│   │   ├── config/        (env.js, db.js)
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── middlewares/
│   │   ├── utils/         (ApiError, asyncHandler)
│   │   └── app.js
│   ├── scripts/
│   │   ├── create-user.js
│   │   └── seed-test-users.js
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── .env               (gitignored)
├── Frontend/
│   ├── src/
│   │   ├── pages/          (login.vue, forbidden.vue, index.vue, customers/, pets/, appointments/, users/ — each with list.vue + form.vue)
│   │   ├── stores/          (auth.js — Pinia)
│   │   ├── router/          (index.js — manual routes + beforeEach guard)
│   │   ├── services/        (api.js — Axios instance; customers.js, pets.js, procedures.js, appointments.js, users.js — thin REST wrappers)
│   │   ├── plugins/          (vuetify.js, index.js)
│   │   └── App.vue           (app shell: nav drawer + app bar, role-filtered)
│   ├── package.json
│   ├── vite.config.mjs      (dev server fixed to port 3000)
│   ├── .env.example
│   └── .env                 (gitignored)
├── Database/
│   └── schema.sql
├── README.md
└── docs/
    └── PROJECT_WIKI.md      ← this file
```

Note the top-level folders are **capitalized** (`Backend/`, `Frontend/`, `Database/`) — an early plan draft assumed lowercase/nested (`backend/database/schema.sql`), but the actual repo layout (established before implementation started) uses this flatter, capitalized structure instead.

---

## 7. Decisions & Notes

### Resolved decisions
- ✅ All operations require auth except `POST /auth/login`.
- ✅ Login page is built (frontend phase) — no separate customer signup; `staff` is a clinic-employee role.
- ✅ Roles/permissions fully specified and implemented — see §4's matrix.
- ✅ `bcryptjs` over native `bcrypt` (Windows build friction), `express-validator` for validation, `INT AUTO_INCREMENT` IDs.
- ✅ No ORM — raw SQL via `mysql2/promise`, organized in a `repositories/` layer.
- ✅ No third-party Vuetify admin template — hand-built app shell instead, to avoid license ambiguity.
- ✅ Frontend: plain JavaScript, not TypeScript.
- ✅ Appointment conflict checking and vaccination reminder notifications (email/SMS) remain out of scope for now.
- ✅ Procedures are actively logged/performed through the system, not just historical records.
- ✅ `users.is_active` for soft-disable — no hard delete of staff accounts (keeps procedure/appointment history attributable).

### Known gaps / possible follow-ups
- [ ] No password-reset/change endpoint — password is set once, at account creation.
- [ ] No UI picker for `procedures.performed_by` / `appointments.assigned_to` (self-attribution / unassigned instead) — real picker needs `GET /api/users` opened up beyond admin-only, or a narrower "list active vets" endpoint.
- [ ] No automated test suite yet (a small Jest + Supertest suite covering login, one role-check, and one CRUD round-trip was scoped but not built — optional "M9" in the implementation plan).
- [ ] Frontend dev environment requires Node ≥20.19 (managed via Nodist on this machine, switched from a pre-installed 20.10.0 to 22.22.0) for the Vite/Vuetify scaffolding tools; the actual Vite 5.x runtime itself would have worked on the older Node too.

---

## 8. Development Notes

- Keep this file up to date as the project progresses; add new endpoints, tables, or decisions to the relevant section as they come up.
- When working with Claude Code, referencing this file at the start of a session helps maintain a consistent architecture.
