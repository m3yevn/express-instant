import { WebSocketServer } from "ws";
import { getWebSocketRegistry } from "./registry.js";

export function setupWebSockets(httpServer, websockets = {}) {
  const registry = getWebSocketRegistry();
  const servers = [];

  for (const [path, config] of Object.entries(websockets)) {
    const handler = registry[config.template];
    if (!handler) {
      throw new Error(`Unknown websocket template: ${config.template}`);
    }

    const wss = new WebSocketServer({ server: httpServer, path });
    wss.on("connection", (ws, req) => handler(ws, req));
    servers.push(wss);
  }

  return servers;
}
