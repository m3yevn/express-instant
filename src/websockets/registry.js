import { echoWebSocket } from "./echo.js";

const builtInWebSockets = {
  echo: echoWebSocket,
};

const customWebSockets = {};

export function registerWebSocket(name, handler) {
  customWebSockets[name] = handler;
}

export function getWebSocketRegistry() {
  return { ...builtInWebSockets, ...customWebSockets };
}

export { builtInWebSockets };
