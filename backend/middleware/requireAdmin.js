const auth = require("./auth");

/**
 * Runs JWT auth, then allows only users with role === "admin".
 */
function requireAdmin(req, res, next) {
  auth(req, res, () => {
    const role = req.user?.role;
    const roles = Array.isArray(req.user?.roles) ? req.user.roles : [];
    const isAdmin = role === "admin" || roles.includes("ROLE_ADMIN");
    if (!isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  });
}

module.exports = requireAdmin;
