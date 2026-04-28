const pool = require("../config/mysql");

async function countPurchases() {
  const [[row]] = await pool.query("SELECT COUNT(*) AS c FROM purchases");
  return Number(row.c || 0);
}

async function listLatestPurchases(limit = 5) {
  const [rows] = await pool.query(
    `SELECT
      p.id, p.car_id, p.buyer_name, p.amount_to_add, p.created_at, c.name AS car_name
    FROM purchases p
    LEFT JOIN cars c ON c.id = p.car_id
    ORDER BY p.created_at DESC
    LIMIT ?`,
    [Number(limit)]
  );
  return rows;
}

async function findPurchaseById(id) {
  const [rows] = await pool.query("SELECT * FROM purchases WHERE id = ?", [id]);
  return rows[0] || null;
}

module.exports = {
  countPurchases,
  listLatestPurchases,
  findPurchaseById,
};

