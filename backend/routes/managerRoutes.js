const express = require("express");
const Joi = require("joi");
const pool = require("../config/mysql");
const requireManagerOrAdmin = require("../middleware/requireManagerOrAdmin");

const router = express.Router();

router.use(requireManagerOrAdmin);

const tradeInDecisionSchema = Joi.object({
  decision: Joi.string().valid("approved", "rejected").required(),
  review_note: Joi.string().max(1500).allow("", null).optional(),
});

router.get("/overview", async (req, res) => {
  try {
    const [[totalRow]] = await pool.query("SELECT COUNT(*) AS totalCars FROM cars");
    const [[soldRow]] = await pool.query(
      "SELECT COUNT(*) AS soldCars FROM cars WHERE sold_out = 1"
    );
    const [[availableRow]] = await pool.query(
      "SELECT COUNT(*) AS availableCars FROM cars WHERE sold_out = 0"
    );
    const [[purchaseRow]] = await pool.query(
      "SELECT COUNT(*) AS totalPurchases FROM purchases"
    );
    const [latestPurchases] = await pool.query(
      `SELECT
        p.id, p.car_id, p.buyer_name, p.amount_to_add, p.created_at, c.name AS car_name
      FROM purchases p
      LEFT JOIN cars c ON c.id = p.car_id
      ORDER BY p.created_at DESC
      LIMIT 5`
    );

    return res.json({
      totalCars: totalRow.totalCars,
      soldCars: soldRow.soldCars,
      availableCars: availableRow.availableCars,
      totalPurchases: purchaseRow.totalPurchases,
      latestPurchases,
    });
  } catch (err) {
    if (err.code === "ER_NO_SUCH_TABLE") {
      return res.json({
        totalCars: 0,
        soldCars: 0,
        availableCars: 0,
        totalPurchases: 0,
        latestPurchases: [],
      });
    }
    return res.status(500).json({ message: err.message });
  }
});

router.get("/trade-ins/pending", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        p.id, p.car_id, p.buyer_name, p.buyer_email, p.car_price, p.trade_in_car,
        p.trade_in_year, p.trade_in_mileage_km, p.trade_in_value, p.amount_to_add,
        p.trade_in_status, p.created_at, c.name AS car_name
      FROM purchases p
      LEFT JOIN cars c ON c.id = p.car_id
      WHERE p.trade_in_car IS NOT NULL
        AND p.trade_in_status = 'pending'
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

router.patch("/trade-ins/:purchaseId/decision", async (req, res) => {
  const { error, value } = tradeInDecisionSchema.validate(req.body, {
    stripUnknown: true,
  });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const purchaseId = Number(req.params.purchaseId);
  if (!Number.isInteger(purchaseId) || purchaseId <= 0) {
    return res.status(400).json({ message: "Invalid purchase id." });
  }

  try {
    const [rows] = await pool.query(
      `SELECT id, car_price, trade_in_value, trade_in_status, trade_in_car
       FROM purchases WHERE id = ?`,
      [purchaseId]
    );
    const purchase = rows[0];
    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found." });
    }
    if (!purchase.trade_in_car) {
      return res.status(400).json({ message: "This purchase has no trade-in to review." });
    }
    if (purchase.trade_in_status !== "pending") {
      return res.status(409).json({ message: "Trade-in is already reviewed." });
    }

    const amountToAdd =
      value.decision === "approved"
        ? Math.max(0, Number(purchase.car_price) - Number(purchase.trade_in_value || 0))
        : Number(purchase.car_price);

    await pool.query(
      `UPDATE purchases SET
        trade_in_status = ?,
        amount_to_add = ?,
        manager_review_note = ?,
        manager_reviewed_by = ?,
        manager_reviewed_at = NOW()
      WHERE id = ?`,
      [
        value.decision,
        amountToAdd,
        value.review_note || null,
        req.user?.id || null,
        purchaseId,
      ]
    );

    return res.json({
      message:
        value.decision === "approved"
          ? "Trade-in u aprovua."
          : "Trade-in u refuzua. Amount to add u përditësua me çmimin e plotë.",
      amount_to_add: amountToAdd,
      trade_in_status: value.decision,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;

