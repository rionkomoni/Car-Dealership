const userRepository = require("../repositories/userRepository");

function getProfileFromToken(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

async function listUsersForAdmin() {
  return userRepository.listUsersSafe();
}

module.exports = {
  getProfileFromToken,
  listUsersForAdmin,
};
