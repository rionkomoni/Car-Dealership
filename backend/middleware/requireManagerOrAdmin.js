const requireRole = require("./requireRole");

/** JWT auth + manager or admin (legacy role or ROLE_* claims) */
const requireManagerOrAdmin = requireRole(["manager", "admin", "ROLE_MANAGER", "ROLE_ADMIN"]);

module.exports = requireManagerOrAdmin;

