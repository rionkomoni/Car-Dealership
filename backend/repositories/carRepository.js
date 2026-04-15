const pool = require("../config/mysql");

async function listCars() {
  const [rows] = await pool.query("SELECT * FROM cars ORDER BY id DESC");
  return rows;
}

async function getCarById(id) {
  const [rows] = await pool.query("SELECT * FROM cars WHERE id = ?", [id]);
  return rows[0] || null;
}

async function createCar(payload) {
  const [result] = await pool.query(
    `INSERT INTO cars (
      name, price, year, image, created_by,
      mileage_km, fuel, transmission, engine, power_hp, color, body_type, description,
      gallery
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.name,
      payload.price,
      payload.year,
      payload.image,
      payload.created_by,
      payload.mileage_km,
      payload.fuel,
      payload.transmission,
      payload.engine,
      payload.power_hp,
      payload.color,
      payload.body_type,
      payload.description,
      payload.gallery,
    ]
  );
  return result.insertId;
}

async function updateCarById(id, payload) {
  const [result] = await pool.query(
    `UPDATE cars SET
      name = ?, price = ?, year = ?, image = ?,
      mileage_km = ?, fuel = ?, transmission = ?, engine = ?, power_hp = ?,
      color = ?, body_type = ?, description = ?, gallery = ?
    WHERE id = ?`,
    [
      payload.name,
      payload.price,
      payload.year,
      payload.image,
      payload.mileage_km,
      payload.fuel,
      payload.transmission,
      payload.engine,
      payload.power_hp,
      payload.color,
      payload.body_type,
      payload.description,
      payload.gallery,
      id,
    ]
  );
  return result.affectedRows > 0;
}

async function deleteCarById(id) {
  const [result] = await pool.query("DELETE FROM cars WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

async function countCars() {
  const [[row]] = await pool.query("SELECT COUNT(*) AS cars FROM cars");
  return Number(row.cars || 0);
}

module.exports = {
  listCars,
  getCarById,
  createCar,
  updateCarById,
  deleteCarById,
  countCars,
};
