import { test } from "node:test";
import assert from "node:assert/strict";
import { loadConfigFromFile } from "../src/loadConfig.js";
import { exportOpenApi } from "../src/openapi/exportOpenApi.js";

test("exportOpenApi from test-crud.json", () => {
  const config = loadConfigFromFile("test/test-crud.json", process.cwd());
  const spec = exportOpenApi(config);

  assert.equal(spec.openapi, "3.0.3");
  assert.ok(spec.paths["/health"]?.get);
  assert.ok(spec.paths["/items/{collection}"]?.get);
  assert.ok(spec.paths["/items/{collection}"]?.post);
});

test("exportOpenApi adds bearerAuth when requireAuth middleware present", () => {
  const config = loadConfigFromFile("slices.example.json", process.cwd());
  const spec = exportOpenApi(config);
  const secured = Object.values(spec.paths).flatMap((p) =>
    Object.values(p).filter((op) => op.security?.length)
  );
  assert.ok(secured.length > 0, "expected at least one secured operation");
});
