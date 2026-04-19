const pool = require("../config/mysql");

async function findUserByEmail(email) {
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
  return rows[0] || null;
}

async function createUser({ name, email, password, role }) {
  const [result] = await pool.query(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    [name, email, password, role]
  );
  return { id: result.insertId, name, email, role };
}

async function countUsers() {
  const [[row]] = await pool.query("SELECT COUNT(*) AS users FROM users");
  return Number(row.users || 0);
}

async function listUsersSafe() {
  const [rows] = await pool.query(
    "SELECT id, name, email, role FROM users ORDER BY id ASC"
  );
  return rows;
}

module.exports = {
  findUserByEmail,
  createUser,
  countUsers,
  listUsersSafe,
};
