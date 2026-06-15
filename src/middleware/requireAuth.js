import jwt from "jsonwebtoken";

export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "UNAUTHORIZED",
      message: "Bearer token required.",
    });
  }

  try {
    const secret = process.env.JWT_SECRET || "dev-secret";
    req.user = jwt.verify(header.slice(7), secret);
    next();
  } catch {
    return res.status(401).json({
      error: "UNAUTHORIZED",
      message: "Invalid or expired token.",
    });
  }
};
