# Instant Express — Vertical Slices

JSON-configured Express server — drop in templates instead of hand-writing routes.

## Done

| Slice | Template | Route example |
|-------|----------|---------------|
| **Health** | `health` | `GET /health` |
| **Auth sign-up** | `signUp` + validator | `POST /auth/sign-up` |
| **Auth sign-in** | `signIn` + validator | `POST /auth/sign-in` |
| **Integration tests** | `test/integration.test.js` | Spawns server, hits endpoints |

## Next slices

| # | Slice | Template to add |
|---|-------|-----------------|
| 3 | **List items** | `listItems` — in-memory CRUD collection |
| 4 | **Landing page** | Express.js-inspired marketing site in `public/` |
| 5 | **JWT guard** | `requireAuth` middleware template |
| 5 | **Mongo CRUD** | `mongoItems` — generic collection CRUD |
| 6 | **Static SPA** | `staticSpa` — serve `public/` + fallback |
| 7 | **Rate limit** | `rateLimit` wrapper template |

## Quick start

```bash
cp slices.example.json my-api.json
node src/server.js --config-file my-api.json
npm test
```
