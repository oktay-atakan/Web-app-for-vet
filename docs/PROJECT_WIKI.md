# VetApp — Project Wiki

This file is intended as a reference while developing the project in VS Code with Claude Code. Keep it up to date as the project grows; Claude Code can read this file at the start of a session to quickly understand the project context.

---

## 1. Project Overview

**VetApp** is a three-tier web application that lets a veterinary clinic manage its customers, their pets, procedures performed on pets (vaccinations, etc.), and appointments.

- **Purpose:** Let clinic staff maintain customer/pet records, both log and create new procedures (vaccinations, checkups, etc.), and schedule appointments.
- **Users:** The app will be used by clinic staff (`admin`, `vet`, `staff`). There is **no** signup/login page — users will be added to the database manually (via seed script / admin script).
- **Authorization:** Authentication and authorization will be **required for all operations, including appointments**. However, a login **page/UI** won't be built at this stage — for testing, a manually created user will be used (e.g. sending a request to `POST /auth/login` from Postman to get a JWT) to test "as if logged in." The login page is a step to be added later; the auth system itself exists from the start.

---

## 2. Architecture (3-Tier)

```
┌─────────────┐      HTTP/REST (JSON)      ┌──────────────┐      SQL      ┌──────────────┐
│  Frontend   │  ───────────────────────►  │   Backend    │  ──────────►  │  Database    │
│  Vue 3      │  ◄───────────────────────  │  Node.js     │  ◄──────────  │  MySQL       │
│  (SPA)      │                            │  Express/    │               │              │
│             │                            │  NestJS      │               │              │
└─────────────┘                            └──────────────┘               └──────────────┘
```

