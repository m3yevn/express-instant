import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createApp } from "./server.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..");
const configPath =
  process.env.EXPRESS_INSTANT_CONFIG || path.join(rootDir, "vercel/server.json");

const configs = JSON.parse(fs.readFileSync(configPath, "utf-8"));
const app = await createApp(configs, { rootDir });

export default app;
