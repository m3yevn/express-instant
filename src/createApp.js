import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { configDotenv } from "dotenv";
import dbService from "./templates/services/dbService.js";
import { setupRoutes } from "./routes/setupRoutes.js";
import {
  getMiddlewareRegistry,
  getTemplateRegistry,
} from "./templates/registry.js";

export async function createApp(serverConfigs, { rootDir = process.cwd() } = {}) {
  if (serverConfigs?.dotenv) {
    configDotenv();
  }
  if (serverConfigs?.mongoDB) {
    await dbService.createDB();
  }

  const app = express();

  if (serverConfigs?.cors) {
    app.use(cors(typeof serverConfigs.cors === "object" ? serverConfigs.cors : undefined));
  }

  if (serverConfigs?.bodyParser?.json) {
    app.use(bodyParser.json());
  }
  if (serverConfigs?.bodyParser?.urlencoded) {
    app.use(bodyParser.urlencoded(serverConfigs.bodyParser.urlencoded));
  }

  await setupRoutes(app, serverConfigs?.routes, rootDir, {
    templates: getTemplateRegistry(),
    middleware: getMiddlewareRegistry(),
  });

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
      error: err.title || "SERVER_ERROR",
      message: err.message || "An unexpected error occurred.",
    });
  });

  return app;
}

export async function startServerFromConfig(
  serverConfigs,
  { rootDir = process.cwd(), port } = {}
) {
  const listenPort =
    port ?? serverConfigs?.port ?? process.env.PORT ?? 3000;
  const app = await createApp(serverConfigs, { rootDir });
  const httpServer = app.listen(listenPort, () => {
    console.log(`Instant Express listening on http://localhost:${listenPort}`);
  });
  return { httpServer, app };
}
