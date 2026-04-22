const auth = require("./auth");

/**
 * Allows access for role manager or admin.
 */
function requireManagerOrAdmin(req, res, next) {
  auth(req, res, () => {
    const role = req.user?.role;
    if (role !== "manager" && role !== "admin") {
      return res.status(403).json({ message: "Manager or admin access required" });
    }
    next();
  });
}

module.exports = requireManagerOrAdmin;

