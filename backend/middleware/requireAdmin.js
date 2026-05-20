const requireRole = require("./requireRole");

/** JWT auth + ROLE_ADMIN / role admin */
const requireAdmin = requireRole(["admin", "ROLE_ADMIN"]);

module.exports = requireAdmin;
