const jwt = require("jsonwebtoken");

/**
 * Global JWT verifier (optional auth).
 * - If Authorization header is present, verifies token and attaches req.user.
 * - If header is missing, request continues (public routes).
 * - If header is present but invalid/expired, returns 401.
 *
 * This matches the "verify token on every request" requirement while keeping
 * existing route-level auth middleware for protected endpoints.
 */
function attachUserFromToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();

  const parts = String(authHeader).split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Token i pavlefshëm" });
  }

  const token = parts[1];
  if (!token) {
    return res.status(401).json({ message: "Token i pavlefshëm" });
  }

  try {
    const secret = process.env.JWT_SECRET || "sekreti123";
    req.user = jwt.verify(token, secret);
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Token i pavlefshëm ose i skaduar" });
  }
}

module.exports = attachUserFromToken;

