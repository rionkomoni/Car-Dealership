const pool = require("../config/mysql");

async function listIdsByUserId(userId) {
  const [rows] = await pool.query(
    "SELECT car_id FROM wishlists WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );
  return rows.map((r) => r.car_id);
}

async function listWithCarsByUserId(userId) {
  const [rows] = await pool.query(
    `SELECT
      w.car_id,
      w.created_at AS wishlisted_at,
      c.id,
      c.name,
      c.price,
      c.year,
      c.image,
      c.fuel,
      c.mileage_km,
      c.sold_out,
      c.body_type
    FROM wishlists w
    INNER JOIN cars c ON c.id = w.car_id
    WHERE w.user_id = ?
    ORDER BY w.created_at DESC`,
    [userId]
  );
  return rows;
}

async function add(userId, carId) {
  await pool.query(
    "INSERT IGNORE INTO wishlists (user_id, car_id) VALUES (?, ?)",
    [userId, carId]
  );
}

async function remove(userId, carId) {
  const [result] = await pool.query(
    "DELETE FROM wishlists WHERE user_id = ? AND car_id = ?",
    [userId, carId]
  );
  return result.affectedRows > 0;
}

async function syncFromIds(userId, carIds) {
  const unique = [...new Set(carIds.map(Number).filter((id) => id > 0))];
  if (unique.length === 0) return;
  const placeholders = unique.map(() => "(?, ?)").join(", ");
  const values = unique.flatMap((carId) => [userId, carId]);
  await pool.query(
    `INSERT IGNORE INTO wishlists (user_id, car_id) VALUES ${placeholders}`,
    values
  );
}

module.exports = {
  listIdsByUserId,
  listWithCarsByUserId,
  add,
  remove,
  syncFromIds,
};
