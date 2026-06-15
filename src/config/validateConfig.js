import Ajv from "ajv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(__dirname, "server.schema.json");
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf-8"));

const ajv = new Ajv({ allErrors: true, strict: false });
const validateSchema = ajv.compile(schema);

const ROUTE_TYPES = new Set([
  "static",
  "function",
  "module",
  "import",
  "template",
  "routes",
]);

function assertKnownRouteTypes(routes, label = "routes") {
  if (!routes || typeof routes !== "object") return;

  for (const [url, methods] of Object.entries(routes)) {
    for (const [methodName, handler] of Object.entries(methods)) {
      if (!handler?.type) continue;

      if (!ROUTE_TYPES.has(handler.type)) {
        throw new Error(
          `Invalid server config: unknown route type "${handler.type}" at ${label}${url} (${methodName})`
        );
      }

      if (handler.type === "routes") {
        assertKnownRouteTypes(handler.routes, `${label}${url}`);
      }
    }
  }
}

function assertKnownWebSocketTemplates(websockets) {
  if (!websockets) return;
  const known = new Set(["echo"]);

  for (const [path, config] of Object.entries(websockets)) {
    if (!known.has(config.template)) {
      throw new Error(
        `Invalid server config: unknown websocket template "${config.template}" at ${path}`
      );
    }
  }
}

export function validateConfig(config) {
  const valid = validateSchema(config);
  if (!valid) {
    const message = ajv.errorsText(validateSchema.errors, { separator: "\n" });
    throw new Error(`Invalid server config:\n${message}`);
  }

  assertKnownRouteTypes(config.routes);
  assertKnownWebSocketTemplates(config.websockets);

  if (config.mongoDB) {
    const usesMongoTemplate = JSON.stringify(config.routes || {}).includes(
      '"mongoItems"'
    );
    if (usesMongoTemplate && !process.env.MONGODB_STRING) {
      console.warn(
        "Warning: mongoItems routes configured but MONGODB_STRING is not set."
      );
    }
  }

  return config;
}
