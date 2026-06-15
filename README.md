# Instant Express

**Brand:** Instant Express · **npm:** [`express-instant`](https://www.npmjs.com/package/express-instant)

JSON-configured Express server — define routes, auth, CRUD, and custom handlers in one config file. Ship a REST API without boilerplate.

**Live demo:** [express-instant.vercel.app](https://express-instant.vercel.app)

## Why this exists

| Tool | What it does |
|------|----------------|
| [JSON Server](https://github.com/typicode/json-server) | Mock API from a **data** JSON file |
| [PocketBase](https://pocketbase.io/) | Full backend platform with admin UI |
| **Instant Express** | **Route config** JSON + templates + escape hatches — you stay on Express |

Not a game backend ([Nakama](https://heroiclabs.com/nakama/)). Not a mock server. A **composable library** for real small APIs.

## Install

```bash
npm install express-instant
```

## Quick start (CLI)

```bash
cp slices.example.json my-api.json
cp .env.example .env
npx express-instant --config-file my-api.json
```

Or add to `package.json`:

```json
{
  "scripts": {
    "start": "express-instant --config-file my-api.json"
  }
}
```

## Quick start (library)

```js
import { createApp, loadConfigFromFile } from "express-instant";

const config = loadConfigFromFile("./my-api.json");
const app = await createApp(config);
app.listen(3000);
```

## Example config — Todo API with auth

```json
{
  "port": 3000,
  "dotenv": true,
  "cors": true,
  "mongoDB": true,
  "bodyParser": { "json": true },
  "routes": {
    "/health": { "GET": { "type": "template", "template": "health" } },
    "/auth/sign-up": { "POST": { "type": "template", "template": "signUp" } },
    "/auth/sign-in": { "POST": { "type": "template", "template": "signIn" } },
    "/items/:collection": {
      "GET": { "type": "template", "template": "listItems" },
      "POST": {
        "type": "template",
        "template": "listItems",
        "middleware": ["requireAuth"]
      }
    }
  }
}
```

See [`slices.example.json`](./slices.example.json) for the full copy-paste example.

## Route types

| Type | Description |
|------|-------------|
| `template` | Built-in handler (`health`, `signUp`, `signIn`, `listItems`) |
| `function` | Inline handler string |
| `module` | Load a local `.js` module |
| `import` | Import ES module handler |
| `static` | Serve static files |
| `routes` | Nested router |

### Middleware on routes

```json
{
  "POST": {
    "type": "template",
    "template": "listItems",
    "middleware": ["requireAuth"]
  }
}
```

## Built-in templates

| Template | Description |
|----------|-------------|
| `health` | `{ success, status, uptime }` |
| `signUp` | Register user → MongoDB + bcrypt + JWT |
| `signIn` | Login → JWT |
| `listItems` | In-memory CRUD on `/items/:collection` |
| `mongoItems` | MongoDB CRUD on `/db/:collection` (requires `mongoDB: true`) |

## WebSockets

```json
{
  "websockets": {
    "/ws": { "template": "echo" }
  }
}
```

Built-in `echo` template sends `{ type: "connected" }` on connect and echoes messages back.

## Built-in middleware

| Middleware | Description |
|------------|-------------|
| `requireAuth` | Validates `Authorization: Bearer <jwt>` |

## Extend the library

```js
import { registerTemplate, registerMiddleware } from "express-instant";

registerTemplate("myHandler", (req, res) => res.json({ ok: true }));
registerMiddleware("adminOnly", (req, res, next) => { /* ... */ next(); });
```

## Environment variables

```
MONGODB_STRING=mongodb://localhost:27017
MONGODB_NAME=express-instant
JWT_SECRET=change-me-in-production
EXPRESS_INSTANT_CONFIG=./my-api.json
PORT=3000
```

## Development

```bash
git clone https://github.com/m3yevn/express-instant.git
cd express-instant
npm install
npm run dev
npm test
```

## License

MIT © [Kevin Moe Myint Myat](https://kevinmoemyintmyat.vercel.app)
