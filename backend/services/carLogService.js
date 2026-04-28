const mongoose = require("mongoose");
const carLogRepository = require("../repositories/carLogRepository");

async function saveCarLog(entry) {
  try {
    if (mongoose.connection.readyState !== 1) return;
    await carLogRepository.createCarLog(entry);
  } catch (err) {
    console.warn("CarLog skipped:", err.message);
  }
}

module.exports = { saveCarLog };
