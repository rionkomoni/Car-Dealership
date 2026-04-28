const pool = require("../config/mysql");

async function findCarById(id) {
  const [rows] = await pool.query("SELECT * FROM cars WHERE id = ?", [id]);
  return rows[0] || null;
}

async function listCars({ limit = 100, offset = 0 } = {}) {
  const [rows] = await pool.query(
    "SELECT * FROM cars ORDER BY id DESC LIMIT ? OFFSET ?",
    [Number(limit), Number(offset)]
  );
  return rows;
}

async function countCars() {
  const [[row]] = await pool.query("SELECT COUNT(*) AS c FROM cars");
  return Number(row.c || 0);
}

async function countCarsBySoldOut(soldOut) {
  const [[row]] = await pool.query("SELECT COUNT(*) AS c FROM cars WHERE sold_out = ?", [
    soldOut ? 1 : 0,
  ]);
  return Number(row.c || 0);
}

async function updateSoldOutById(id, soldOut) {
  const [result] = await pool.query("UPDATE cars SET sold_out = ? WHERE id = ?", [
    soldOut ? 1 : 0,
    id,
  ]);
  return result.affectedRows > 0;
}

module.exports = {
  findCarById,
  listCars,
  countCars,
  countCarsBySoldOut,
  updateSoldOutById,
};

