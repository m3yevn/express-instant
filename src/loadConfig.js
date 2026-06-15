import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_CONFIG_PATH = path.join(__dirname, "default.json");

export function loadDefaultConfig() {
  return JSON.parse(fs.readFileSync(DEFAULT_CONFIG_PATH, "utf-8"));
}

export function resolveConfigPath(argv = process.argv) {
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--config-file" || arg === "-c") {
      return argv[i + 1];
    }
    if (arg.startsWith("--config-file=")) {
      return arg.split("=")[1];
    }
  }
  return process.env.EXPRESS_INSTANT_CONFIG;
}

export function loadConfigFromFile(configFile, rootDir = process.cwd()) {
  const resolved = path.isAbsolute(configFile)
    ? configFile
    : path.join(rootDir, configFile);

  if (!fs.existsSync(resolved)) {
    throw new Error(`Config file not found: ${resolved}`);
  }

  const raw = fs.readFileSync(resolved, "utf-8");
  if (!raw.trim()) {
    throw new Error(`Config file is empty: ${resolved}`);
  }

  return JSON.parse(raw);
}

export function loadConfig({ configFile, rootDir = process.cwd() } = {}) {
  const pathToLoad = configFile || resolveConfigPath();
  if (pathToLoad) {
    return loadConfigFromFile(pathToLoad, rootDir);
  }
  return loadDefaultConfig();
}
