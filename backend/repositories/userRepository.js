const pool = require("../config/mysql");

async function findUserByEmail(email) {
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
  return rows[0] || null;
}

async function findUserById(id) {
  const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
  return rows[0] || null;
}

async function createUser({ name, email, password, role }) {
  const [result] = await pool.query(
    "INSERT INTO users (name, email, password, role, is_active) VALUES (?, ?, ?, ?, ?)",
    [name, email, password, role, 0]
  );
  return { id: result.insertId, name, email, role, is_active: 0 };
}

async function createUserAdmin({ name, email, password, role, is_active }) {
  const active = is_active ? 1 : 0;
  const [result] = await pool.query(
    "INSERT INTO users (name, email, password, role, is_active, activated_at) VALUES (?, ?, ?, ?, ?, ?)",
    [name, email, password, role, active, active ? new Date() : null]
  );
  return { id: result.insertId, name, email, role, is_active: active };
}

async function updateUserById(id, patch) {
  const fields = [];
  const params = [];
  if (patch.name !== undefined) {
    fields.push("name = ?");
    params.push(patch.name);
  }
  if (patch.email !== undefined) {
    fields.push("email = ?");
    params.push(patch.email);
  }
  if (patch.role !== undefined) {
    fields.push("role = ?");
    params.push(patch.role);
  }
  if (patch.is_active !== undefined) {
    fields.push("is_active = ?");
    params.push(patch.is_active ? 1 : 0);
    fields.push("activated_at = ?");
    params.push(patch.is_active ? new Date() : null);
  }
  if (patch.password !== undefined) {
    fields.push("password = ?");
    params.push(patch.password);
  }
  if (!fields.length) return false;
  params.push(id);
  const [result] = await pool.query(
    `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
    params
  );
  return result.affectedRows > 0;
}

async function deleteUserById(id) {
  const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

async function countUsers() {
  const [[row]] = await pool.query("SELECT COUNT(*) AS users FROM users");
  return Number(row.users || 0);
}

async function listUsersSafe() {
  const [rows] = await pool.query(
    "SELECT id, name, email, role, is_active, activated_at FROM users ORDER BY id ASC"
  );
  return rows;
}

async function setUserActiveById(id) {
  const [result] = await pool.query(
    "UPDATE users SET is_active = 1, activated_at = NOW() WHERE id = ?",
    [id]
  );
  return result.affectedRows > 0;
}

async function setUserPasswordById(id, hashedPassword) {
  const [result] = await pool.query("UPDATE users SET password = ? WHERE id = ?", [
    hashedPassword,
    id,
  ]);
  return result.affectedRows > 0;
}

async function insertActivationToken({ user_id, token_hash, expires_at }) {
  const [result] = await pool.query(
    "INSERT INTO account_activation_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
    [user_id, token_hash, expires_at]
  );
  return result.insertId;
}

async function findActivationTokenByHash(token_hash) {
  const [rows] = await pool.query(
    `SELECT id, user_id, expires_at, used_at
     FROM account_activation_tokens
     WHERE token_hash = ?
     LIMIT 1`,
    [token_hash]
  );
  return rows[0] || null;
}

async function markActivationTokenUsed(id) {
  const [result] = await pool.query(
    "UPDATE account_activation_tokens SET used_at = NOW() WHERE id = ? AND used_at IS NULL",
    [id]
  );
  return result.affectedRows > 0;
}

async function insertPasswordResetToken({ user_id, token_hash, expires_at }) {
  const [result] = await pool.query(
    "INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
    [user_id, token_hash, expires_at]
  );
  return result.insertId;
}

async function findPasswordResetTokenByHash(token_hash) {
  const [rows] = await pool.query(
    `SELECT id, user_id, expires_at, used_at
     FROM password_reset_tokens
     WHERE token_hash = ?
     LIMIT 1`,
    [token_hash]
  );
  return rows[0] || null;
}

async function markPasswordResetTokenUsed(id) {
  const [result] = await pool.query(
    "UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ? AND used_at IS NULL",
    [id]
  );
  return result.affectedRows > 0;
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  createUserAdmin,
  updateUserById,
  deleteUserById,
  countUsers,
  listUsersSafe,
  setUserActiveById,
  setUserPasswordById,
  insertActivationToken,
  findActivationTokenByHash,
  markActivationTokenUsed,
  insertPasswordResetToken,
  findPasswordResetTokenByHash,
  markPasswordResetTokenUsed,
};
