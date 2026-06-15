import path from "path";
import { fileURLToPath } from "url";
import { loadConfig, resolveConfigPath } from "./loadConfig.js";
import { startServerFromConfig } from "./createApp.js";

const __filename = fileURLToPath(import.meta.url);
const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(__filename);

export async function runCli(argv = process.argv) {
  const configFile = resolveConfigPath(argv);
  const rootDir = process.cwd();

  try {
    const config = loadConfig({ configFile, rootDir });
    await startServerFromConfig(config, { rootDir });
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
}

if (isMain && !process.env.VERCEL) {
  runCli();
}
