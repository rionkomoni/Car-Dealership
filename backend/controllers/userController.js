const userService = require("../services/userService");
const { logModuleEvent, logModuleError } = require("../lib/moduleLogger");

async function getMe(req, res) {
  try {
    logModuleEvent("users", "profile_read", { userId: req.user?.id });
    return res.json(userService.getProfileFromToken(req.user));
  } catch (err) {
    logModuleError("users", "profile_read", err);
    return res.status(500).json({ message: err.message });
  }
}

async function listAll(req, res) {
  try {
    logModuleEvent("users", "admin_list", { byUserId: req.user?.id });
    const users = await userService.listUsersForAdmin();
    return res.json(users);
  } catch (err) {
    logModuleError("users", "admin_list", err);
    return res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getMe,
  listAll,
};
