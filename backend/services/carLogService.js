const mongoose = require("mongoose");
const CarLog = require("../models/CarLog");

async function saveCarLog(entry) {
  try {
    if (mongoose.connection.readyState !== 1) return;
    await CarLog.create(entry);
  } catch (err) {
    console.warn("CarLog skipped:", err.message);
  }
}

module.exports = { saveCarLog };
