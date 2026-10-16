# TripWise Backend

Node.js / Express / TypeScript backend for TripWise — a destination discovery and itinerary planner powered by [OpenTripMap](https://dev.opentripmap.org/).

## Architecture

```
backend/
├── src/
│   ├── config/        # Environment validation (Zod)
│   ├── db/            # PostgreSQL pool + migration
│   ├── middleware/    # Error handler
│   ├── routes/        # Express route handlers
│   ├── schemas/       # Zod request validation
│   ├── services/      # OpenTripMap client + itinerary DB service
│   ├── types/         # TypeScript interfaces
│   ├── app.ts         # Express app setup
│   └── server.ts      # HTTP server + graceful shutdown
└── tests/             # Jest + Supertest test suite
```

**Key dependencies:** `express`, `pg`, `axios`, `zod`, `dotenv`, `helmet`, `cors`, `express-rate-limit`

---

## OpenTripMap Endpoints Used

| Purpose | Endpoint | Key Parameters |
|---|---|---|
| Nearby places | `GET /en/places/radius` | `lat`, `lon`, `radius`, `limit`, `kinds`, `format=geojson` |
| Text/autocomplete | `GET /en/places/autosuggest` | `name`, `lat`, `lon`, `radius`, `limit`, `kinds` |
| Place details | `GET /en/places/xid/{xid}` | — |
| City → coords | `GET /en/places/geoname` | `name`, `country` |

**Base URL:** `https://api.opentripmap.com/0.1`  
**Auth:** `apikey` query parameter  
**Attribution required** — display "Powered by OpenTripMap" per their terms.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in real values:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/tripwise
OPENTRIPMAP_API_KEY=          # Get a free key at https://dev.opentripmap.org/register
FRONTEND_ORIGIN=http://localhost:5173
```

All variables are validated at startup — the server refuses to start if any required variable is missing.

---

## Database Setup

### Schema

```sql
CREATE TABLE trips (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE itinerary_items (
  id         SERIAL PRIMARY KEY,
  trip_id    INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  xid        TEXT NOT NULL,
  snapshot   JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_xid_per_trip UNIQUE (trip_id, xid)
);
```

The `snapshot` column stores the full `Destination` object so My Trip renders even when OpenTripMap is temporarily unavailable.

A single default trip (`id = 1`) is used — no authentication is implemented.

### Run migrations

```bash
npm run migrate
```

Or the server auto-creates the schema on startup.

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Create and fill .env
cp .env.example .env

# 3. Run migrations (optional — server does this on start)
npm run migrate

# 4. Start dev server with hot reload
npm run dev
```

---

## Build & Production

```bash
npm run build        # Compile TypeScript → dist/
npm start            # Run compiled output
```

---

## API Endpoints

### `GET /api/health`

Returns server and database health.

**Response**
```json
{
  "success": true,
  "data": { "status": "healthy", "db": "ok", "uptime": 42.1, "timestamp": "..." }
}
```

---

### `GET /api/destinations`

Discover destinations. Requires either **coordinates** (nearby search) or **a text query** (autosuggest), or both.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `q` | string (≥3 chars) | if no lat/lon | Text search query |
| `lat` | number | if no q | Latitude |
| `lon` | number | if no q | Longitude |
| `radius` | number | no (default 5000) | Search radius in metres (max 200000) |
| `limit` | number | no (default 20) | Max results (max 100) |
| `kinds` | string | no | OpenTripMap category filter e.g. `cultural,natural` |
| `sort` | `distance`\|`name`\|`rate` | no (default `distance`) | Sort order |

**Example — nearby**
```
GET /api/destinations?lat=48.8566&lon=2.3522&radius=2000&limit=10&kinds=cultural
```

**Example — text search**
```
GET /api/destinations?q=Eiffel&lat=48.8566&lon=2.3522
```

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": "N1234567",
      "name": "Eiffel Tower",
      "kinds": "cultural,architecture",
      "latitude": 48.8566,
      "longitude": 2.3522,
      "distance": 100,
      "source": "OpenTripMap"
    }
  ],
  "meta": { "source": "OpenTripMap", "count": 1, "query": { ... } }
}
```

---

### `GET /api/destinations/:xid`

Full detail for a single place.

**Response**
```json
{
  "success": true,
  "data": {
    "id": "N1234567",
    "name": "Eiffel Tower",
    "kinds": "cultural,architecture",
    "latitude": 48.8566,
    "longitude": 2.3522,
    "address": { "city": "Paris", "country": "France", "postcode": "75007" },
    "description": "The Eiffel Tower is a wrought-iron lattice tower...",
    "image": "https://...",
    "wikipedia": "https://en.wikipedia.org/wiki/Eiffel_Tower",
    "source": "OpenTripMap"
  },
  "meta": { "source": "OpenTripMap" }
}
```

---

### `GET /api/itinerary`

Returns all saved itinerary items.

---

### `POST /api/itinerary`

Add a destination to the itinerary. Fetches full details from OpenTripMap and persists a snapshot.

**Body**
```json
{ "xid": "N1234567" }
```

**Response** `201 Created`
```json
{
  "success": true,
  "data": { "id": 1, "trip_id": 1, "xid": "N1234567", "snapshot": { ... }, "created_at": "..." }
}
```

Returns `409 Conflict` if the place is already in the itinerary.

---

### `DELETE /api/itinerary/:id`

Remove an item from the itinerary by its numeric database `id`.

---

## Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Provide coordinates (lat + lon) for nearby search, or q for text search."
  }
}
```

| Code | HTTP | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Invalid or missing query/body parameters |
| `NOT_FOUND` | 404 | Resource or route not found |
| `DUPLICATE_ITEM` | 409 | Destination already in itinerary |
| `RATE_LIMIT` | 429 | Too many requests to this server or OpenTripMap |
| `UPSTREAM_AUTH_ERROR` | 502 | Invalid OpenTripMap API key |
| `UPSTREAM_TIMEOUT` | 504 | OpenTripMap request timed out |
| `UPSTREAM_ERROR` | 502 | Generic upstream failure |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Tests

```bash
npm test              # Run all tests
npm run test:coverage # With coverage report
```

Tests mock OpenTripMap and the database — no real API quota is consumed.

---

## Deployment

### Environment

Set all variables from `.env.example` as environment secrets on your host.  
**Never commit `.env`.**

### Render / Railway / Fly.io

1. Connect your repo.
2. Set build command: `npm install && npm run build`
3. Set start command: `node dist/server.js`
4. Add a managed PostgreSQL database and set `DATABASE_URL`.
5. Set `OPENTRIPMAP_API_KEY`, `FRONTEND_ORIGIN`, `NODE_ENV=production`.

### Docker (optional)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY dist/ ./dist/
EXPOSE 5000
CMD ["node", "dist/server.js"]
```

Build & push:
```bash
npm run build
docker build -t tripwise-backend .
```

### CORS

In production, `FRONTEND_ORIGIN` must be the exact frontend URL (e.g. `https://tripwise.vercel.app`).  
In development, all origins are allowed for convenience.

---

## Limitations

- No user authentication — a single anonymous trip (`id = 1`) is used.
- OpenTripMap's free tier has rate limits. Cache aggressively in production.
- Not all places have descriptions, images, or Wikipedia links — these fields are optional.
- The `geoname` endpoint may not be available on all API plans.

---

## Attribution

Data provided by [OpenTripMap](https://dev.opentripmap.org/) under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).  
Display "Powered by OpenTripMap" in your frontend per their terms.
