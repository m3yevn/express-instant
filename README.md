# express-instant

Low-code JSON-configured Express server. Define routes, middleware, auth, and MongoDB connections through a config file instead of boilerplate.

## Quick start

```bash
npm install
cp .env.example .env
npm run dev
```

The dev script starts the server with `example/server.json`.

## Configuration

Routes are declared in a JSON config file:

```json
{
  "port": 3000,
  "dotenv": true,
  "mongoDB": true,
  "bodyParser": { "json": true },
  "routes": {
    "/api/v1/signup": {
      "post": { "type": "template", "template": "signUp" }
    }
  }
}
```

### Route types

| Type | Description |
|------|-------------|
| `static` | Serve files from a directory |
| `function` | Inline handler string evaluated at runtime |
| `module` | Load a local `.js` module |
| `import` | Import a handler from another file |
| `routes` | Nested router |
| `template` | Built-in handler (see below) |

## Built-in templates

| Template | Method | Body fields | Description |
|----------|--------|-------------|-------------|
| `signUp` | POST | `username`, `password` | Create user, hash password, return JWT |
| `signIn` | POST | `username`, `password` | Authenticate and return JWT |
| `health` | GET | — | Returns `{ success, status, uptime }` |

Example:

```bash
curl -X POST http://localhost:3000/api/v1/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"secret"}'
```

## Environment variables

```
MONGODB_STRING=mongodb+srv://...
MONGODB_NAME=myapp
JWT_SECRET=your-secret-key
```

## Scripts

- `npm run dev` — start with nodemon and example config
- `npm test` — run integration tests (health + function routes)
