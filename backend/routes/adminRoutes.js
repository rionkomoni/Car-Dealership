const express = require("express");
const mongoose = require("mongoose");
const pool = require("../config/mysql");
const Contact = require("../models/Contact");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

router.use(requireAdmin);

router.get("/stats", async (req, res) => {
  try {
    const [[userRow]] = await pool.query(
      "SELECT COUNT(*) AS users FROM users"
    );
    const [[carRow]] = await pool.query("SELECT COUNT(*) AS cars FROM cars");
    let contactCount = 0;
    if (mongoose.connection.readyState === 1) {
      contactCount = await Contact.countDocuments();
    }
    return res.json({
      users: userRow.users,
      cars: carRow.cars,
      contactsMongo: contactCount,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

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
