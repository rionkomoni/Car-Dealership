const auth = require("./auth");

function normalizeRoleClaims(user) {
  const legacy = user?.role ? [String(user.role).toLowerCase()] : [];
  const claims = Array.isArray(user?.roles) ? user.roles.map((r) => String(r).toUpperCase()) : [];
  return { legacy, claims };
}

function hasRequiredRole(user, allowed) {
  const { legacy, claims } = normalizeRoleClaims(user);
  return allowed.some((role) => {
    const r = String(role).toLowerCase();
    const claim = r.startsWith("role_") ? r.toUpperCase() : `ROLE_${r.toUpperCase()}`;
    return legacy.includes(r.replace(/^role_/, "")) || claims.includes(claim);
  });
}

/**
 * JWT auth + role check (legacy `role` or `roles` claims e.g. ROLE_ADMIN).
 * @param {string[]} allowedRoles - e.g. ['admin'], ['manager','admin'], ['ROLE_ADMIN']
 */
function requireRole(allowedRoles) {
  const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return (req, res, next) => {
    auth(req, res, () => {
      if (!hasRequiredRole(req.user, allowed)) {
        return res.status(403).json({ message: "Access denied" });
      }
      next();
    });
  };
}

module.exports = requireRole;
