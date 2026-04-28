const pool = require("../config/mysql");

async function insertRefreshToken({ userId, tokenHash, expiresAt }) {
  const [result] = await pool.query(
    "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
    [userId, tokenHash, expiresAt]
  );
  return result.insertId;
}

async function findRefreshTokenByHash(tokenHash) {
  const [rows] = await pool.query(
    "SELECT id, user_id, expires_at, revoked_at, replaced_by_token_id FROM refresh_tokens WHERE token_hash = ? LIMIT 1",
    [tokenHash]
  );
  return rows[0] || null;
}

async function revokeRefreshToken(id, replacedByTokenId = null) {
  const [result] = await pool.query(
    "UPDATE refresh_tokens SET revoked_at = NOW(), replaced_by_token_id = ? WHERE id = ?",
    [replacedByTokenId, id]
  );
  return result.affectedRows > 0;
}

module.exports = {
  insertRefreshToken,
  findRefreshTokenByHash,
  revokeRefreshToken,
};

