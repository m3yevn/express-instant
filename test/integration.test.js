import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const baseUrl = "http://localhost:3099";

let child;

const waitForServer = async (retries = 20) => {
  for (let i = 0; i < retries; i += 1) {
    try {
      const res = await fetch(`${baseUrl}/health`);
      if (res.ok) {
        return;
      }
    } catch {
      // server not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Server did not start in time");
};

before(async () => {
  child = spawn("node", ["src/server.js", "--config-file", "test/test-server.json"], {
    cwd: root,
    stdio: "pipe",
    shell: process.platform === "win32",
  });
  await waitForServer();
});

after(async () => {
  if (child && !child.killed) {
    child.kill("SIGTERM");
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (!child.killed) {
      child.kill("SIGKILL");
    }
  }
});

test("health template returns healthy status", async () => {
  const res = await fetch(`${baseUrl}/health`);
  const json = await res.json();

  assert.equal(res.status, 200);
  assert.equal(json.success, true);
  assert.equal(json.status, "healthy");
  assert.ok(typeof json.uptime === "number");
});

test("function route returns pong", async () => {
  const res = await fetch(`${baseUrl}/api/ping`);
  const json = await res.json();

  assert.equal(res.status, 200);
  assert.equal(json.success, true);
  assert.equal(json.message, "pong");
});