### 2.1 Frontend
- **Technology:** Vue 3 (Composition API recommended)
- **State management:** Pinia
- **HTTP client:** Axios (with an interceptor that automatically attaches the JWT token to headers)
- **UI library:** **Vuetify** — Material Design based, provides ready-made components (buttons, forms, tables, date pickers, etc.). Makes it easy to build a fast, well-organized UI without wrestling with CSS, which is helpful given no prior frontend experience.
- **Template:** A free Vuetify-based admin dashboard template (e.g. Creative Tim's "Vuetify Material Dashboard") will be used as a base — sidebar, card, and table layouts come ready-made, so there's no need to design from scratch. Check the license (MIT / personal-commercial use) of any template before downloading it.
- **Note:** There's no login page, but the token (if any) still needs to be kept in local state/secure storage and attached to requests. How the username/password will be entered (e.g. will there be a simple "login" form, or will the token be supplied directly) needs to be clarified — see Open Questions.

### 2.2 Backend
- **Technology:** Node.js + Express (if you're new to backend development, starting with Express is recommended — it involves less "magic," so you'll see HTTP/routing/middleware concepts more clearly. NestJS is more structured but has a steeper learning curve; moving to NestJS after learning Express can be a sensible path.)
- **Layers:**
  - `routes/` — HTTP endpoint definitions
  - `controllers/` — request/response handling
  - `services/` — business logic
  - `repositories/` (or `models/`) — database access
  - `middlewares/` — auth, error handling, validation
- **Database access:** Raw SQL queries via `mysql2/promise` (see section 2.3 — no ORM is used, the schema is designed in MySQL Workbench)
- **Auth:** JWT-based. Since users are created manually, passwords will be hashed with bcrypt and written to the DB manually / via seed script.

### 2.3 Database
- **Technology:** MySQL
- **Schema design:** Designed as an EER Diagram in MySQL Workbench; CREATE TABLE scripts will be generated via "Forward Engineer" and applied to the database.
- **Backend connection:** No ORM — raw SQL queries will be written using the `mysql2` (promise API) package. Queries will be collected in the `repositories/` layer (see Folder Structure).
- **Migration/version tracking:** `.sql` schema files exported from Workbench will be versioned in the project, e.g. in `database/schema.sql`; a simple migration script system (e.g. manually numbered `.sql` files for MySQL, similar to `node-pg-migrate`) can be added later if needed.

---

## 3. Database Schema (Draft)

### 3.1 `users` (clinic staff — created manually)
| Field | Type | Description |
|---|---|---|
| id | INT (auto_increment) or UUID | Primary key |
| email | VARCHAR | Unique |
| password_hash | VARCHAR | Hashed with bcrypt |
| full_name | VARCHAR | |
| role | ENUM | Roles such as `admin`, `vet`, `staff` (for authorization) |
| created_at | TIMESTAMP | |

### 3.2 `customers`
| Field | Type | Description |
|---|---|---|
| id | INT (auto_increment) or UUID | Primary key |
| full_name | VARCHAR | |
| phone | VARCHAR | |
| email | VARCHAR | |
| address | TEXT | |
| created_at | TIMESTAMP | |

### 3.3 `pets`
| Field | Type | Description |
|---|---|---|
| id | INT (auto_increment) or UUID | Primary key |
| customer_id | FK → customers.id | Owner |
| name | VARCHAR | |
| species | VARCHAR | Dog, cat, etc. |
| breed | VARCHAR | |
| birth_date | DATE | |
| weight | DECIMAL | |
| notes | TEXT | |
| created_at | TIMESTAMP | |

### 3.4 `procedures` (vaccination / checkup / treatment)
> Note: This table doesn't just hold historical records — the system will also support **creating/performing new procedures** (e.g. a new vaccination can be logged in real time during a checkup and counted as "performed" at the same time).

| Field | Type | Description |
|---|---|---|
| id | INT (auto_increment) or UUID | Primary key |
| pet_id | FK → pets.id | |
| type | ENUM/VARCHAR | `vaccination`, `treatment`, `checkup`, etc. |
| name | VARCHAR | E.g. "Rabies vaccine" |
| date_administered | DATE | |
| next_due_date | DATE | Next due date for the vaccine (if applicable) |
| performed_by | FK → users.id | Staff member who performed it |
| notes | TEXT | |

### 3.5 `appointments`
| Field | Type | Description |
|---|---|---|
| id | INT (auto_increment) or UUID | Primary key |
| customer_id | FK → customers.id | |
| pet_id | FK → pets.id | |
| scheduled_at | TIMESTAMP | Appointment date/time |
| status | ENUM | `scheduled`, `completed`, `cancelled`, `no_show` |
| reason | VARCHAR | Reason for the appointment |
| assigned_to | FK → users.id | Staff member assigned |
| created_at | TIMESTAMP | |

**Relationships:**
`customers` 1—N `pets` | `pets` 1—N `procedures` | `customers`/`pets` 1—N `appointments`

> Note: Using `INT AUTO_INCREMENT` for ID columns is recommended (the simplest and most performant option in MySQL); if UUIDs are desired, they need to be generated at the application layer using `CHAR(36)`.

---

## 4. Authentication & Authorization

- **All operations (including appointments) will require auth.** There will be no public/unauthenticated endpoint.
- **Current stage:** The login **page** (frontend UI) is not being built yet. The auth system (JWT generation/verification, middleware) will be set up from the start; for testing, a JWT will be obtained by sending a request to `POST /auth/login` from a tool like Postman, and other endpoints will be tested with that token. In other words, manual token retrieval will be used to simulate "being logged in" instead of a real login UI.
- **Login page (UI):** To be added later — not out of scope, just deprioritized in the order of work.
- The JWT payload should carry `userId` and `role`.
- **Roles and permissions:** Will be detailed once the schema and core CRUD flows are in place (e.g. rules like only `admin` can create new users) — see Open Questions.
- **User creation:** Will be created manually via a seed script (e.g. `scripts/create-user.js`) or a CLI command; no self-service signup.

---

## 5. API Endpoint Draft

> All endpoints (except `/auth/login` below) require auth — they cannot be accessed without a valid JWT. Since there's no login page (UI) yet, tokens will be obtained from `/auth/login` using a tool like Postman during testing.

```
POST   /auth/login              → returns JWT

GET    /customers                → list customers
POST   /customers                → create customer
GET    /customers/:id            → customer detail (with pets)
PUT    /customers/:id
DELETE /customers/:id

GET    /pets
POST   /pets
GET    /pets/:id                 → pet detail (with procedure history)
PUT    /pets/:id
DELETE /pets/:id

GET    /pets/:petId/procedures
POST   /pets/:petId/procedures   → create/log a new vaccination/procedure

GET    /appointments
POST   /appointments             → create appointment
GET    /appointments/:id
PUT    /appointments/:id         → update status (completed/cancelled, etc.)
DELETE /appointments/:id
```

---

## 6. Folder Structure (Proposed)

```
vetapp/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/    (raw SQL queries collected here)
│   │   ├── middlewares/
│   │   └── app.js
│   ├── database/
│   │   └── schema.sql        (schema exported from MySQL Workbench)
│   ├── scripts/
│   │   └── create-user.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   ├── stores/ (Pinia)
│   │   ├── router/
│   │   └── services/ (API client)
│   ├── package.json
│   └── .env
└── PROJECT_WIKI.md   ← this file
```

---

## 7. Decisions & Open Questions

### Resolved decisions
- ✅ **All operations (including appointments) require auth.** There is no public/unauthenticated endpoint.
- ✅ The login **page** (frontend UI) won't be built for now; the auth system (JWT) will be set up from the start and verified via manual token retrieval (Postman, etc.) during testing. The login UI will be added later.
- ✅ Appointment conflict checking and vaccination reminder notifications (email/SMS) are **out of scope / to be added later (improvements)** — just record-keeping is enough for now.
- ✅ Procedures (vaccination/checkup) are not just historical records — they can also be **actively created/performed** through the system.

### Open questions
- [ ] What permissions will each role (`admin`, `vet`, `staff`) have exactly? → To be determined once the schema and core CRUD flows are in place.

---

## 8. Development Notes

- Keep this file up to date as the project progresses; add new endpoints, tables, or decisions to the relevant section as they come up.
- When working with Claude Code, referencing this file at the start of a session helps maintain a consistent architecture.
