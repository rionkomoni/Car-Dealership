const jwt = require("jsonwebtoken");

/**
 * Global JWT verifier (optional auth).
 * - If Authorization header is missing, request continues as guest.
 * - If token is valid, attaches req.user.
 * - If token is invalid/expired, continues as guest (public routes stay public).
 * Protected endpoints still enforce auth via route-level `auth` middleware.
 */
function attachUserFromToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();

  const parts = String(authHeader).split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer" || !parts[1]) {
    return next();
  }

  try {
    const secret = process.env.JWT_SECRET || "sekreti123";
    req.user = jwt.verify(parts[1], secret);
  } catch (error) {
    // Token i skaduar — mos blloko rutat publike si /api/cars.
  }

  return next();
}

module.exports = attachUserFromToken;

