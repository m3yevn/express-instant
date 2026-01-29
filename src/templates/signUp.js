import authService from "./services/authService.js";

export const signUp = (req, res) => {
  const result = authService.signUp(req.body.username, req.body.password);
  res.json({ success: true, result });
};
