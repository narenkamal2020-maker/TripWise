# TripWise 4.0

A premium full-stack travel platform — destination discovery, itinerary planning, personal accounts, and a cinematic 3D experience. Built for the AWS Student Builder Group, VIT Chennai.

## Features

- **Authentication** — Register, login, forgot/reset password (JWT-based, bcrypt hashed)
- **Protected routes** — Dashboard, Settings, Saved Places require authentication
- **Personal Dashboard** — Greeting, quick actions, trip summary, featured regions (GSAP animated)
- **Cinematic Home** — Scroll-driven 3D globe (vanilla Three.js) → Leaflet world map
- **Explore** — Text and nearby destination search via OpenTripMap, filters, grid/list toggle
- **My Trip** — Persistent itinerary (PostgreSQL-backed)
- **Saved Places** — Save destinations per-user
- **Settings** — Profile editing, password change, theme toggle, account deletion
- **GSAP animations** — Entrance, stagger, scroll-triggered reveals on auth + dashboard pages
- **Brand palette** — Travel Orange #D98327, Warm Sand #ECE8AF, Forest Green #4A943F, Deep Emerald #186049

## Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, GSAP + ScrollTrigger |
| 3D / Map  | vanilla Three.js, Leaflet |
| Backend   | Express, TypeScript, PostgreSQL, OpenTripMap API |
| Auth      | JWT (7-day), bcryptjs (cost 12), express-rate-limit |

## Getting started

### Prerequisites

- Node.js ≥ 18
- PostgreSQL database

### Backend

```bash
cd backend
cp .env.example .env   # fill in DATABASE_URL and JWT_SECRET
npm install
npm run migrate        # creates all tables
npm run dev            # port 5000
```

**Required `.env` variables:**

```
DATABASE_URL=postgresql://user:password@localhost:5432/tripwise
JWT_SECRET=<generate with: node -e "require('crypto').randomBytes(48).toString('hex')">
OPENTRIPMAP_API_KEY=<your key>
FRONTEND_ORIGIN=http://localhost:5173
```

### Frontend

```bash
cd frontend
npm install
npm run dev            # port 5173
```

## Database tables

| Table | Purpose |
|-------|---------|
| `users` | Accounts (name, email, bcrypt hash) |
| `password_reset_tokens` | Single-use, 1-hour expiry tokens |
| `user_preferences` | Theme, layout, radius preferences |
| `trips` | User-owned trip containers |
| `itinerary_items` | Destinations inside a trip |
| `saved_places` | Per-user saved destinations |

## Routes

### Backend API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Sign in, returns JWT |
| GET | `/api/auth/me` | ✓ | Fetch own profile |
| POST | `/api/auth/forgot-password` | — | Request reset link |
| POST | `/api/auth/reset-password` | — | Set new password with token |
| POST | `/api/auth/change-password` | ✓ | Update password |
| PATCH | `/api/auth/profile` | ✓ | Update display name |
| DELETE | `/api/auth/account` | ✓ | Delete account |
| GET | `/api/saved` | ✓ | List saved places |
| POST | `/api/saved` | ✓ | Save a destination |
| DELETE | `/api/saved/:xid` | ✓ | Remove a saved place |
| GET | `/api/preferences` | ✓ | Get preferences |
| PATCH | `/api/preferences` | ✓ | Update preferences |
| GET | `/api/destinations` | — | Search/nearby |
| GET | `/api/destinations/:xid` | — | Place detail |
| GET | `/api/itinerary` | — | Get itinerary |
| POST | `/api/itinerary` | — | Add to itinerary |
| DELETE | `/api/itinerary/:id` | — | Remove from itinerary |

### Frontend pages

| Path | Protected | Description |
|------|-----------|-------------|
| `/` | No | Cinematic home (3D globe) |
| `/login` | No | Sign in |
| `/register` | No | Create account |
| `/forgot-password` | No | Request reset |
| `/reset-password?token=` | No | Set new password |
| `/dashboard` | ✓ | Personal dashboard |
| `/explore` | No | Destination discovery |
| `/destinations/:xid` | No | Place detail |
| `/my-trip` | No | Itinerary planner |
| `/saved` | ✓ | Saved places |
| `/settings` | ✓ | Account settings |

## Password reset (development)

Email delivery is not configured by default. In development mode the reset token is printed to the backend console:

```
[DEV] Password reset token for user@example.com: <raw-token>
[DEV] Reset link: http://localhost:5173/reset-password?token=<raw-token>
```

To enable email delivery, add `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` to `.env` and implement the send call in `backend/src/routes/auth.ts`.

## Attribution

- Destination data: [OpenTripMap API](https://opentripmap.io)
- Map tiles: © OpenStreetMap contributors, © CARTO
