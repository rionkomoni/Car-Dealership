const CarLog = require("../models/CarLog");

async function createCarLog(entry) {
  return CarLog.create(entry);
}

module.exports = {
  createCarLog,
};

