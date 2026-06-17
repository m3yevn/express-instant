import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { loadConfig, resolveConfigPath } from "./loadConfig.js";
import { startServerFromConfig } from "./createApp.js";
import { exportOpenApi } from "./openapi/exportOpenApi.js";

const __filename = fileURLToPath(import.meta.url);
const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(__filename);

function resolveExportPath(argv) {
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--export-openapi") {
      return argv[i + 1] || "openapi.json";
    }
    if (arg.startsWith("--export-openapi=")) {
      return arg.split("=")[1] || "openapi.json";
    }
  }
  return null;
}

export async function runCli(argv = process.argv) {
  const exportPath = resolveExportPath(argv);
  const configFile = resolveConfigPath(argv);
  const rootDir = process.cwd();

  try {
    const config = loadConfig({ configFile, rootDir });
    if (exportPath) {
      const spec = exportOpenApi(config);
      const out = JSON.stringify(spec, null, 2);
      if (exportPath === "-") {
        process.stdout.write(out);
      } else {
        fs.writeFileSync(path.resolve(rootDir, exportPath), out);
        console.log(`OpenAPI spec written to ${exportPath}`);
      }
      return;
    }
    await startServerFromConfig(config, { rootDir });
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
}

if (isMain && !process.env.VERCEL) {
  runCli();
}
