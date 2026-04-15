const userRepository = require("../repositories/userRepository");
const carRepository = require("../repositories/carRepository");
const contactRepository = require("../repositories/contactRepository");

async function getAdminStats() {
  const [users, cars, contactsMongo] = await Promise.all([
    userRepository.countUsers(),
    carRepository.countCars(),
    contactRepository.countContacts(),
  ]);

  return { users, cars, contactsMongo };
}

module.exports = {
  getAdminStats,
};
