const express = require("express");
const mongoose = require("mongoose");
const pool = require("../config/mysql");
const requireAdmin = require("../middleware/requireAdmin");
const { buildTestDriveSlotKey } = require("../lib/testDriveSlot");
const businessLogicService = require("../application/services/BusinessLogicService");
const contactRepository = require("../repositories/contactRepository");
const auditLogRepository = require("../repositories/auditLogRepository");

const router = express.Router();

router.use(requireAdmin);

/** Full inventory for admin UI (no pagination cap). */
router.get("/cars-inventory", async (req, res) => {
  try {
    const [cars] = await pool.query("SELECT * FROM cars ORDER BY id DESC");
    const items = cars.map((row) => {
      let gallery = [];
      if (row.gallery != null && row.gallery !== "") {
        try {
          const p = JSON.parse(row.gallery);
          gallery = Array.isArray(p) ? p.filter(Boolean) : [];
        } catch {
          gallery = [];
        }
      }
      return { ...row, gallery };
    });
    return res.json({
      data: items,
      meta: { total: items.length },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

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
    let auditCount = 0;
    if (mongoose.connection.readyState === 1) {
      contactCount = await contactRepository.countContacts();
      auditCount = await auditLogRepository.countAuditLogs();
    }
    return res.json({
      users: userRow.users,
      cars: carRow.cars,
      purchases: purchaseCount,
      testDrives: testDriveCount,
      contactsMongo: contactCount,
      auditLogs: auditCount,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/audit-logs", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }
    const logs = await auditLogRepository.listAuditLogs(300);
    return res.json(logs);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/analytics", async (req, res) => {
  try {
    const snapshot = await businessLogicService.getAdminAnalyticsSnapshot();
    return res.json(snapshot);
  } catch (err) {
    if (err.code === "ER_NO_SUCH_TABLE") {
      return res.json({
        totalRevenueNet: 0,
        averageAmountToAdd: 0,
        approvedTradeIns: 0,
        rejectedTradeIns: 0,
      });
    }
    return res.status(500).json({ message: err.message });
  }
});

router.get("/contacts", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }
    const messages = await contactRepository.listContacts();
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
    const [rows] = await pool.query(
      "SELECT id, car_id, preferred_date, preferred_time FROM test_drive_requests WHERE id = ?",
      [id]
    );
    const row = rows[0];
    if (!row) {
      return res.status(404).json({ message: "Test-drive request not found." });
    }

    const slotKey =
      status === "completed" || status === "cancelled"
        ? null
        : buildTestDriveSlotKey(row.car_id, row.preferred_date, row.preferred_time);

    if (slotKey) {
      const [dups] = await pool.query(
        "SELECT id FROM test_drive_requests WHERE slot_key = ? AND id <> ? LIMIT 1",
        [slotKey, id]
      );
      if (dups.length > 0) {
        return res.status(409).json({
          message:
            "Kjo orë për këtë veturë është tashmë e zënë nga një kërkesë tjetër aktive.",
        });
      }
    }

    const [result] = await pool.query(
      "UPDATE test_drive_requests SET status = ?, slot_key = ? WHERE id = ?",
      [status, slotKey, id]
    );
    if (!result.affectedRows) {
      return res.status(404).json({ message: "Test-drive request not found." });
    }
    return res.json({ message: "Statusi u përditësua me sukses.", status });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message:
          "Kjo orë për këtë veturë është tashmë e zënë nga një kërkesë tjetër aktive.",
      });
    }
    if (err.code === "ER_NO_SUCH_TABLE") {
      return res.status(404).json({ message: "Test-drive storage not initialized." });
    }
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
