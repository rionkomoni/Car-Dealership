const express = require("express");
const mongoose = require("mongoose");
const CarLog = require("../models/CarLog");
const requireAdmin = require("../middleware/requireAdmin");
const { logModuleEvent } = require("../lib/moduleLogger");

const router = express.Router();

router.get("/", requireAdmin, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }
    const logs = await CarLog.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    logModuleEvent("reporting", "car_logs_read", { adminId: req.user?.id });
    return res.json(logs);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
