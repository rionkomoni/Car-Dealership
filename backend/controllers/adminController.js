const adminService = require("../services/adminService");

async function stats(req, res) {
  try {
    const data = await adminService.getAdminStats();
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

module.exports = {
  stats,
};
