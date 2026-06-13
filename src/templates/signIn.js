import authService from "./services/authService.js";

export const signIn = async (req, res, next) => {
  try {
    const result = await authService.signIn(req.body.username, req.body.password);
    res.json({ success: true, result });
  } catch (ex) {
    next(ex);
  }
};
