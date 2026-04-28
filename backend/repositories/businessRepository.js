const { Op, fn, col, QueryTypes } = require("sequelize");
const { sequelize, Car, Purchase } = require("../dal/models");

async function getOverviewRaw() {
  const totalCars = await Car.count();
  const soldCars = await Car.count({ where: { sold_out: 1 } });
  const totalPurchases = await Purchase.count();
  const pendingTradeIns = await Purchase.count({
    where: {
      trade_in_car: { [Op.not]: null },
      trade_in_status: "pending",
    },
  });

  const pendingTestDrivesRow = await sequelize.query(
    "SELECT COUNT(*) AS c FROM test_drive_requests WHERE status IN ('pending','scheduled')",
    { type: QueryTypes.SELECT }
  );

  const latestPurchases = await Purchase.findAll({
    attributes: ["id", "car_id", "buyer_name", "amount_to_add", "created_at"],
    include: [{ model: Car, as: "car", attributes: ["name"] }],
    order: [["created_at", "DESC"]],
    limit: 5,
    raw: true,
    nest: true,
  });

  return {
    totalCars,
    soldCars,
    totalPurchases,
    pendingTradeIns,
    pendingTestDrives: Number(pendingTestDrivesRow?.[0]?.c || 0),
    latestPurchases: latestPurchases.map((p) => ({
      id: p.id,
      car_id: p.car_id,
      buyer_name: p.buyer_name,
      amount_to_add: p.amount_to_add,
      created_at: p.created_at,
      car_name: p.car?.name || null,
    })),
  };
}

async function getAdminAnalyticsRaw() {
  const revenueRow = await Purchase.findOne({
    attributes: [[fn("IFNULL", fn("SUM", col("amount_to_add")), 0), "totalRevenueNet"]],
    raw: true,
  });
  const avgRow = await Purchase.findOne({
    attributes: [[fn("IFNULL", fn("AVG", col("amount_to_add")), 0), "avgAmountToAdd"]],
    raw: true,
  });
  const approvedTradeIns = await Purchase.count({ where: { trade_in_status: "approved" } });
  const rejectedTradeIns = await Purchase.count({ where: { trade_in_status: "rejected" } });

  return {
    totalRevenueNet: Number(revenueRow?.totalRevenueNet || 0),
    averageAmountToAdd: Number(Number(avgRow?.avgAmountToAdd || 0).toFixed(2)),
    approvedTradeIns,
    rejectedTradeIns,
  };
}

async function getPurchaseForInvoice(purchaseId) {
  const row = await Purchase.findOne({
    where: { id: purchaseId },
    attributes: [
      "id",
      "car_id",
      "buyer_name",
      "buyer_email",
      "buyer_phone",
      "payment_method",
      "car_price",
      "trade_in_value",
      "amount_to_add",
      "notes",
    ],
    include: [{ model: Car, as: "car", attributes: ["name"] }],
    raw: true,
    nest: true,
  });
  if (!row) return null;
  return {
    ...row,
    car_name: row.car?.name || null,
  };
}

module.exports = {
  getOverviewRaw,
  getAdminAnalyticsRaw,
  getPurchaseForInvoice,
};

