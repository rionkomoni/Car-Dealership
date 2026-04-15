const express = require("express");
const mongoose = require("mongoose");
const Contact = require("../models/Contact");
const requireAdmin = require("../middleware/requireAdmin");
const adminController = require("../controllers/adminController");

const router = express.Router();

router.use(requireAdmin);

router.get("/stats", adminController.stats);

router.get("/contacts", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }
    const messages = await Contact.find().sort({ createdAt: -1 }).lean();
    return res.json(messages);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
