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
    let purchaseCount = 0;
    try {
      const [[purchaseRow]] = await pool.query(
        "SELECT COUNT(*) AS purchases FROM purchases"
      );
      purchaseCount = purchaseRow.purchases;
    } catch (err) {
      if (err.code !== "ER_NO_SUCH_TABLE") throw err;
    }
    let contactCount = 0;
    if (mongoose.connection.readyState === 1) {
      contactCount = await Contact.countDocuments();
    }
    return res.json({
      users: userRow.users,
      cars: carRow.cars,
      purchases: purchaseCount,
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

router.get("/purchases", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        p.id,
        p.car_id,
        c.name AS car_name,
        c.year AS car_year,
        p.buyer_name,
        p.buyer_email,
        p.buyer_phone,
        p.payment_method,
        p.car_price,
        p.trade_in_car,
        p.trade_in_year,
        p.trade_in_mileage_km,
        p.trade_in_value,
        p.amount_to_add,
        p.notes,
        p.created_at
      FROM purchases p
      LEFT JOIN cars c ON c.id = p.car_id
      ORDER BY p.created_at DESC`
    );
    return res.json(rows);
  } catch (err) {
    if (err.code === "ER_NO_SUCH_TABLE") {
      return res.json([]);
    }
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
