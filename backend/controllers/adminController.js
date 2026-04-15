const adminService = require("../services/adminService");
const { logModuleEvent } = require("../lib/moduleLogger");

async function stats(req, res) {
  try {
    const data = await adminService.getAdminStats();
    logModuleEvent("reporting", "stats_read", { adminId: req.user?.id });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

module.exports = {
  stats,
};
