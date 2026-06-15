import { signUp } from "./signUp.js";
import { signIn } from "./signIn.js";
import { health } from "./health.js";
import { listItems } from "./listItems.js";
import { signUpValidator } from "./validations/signUp.validator.js";
import { signInValidator } from "./validations/signIn.validator.js";
import { requireAuth } from "../middleware/requireAuth.js";

const builtInTemplates = {
  signUp: [signUpValidator, signUp],
  signIn: [signInValidator, signIn],
  health,
  listItems,
};

const builtInMiddleware = {
  requireAuth,
};

const customTemplates = {};
const customMiddleware = {};

export function registerTemplate(name, handler) {
  customTemplates[name] = handler;
}

export function registerMiddleware(name, handler) {
  customMiddleware[name] = handler;
}

export function getTemplateRegistry() {
  return { ...builtInTemplates, ...customTemplates };
}

export function getMiddlewareRegistry() {
  return { ...builtInMiddleware, ...customMiddleware };
}

export { builtInTemplates, builtInMiddleware };
