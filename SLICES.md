# Instant Express — Vertical Slices

JSON-configured Express library. **npm:** `express-instant` · **folder:** `express-instant`

## Done (v1.1.0)

| Slice | Status |
|-------|--------|
| Library API | `createApp`, `loadConfigFromFile`, `startServerFromConfig` |
| CLI | `npx express-instant --config-file my-api.json` |
| Config validation | JSON Schema + route type checks |
| Health | `health` template |
| Auth | `signUp`, `signIn` + MongoDB + JWT |
| In-memory CRUD | `listItems` |
| MongoDB CRUD | `mongoItems` |
| JWT guard | `requireAuth` middleware |
| WebSockets | `echo` template via `websockets` config |
| CORS | `"cors": true` |
| Tests | health, CRUD, requireAuth, auth service |
| Vercel | `express-instant.vercel.app` |

## Next (v1.2+)

| # | Slice |
|---|-------|
| 1 | Rate limit middleware |
| 2 | OpenAPI export from config |
| 3 | Plugin ecosystem docs |

## Quick start

```bash
cp slices.example.json my-api.json
cp .env.example .env
npx express-instant --config-file my-api.json
npm test
```
