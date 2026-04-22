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
    let testDriveCount = 0;
    try {
      const [[purchaseRow]] = await pool.query(
        "SELECT COUNT(*) AS purchases FROM purchases"
      );
      purchaseCount = purchaseRow.purchases;
    } catch (err) {
      if (err.code !== "ER_NO_SUCH_TABLE") throw err;
    }
    try {
      const [[testDriveRow]] = await pool.query(
        "SELECT COUNT(*) AS testDrives FROM test_drive_requests"
      );
      testDriveCount = testDriveRow.testDrives;
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
      testDrives: testDriveCount,
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

router.get("/test-drives", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        t.id,
        t.car_id,
        c.name AS car_name,
        c.year AS car_year,
        t.requester_name,
        t.requester_email,
        t.requester_phone,
        t.preferred_date,
        t.preferred_time,
        t.notes,
        t.status,
        t.created_at
      FROM test_drive_requests t
      LEFT JOIN cars c ON c.id = t.car_id
      ORDER BY t.created_at DESC`
    );
    return res.json(rows);
  } catch (err) {
    if (err.code === "ER_NO_SUCH_TABLE") {
      return res.json([]);
    }
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/test-drives/:id/status", async (req, res) => {
  const allowed = new Set(["pending", "scheduled", "completed", "cancelled"]);
  const id = Number(req.params.id);
  const status = String(req.body?.status || "").trim().toLowerCase();

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Invalid test-drive id." });
  }
  if (!allowed.has(status)) {
    return res.status(400).json({
      message: "Status must be one of: pending, scheduled, completed, cancelled.",
    });
  }

  try {
    const [result] = await pool.query(
      "UPDATE test_drive_requests SET status = ? WHERE id = ?",
      [status, id]
    );
    if (!result.affectedRows) {
      return res.status(404).json({ message: "Test-drive request not found." });
    }
    return res.json({ message: "Statusi u përditësua me sukses.", status });
  } catch (err) {
    if (err.code === "ER_NO_SUCH_TABLE") {
      return res.status(404).json({ message: "Test-drive storage not initialized." });
    }
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
