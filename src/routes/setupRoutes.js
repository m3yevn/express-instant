import fs from "fs";
import path from "path";
import express from "express";

function setUpFunction(functionHandler) {
  const wrap = (handler) => `return function handler(req, res) { ${handler} ;}`;
  const newFunction = new Function(wrap(functionHandler));
  return newFunction.call();
}

function setUpModule(modulePath, rootDir) {
  const resolved = path.isAbsolute(modulePath)
    ? modulePath
    : path.join(rootDir, modulePath);

  if (!fs.existsSync(resolved)) {
    console.warn(`Module not found: ${resolved}`);
    return (_req, res) => res.status(501).json({ error: "MODULE_NOT_FOUND" });
  }

  const data = fs.readFileSync(resolved, "utf-8");
  const wrap = `return ${data}`;
  const newFunction = new Function(wrap);
  return newFunction.call();
}

async function setUpImport(methodHandler, rootDir) {
  const importPath = path.isAbsolute(methodHandler.import)
    ? methodHandler.import
    : path.join(rootDir, methodHandler.import);

  const handlers = await import(importPath);
  if (handlers?.default) {
    return handlers.default[methodHandler.handler];
  }
  return handlers[methodHandler.handler];
}

function resolveStaticDir(dir, rootDir) {
  if (!dir) return dir;
  if (path.isAbsolute(dir)) return dir;
  return path.join(rootDir, dir);
}

function flattenHandlers(handler) {
  if (!handler) return [];
  return Array.isArray(handler) ? handler : [handler];
}

function resolveMiddlewareChain(names = [], middlewareRegistry = {}) {
  return names
    .map((name) => {
      const fn = middlewareRegistry[name];
      if (!fn) {
        throw new Error(`Unknown middleware: ${name}`);
      }
      return fn;
    })
    .filter(Boolean);
}

async function resolveRouteHandler(methodHandler, rootDir, templates) {
  if (!methodHandler?.type) {
    return (req, res) => res.json(methodHandler);
  }

  switch (methodHandler.type) {
    case "static":
      return express.static(resolveStaticDir(methodHandler.dir, rootDir));
    case "function":
      return setUpFunction(methodHandler.function);
    case "module":
      return setUpModule(methodHandler.module, rootDir);
    case "import":
      return setUpImport(methodHandler, rootDir);
    case "template": {
      const handler = templates[methodHandler.template];
      if (!handler) {
        throw new Error(`Unknown template: ${methodHandler.template}`);
      }
      return handler;
    }
    default:
      throw new Error(`Unknown route type: ${methodHandler.type}`);
  }
}

export async function setupRoutes(app, routes, rootDir, { templates, middleware }) {
  for (const [url, methods] of Object.entries(routes || {})) {
    for (const [methodName, methodHandler] of Object.entries(methods)) {
      const method = methodName.toLowerCase();
      const chain = resolveMiddlewareChain(methodHandler.middleware, middleware);

      if (methodHandler?.type === "routes") {
        const router = express.Router();
        await setupRoutes(router, methodHandler.routes, rootDir, { templates, middleware });
        app.use(url, ...chain, router);
        continue;
      }

      const handler = await resolveRouteHandler(methodHandler, rootDir, templates);
      const handlers = flattenHandlers(handler);

      if (method === "use") {
        app.use(url, ...chain, ...handlers);
      } else if (typeof app[method] === "function") {
        app[method](url, ...chain, ...handlers);
      } else {
        throw new Error(`Unsupported HTTP method in config: ${methodName}`);
      }
    }
  }

  return app;
}
