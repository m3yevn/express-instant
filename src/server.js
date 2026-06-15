export * from "./index.js";
import path from "path";
import { fileURLToPath } from "url";
import { runCli } from "./cli.js";

const __filename = fileURLToPath(import.meta.url);
const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(__filename);

if (isMain && !process.env.VERCEL) {
  runCli();
}
