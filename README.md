# TripWise

A full-stack travel destination discovery and itinerary planning application.
Built for the **AWS Student Builder Group — VIT Chennai** recruitment task.

---

## Overview

TripWise lets users search for landmarks and points of interest worldwide, save destinations,
and build a personal itinerary. It uses the [OpenTripMap API](https://opentripmap.io/) for
live destination data.

Key features:
- Cinematic landing page with a 3D globe (MapLibre GL)
- Destination search (text and nearby radius)
- Destination detail with descriptions and images
- Per-user itinerary (add, remove, export JSON)
- Saved places per user
- User preferences (theme, layout, radius, categories)
- Registration, login, password reset, profile management
- JWT authentication (Bearer token in `Authorization` header)
- Privacy Policy and Terms of Service pages

---

## Architecture

```
TripWise/
├── backend/          Express + TypeScript API
│   ├── src/
│   │   ├── app.ts            Express app (middleware setup)
│   │   ├── server.ts         HTTP server + schema bootstrap
│   │   ├── config/           Environment validation (Zod)
│   │   ├── db/               pg pool + migration script
│   │   ├── middleware/        auth (JWT), errorHandler
│   │   ├── routes/           auth, destinations, itinerary, saved, preferences, health
│   │   ├── schemas/          Zod validation schemas
│   │   ├── services/         itinerary, openTripMap
│   │   └── types/            Shared TypeScript interfaces
│   └── tests/                Jest + Supertest
└── frontend/         React 18 + Vite + TypeScript + Tailwind CSS
    └── src/
        ├── api/              fetch wrappers
        ├── components/       shared UI components
        ├── context/          Auth, Theme, Toast
        ├── pages/            CinematicHome, Explore, Dashboard, …
        └── data/             city list, kind filters
```

---

## Prerequisites

- **Node.js** ≥ 18
- **PostgreSQL** ≥ 14
- **OpenTripMap API key** — register free at https://opentripmap.io/

---

## Local Setup

### 1. Clone and install

```bash
git clone <repo-url> TripWise
cd TripWise

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Create PostgreSQL database

```sql
CREATE DATABASE tripwise;
```

### 3. Configure environment variables

**Backend** — copy and edit:

```bash
cd backend
cp .env.example .env
```

Required values in `backend/.env`:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/tripwise
OPENTRIPMAP_API_KEY=<your key from opentripmap.io>
FRONTEND_ORIGIN=http://localhost:5173
# Generate: node -e "require('crypto').randomBytes(48).toString('hex')"
JWT_SECRET=<at least 32 random characters>
JWT_EXPIRES_IN=7d
```

> `JWT_SECRET` is **required** — the server will refuse to start without it.

**Frontend** — copy and edit:

```bash
cd frontend
cp .env.example .env
```

`frontend/.env` defaults to `http://localhost:5000` for the API. Change only if your backend runs elsewhere.

### 4. Run database migration

```bash
cd backend
npx ts-node src/db/migrate.ts
```

### 5. Start backend

```bash
cd backend
npm run dev      # ts-node-dev, hot reload
# or
npm run build && npm start   # production build
```

### 6. Start frontend

```bash
cd frontend
npm run dev      # Vite dev server at http://localhost:5173
```

---

## API Endpoints

All endpoints return `{ success: true, data: ... }` or `{ success: false, error: { code, message } }`.

### Auth (no token required unless marked 🔐)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` 🔐 | Get current user |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Apply reset token |
| POST | `/api/auth/change-password` 🔐 | Change password |
| PATCH | `/api/auth/profile` 🔐 | Update display name |
| DELETE | `/api/auth/account` 🔐 | Delete account |

### Destinations

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/destinations?q=...` | Text search |
| GET | `/api/destinations?lat=...&lon=...&radius=...` | Nearby search |
| GET | `/api/destinations/:xid` | Place detail |

### Itinerary 🔐

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/itinerary` | List user's itinerary items |
| POST | `/api/itinerary` | Add destination `{ xid }` |
| DELETE | `/api/itinerary/:id` | Remove item |

### Saved Places 🔐

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/saved` | List saved places |
| POST | `/api/saved` | Save `{ xid, snapshot }` |
| DELETE | `/api/saved/:xid` | Remove saved place |

### Preferences 🔐

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/preferences` | Get preferences |
| PATCH | `/api/preferences` | Update preferences |

### Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | App + DB status |

---

## Test and Build Commands

```bash
# Backend tests
cd backend
JWT_SECRET=test-secret-32-chars npx jest

# Backend type check
cd backend
npx tsc --noEmit

# Frontend type check
cd frontend
npx tsc --noEmit

# Frontend production build
cd frontend
npm run build

# Backend production build
cd backend
npm run build
```

---

## OpenTripMap Attribution

This application uses data from [OpenTripMap](https://opentripmap.io/).
Data is provided under the [Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/).

---

## Security Notes

- Passwords are hashed with bcrypt (cost 12).
- Password reset tokens are SHA-256 hashed before storage, single-use, and expire in 1 hour.
- JWT secrets must be at least 32 characters. The server will not start without one.
- The OpenTripMap API key is kept exclusively on the backend.
- All itinerary, saved places, and preferences endpoints require a valid Bearer token.
- Each user's data is isolated at the database level via trip ownership and user-scoped queries.

---

## Production Deployment Notes

1. Set `NODE_ENV=production` on the backend.
2. Set `FRONTEND_ORIGIN` to your deployed frontend URL (used for CORS).
3. Set a strong, unique `JWT_SECRET`.
4. Configure your web server (Nginx/Caddy) to proxy `/api/*` to the backend and serve the frontend SPA with a catch-all fallback (`try_files $uri /index.html`).
5. Use a managed PostgreSQL instance (e.g., RDS, Supabase, Neon) with SSL.
6. Implement a real email delivery service (SendGrid, SES, Postmark) for password reset — currently development-only console logging.

---

## Known Limitations

- Password reset emails are logged to the console in development; no email provider is wired in production.
- Notification preferences in Settings are a placeholder ("Coming soon") — no email notification system exists.
- No avatar upload; initials-based avatar only.
- Single trip per user (multi-trip support can be added by extending the trips table API).
