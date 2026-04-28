const auth = require("./auth");

/**
 * Allows access for role manager or admin.
 */
function requireManagerOrAdmin(req, res, next) {
  auth(req, res, () => {
    const role = req.user?.role;
    const roles = Array.isArray(req.user?.roles) ? req.user.roles : [];
    const ok =
      role === "manager" ||
      role === "admin" ||
      roles.includes("ROLE_MANAGER") ||
      roles.includes("ROLE_ADMIN");
    if (!ok) {
      return res.status(403).json({ message: "Manager or admin access required" });
    }
    next();
  });
}

module.exports = requireManagerOrAdmin;

