import { test, before, beforeEach, after, describe } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import {
  loadConfigFromFile,
  startServerFromConfig,
  validateConfig,
} from "../src/index.js";
import authService from "../src/templates/services/authService.js";
import dbService from "../src/templates/services/dbService.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const jwtSecret = "test-jwt-secret";

let baseUrl = "http://localhost:3099";
let httpServer;
let memoryServer;

const startInProcess = async (configFile, port = 0, env = {}) => {
  await stopInProcess();
  delete process.env.MONGODB_STRING;
  delete process.env.MONGODB_NAME;
  Object.assign(process.env, { JWT_SECRET: jwtSecret, ...env });
  const config = loadConfigFromFile(configFile, root);
  const result = await startServerFromConfig(config, { rootDir: root, port });
  httpServer = result.httpServer;
  baseUrl = `http://localhost:${result.port}`;
};

const stopInProcess = async () => {
  if (httpServer) {
    await new Promise((resolve) => httpServer.close(resolve));
    httpServer = null;
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
};

describe("config validation", () => {
  test("accepts valid test-server config", () => {
    const config = loadConfigFromFile("test/test-server.json", root);
    assert.ok(config.routes["/health"]);
  });

  test("rejects invalid route type", () => {
    assert.throws(
      () =>
        validateConfig({
          port: 3000,
          routes: {
            "/bad": { get: { type: "not-a-type" } },
          },
        }),
      /unknown route type/
    );
  });
});

describe("HTTP routes", () => {
  before(async () => {
    await startInProcess("test/test-server.json");
  });

  after(async () => {
    await stopInProcess();
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
});

describe("listItems CRUD", () => {
  before(async () => {
    await startInProcess("test/test-crud.json");
  });

  after(async () => {
    await stopInProcess();
  });

  test("creates and lists items", async () => {
    const collection = `todos-${crypto.randomUUID()}`;
    const createRes = await fetch(`${baseUrl}/items/${collection}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Ship v1.1" }),
    });
    const created = await createRes.json();
    assert.equal(createRes.status, 201);
    assert.equal(created.item.title, "Ship v1.1");

    const listRes = await fetch(`${baseUrl}/items/${collection}`);
    const list = await listRes.json();
    assert.equal(list.items.length, 1);
  });
});

describe("requireAuth middleware", () => {
  before(async () => {
    await startInProcess("test/test-auth-guard.json");
  });

  after(async () => {
    await stopInProcess();
  });

  test("blocks unauthenticated requests", async () => {
    const res = await fetch(`${baseUrl}/protected`);
    assert.equal(res.status, 401);
  });

  test("allows valid bearer token", async () => {
    const token = jwt.sign({ username: "demo" }, jwtSecret);
    const res = await fetch(`${baseUrl}/protected`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    assert.equal(res.status, 200);
    assert.equal(json.user, "demo");
  });
});

describe("rateLimit middleware", () => {
  before(async () => {
    process.env.RATE_LIMIT_MAX = "2";
    process.env.RATE_LIMIT_WINDOW_MS = "60000";
    await startInProcess("test/test-rate-limit.json", 0);
  });

  beforeEach(async () => {
    const { resetRateLimit } = await import("../src/middleware/rateLimit.js");
    resetRateLimit();
  });

  after(async () => {
    delete process.env.RATE_LIMIT_MAX;
    delete process.env.RATE_LIMIT_WINDOW_MS;
    await stopInProcess();
  });

  test("allows requests under limit", async () => {
    const res = await fetch(`${baseUrl}/limited`);
    assert.equal(res.status, 200);
  });

  test("returns 429 when exceeded", async () => {
    await fetch(`${baseUrl}/limited`);
    await fetch(`${baseUrl}/limited`);
    const res = await fetch(`${baseUrl}/limited`);
    assert.equal(res.status, 429);
    const json = await res.json();
    assert.equal(json.error, "RATE_LIMITED");
  });

  test("does not rate limit open routes", async () => {
    for (let i = 0; i < 5; i++) {
      const res = await fetch(`${baseUrl}/open`);
      assert.equal(res.status, 200);
    }
  });
});

describe("auth templates with MongoDB", () => {
  before(async () => {
    memoryServer = await MongoMemoryServer.create();
    delete process.env.MONGODB_STRING;
    delete process.env.MONGODB_NAME;
    process.env.MONGODB_STRING = memoryServer.getUri();
    process.env.MONGODB_NAME = "express-instant-test";
    process.env.JWT_SECRET = jwtSecret;
    await dbService.createDB();
  });

  after(async () => {
    if (dbService.client) {
      await dbService.client.close();
      dbService.client = null;
      dbService.db = null;
    }
    if (memoryServer) {
      await memoryServer.stop();
      memoryServer = null;
    }
  });

  test("signUp and signIn via authService", async () => {
    const signUp = await authService.signUp("alice", "secret123");
    assert.equal(signUp.username, "alice");
    assert.ok(signUp.token);

    const signIn = await authService.signIn("alice", "secret123");
    assert.equal(signIn.username, "alice");
    assert.ok(signIn.token);
  });
});
