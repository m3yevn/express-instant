/** OpenAPI operation hints for built-in templates */

export const templateSpecs = {
  health: {
    summary: "Health check",
    responses: { 200: { description: "Service healthy" } },
  },
  signUp: {
    summary: "Register user",
    requestBody: { required: true },
    responses: { 201: { description: "User created with token" } },
  },
  signIn: {
    summary: "Sign in",
    requestBody: { required: true },
    responses: { 200: { description: "JWT token" } },
  },
  listItems: {
    summary: "In-memory CRUD",
    responses: { 200: { description: "Items list or item" } },
  },
  mongoItems: {
    summary: "MongoDB CRUD",
    responses: { 200: { description: "Items from collection" } },
  },
};
