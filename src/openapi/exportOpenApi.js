import { templateSpecs } from "./templateSpecs.js";

const HTTP_METHODS = new Set(["get", "post", "put", "patch", "delete", "head", "options"]);

function toOpenApiPath(expressPath) {
  return expressPath.replace(/:([A-Za-z_][A-Za-z0-9_]*)/g, "{$1}");
}

function operationId(method, path) {
  return `${method}_${path.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "")}`;
}

function buildOperation(method, handler, path) {
  const op = {
    operationId: operationId(method, path),
    responses: { 200: { description: "Success" } },
  };

  if (handler?.middleware?.includes("requireAuth")) {
    op.security = [{ bearerAuth: [] }];
  }

  if (handler?.type === "template" && templateSpecs[handler.template]) {
    Object.assign(op, templateSpecs[handler.template]);
  } else if (!handler?.type) {
    op.summary = "Static JSON response";
  } else {
    op.summary = handler.type;
  }

  return op;
}

function walkRoutes(routes, basePath, visitor) {
  for (const [url, methods] of Object.entries(routes || {})) {
    const fullPath = `${basePath}${url}`.replace(/\/+/g, "/") || "/";

    for (const [methodName, handler] of Object.entries(methods)) {
      const method = methodName.toLowerCase();

      if (handler?.type === "routes") {
        walkRoutes(handler.routes, fullPath === "/" ? "" : fullPath, visitor);
        continue;
      }

      if (method === "use" || handler?.type === "static") continue;
      if (!HTTP_METHODS.has(method)) continue;

      visitor(toOpenApiPath(fullPath), method, handler);
    }
  }
}

/**
 * @param {object} config - validated express-instant config
 * @param {{ title?: string, version?: string, serverUrl?: string }} [meta]
 */
export function exportOpenApi(config, meta = {}) {
  const paths = {};

  walkRoutes(config.routes, "", (path, method, handler) => {
    paths[path] = paths[path] || {};
    paths[path][method] = buildOperation(method, handler, path);
  });

  return {
    openapi: "3.0.3",
    info: {
      title: meta.title || config.openapi?.title || "Express Instant API",
      version: meta.version || config.openapi?.version || "1.0.0",
      description: "Generated from express-instant JSON config",
    },
    servers: [
      {
        url: meta.serverUrl || config.openapi?.servers?.[0]?.url || `http://localhost:${config.port || 3000}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    paths,
  };
}
