# Instant Express — Vertical Slices

JSON-configured Express library. npm: `express-instant` · brand: **Instant Express**.

## Done (v1.0.1)

| Slice | Status |
|-------|--------|
| **Library API** | `createApp`, `loadConfigFromFile`, `startServerFromConfig` |
| **CLI** | `npx express-instant --config-file my-api.json` |
| **Health** | `health` template |
| **Auth** | `signUp`, `signIn` + validators + MongoDB + JWT |
| **CRUD** | `listItems` in-memory collection REST |
| **JWT guard** | `requireAuth` middleware in config |
| **CORS** | `"cors": true` in config |
| **Vercel** | Serverless entry via `src/vercel.js` |
| **Landing** | Express-style site at `/` |
| **Tests** | Integration tests for health + function routes |

## Next (v1.1+)

| # | Slice |
|---|-------|
| 1 | `mongoItems` — generic MongoDB CRUD template |
| 2 | WebSocket template |
| 3 | JSON Schema config validation |
| 4 | Rate limit middleware template |
| 5 | Publish to npm registry |

## Quick start

```bash
cp slices.example.json my-api.json
cp .env.example .env
npx express-instant --config-file my-api.json
npm test
```
