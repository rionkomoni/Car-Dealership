const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const pool = require("../config/mysql");
const { generateRefreshToken, hashToken, parseTtlMs } = require("../lib/tokens");
const { saveAuditLog, auditContextFromReq } = require("../services/auditService");

const router = express.Router();

function getAccessTokenTtl() {
  // Short-lived access token for security (Phase III).
  const ms = parseTtlMs(process.env.ACCESS_TOKEN_TTL || "15m", 15 * 60 * 1000);
  // jsonwebtoken accepts seconds as number or string (e.g. "15m").
  return Math.max(60, Math.floor(ms / 1000));
}

function getRefreshTokenTtlMs() {
  return parseTtlMs(process.env.REFRESH_TOKEN_TTL || "7d", 7 * 24 * 60 * 60 * 1000);
}

function toRoleClaim(role) {
  const r = String(role || "").trim().toUpperCase();
  if (!r) return "ROLE_USER";
  return r.startsWith("ROLE_") ? r : `ROLE_${r}`;
}

router.post("/register", async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string()
      .trim()
      .lowercase()
      .email({ tlds: { allow: false } })
      .required(),
    password: Joi.string().min(4).required(),
  });

  const payload = {
    ...req.body,
    email: String(req.body?.email || "")
      .trim()
      .toLowerCase(),
  };
  const { error } = schema.validate(payload);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { name, email, password } = payload;
  const normalizedEmail = String(email).trim().toLowerCase();

  try {
    const [existingUser] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [normalizedEmail]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Ky email ekziston" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, normalizedEmail, hashedPassword, "client"]
    );

    return res.status(201).json({ message: "Regjistrimi u krye me sukses" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  const schema = Joi.object({
    email: Joi.string()
      .trim()
      .lowercase()
      .email({ tlds: { allow: false } })
      .required(),
    password: Joi.string().required(),
  });

  const payload = {
    ...req.body,
    email: String(req.body?.email || "")
      .trim()
      .toLowerCase(),
  };
  const { error } = schema.validate(payload);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, password } = payload;
  const normalizedEmail = String(email).trim().toLowerCase();
  const secret = process.env.JWT_SECRET || "sekreti123";

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      normalizedEmail,
    ]);

    if (rows.length === 0) {
      await saveAuditLog({
        module: "auth",
        action: "login",
        outcome: "failure",
        message: "user_not_found",
        userEmail: normalizedEmail,
        ...auditContextFromReq(req),
      });
      return res.status(400).json({ message: "Përdoruesi nuk u gjet" });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      await saveAuditLog({
        module: "auth",
        action: "login",
        outcome: "failure",
        message: "invalid_password",
        userId: user.id,
        userEmail: user.email,
        role: user.role,
        ...auditContextFromReq(req),
      });
      return res.status(400).json({ message: "Password i gabuar" });
    }

    const roleClaim = toRoleClaim(user.role);
    const accessToken = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role, // legacy/simple role
        roles: [roleClaim], // ROLE_* claim (Phase III requirement)
      },
      secret,
      { expiresIn: getAccessTokenTtl() }
    );

    const refreshToken = generateRefreshToken();
    const refreshHash = hashToken(refreshToken);
    const refreshExpiresAt = new Date(Date.now() + getRefreshTokenTtlMs());
    try {
      await pool.query(
        "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
        [user.id, refreshHash, refreshExpiresAt]
      );
    } catch (e) {
      // If refresh token table isn't initialized yet (first run), fail loudly.
      return res.status(500).json({ message: e.message });
    }

    await saveAuditLog({
      module: "auth",
      action: "login",
      outcome: "success",
      userId: user.id,
      userEmail: user.email,
      role: user.role,
      ...auditContextFromReq(req),
    });

    return res.json({
      success: true,
      message: "Login me sukses",
      // Backwards-compatible key expected by current frontend:
      token: accessToken,
      // OAuth2-like naming:
      accessToken,
      refreshToken,
      tokenType: "Bearer",
      expiresIn: getAccessTokenTtl(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/refresh", async (req, res) => {
  const schema = Joi.object({
    refreshToken: Joi.string().min(20).required(),
  });
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const secret = process.env.JWT_SECRET || "sekreti123";
  const incomingHash = hashToken(value.refreshToken);

  try {
    const [rows] = await pool.query(
      `SELECT id, user_id, expires_at, revoked_at
       FROM refresh_tokens
       WHERE token_hash = ?
       LIMIT 1`,
      [incomingHash]
    );
    const tokenRow = rows[0];
    if (!tokenRow) {
      await saveAuditLog({
        module: "auth",
        action: "refresh",
        outcome: "failure",
        message: "token_not_found",
        ...auditContextFromReq(req),
      });
      return res.status(401).json({ message: "Refresh token i pavlefshëm" });
    }
    if (tokenRow.revoked_at) {
      await saveAuditLog({
        module: "auth",
        action: "refresh",
        outcome: "failure",
        message: "token_revoked",
        userId: tokenRow.user_id,
        ...auditContextFromReq(req),
      });
      return res.status(401).json({ message: "Refresh token është revokuar" });
    }
    if (new Date(tokenRow.expires_at).getTime() <= Date.now()) {
      await saveAuditLog({
        module: "auth",
        action: "refresh",
        outcome: "failure",
        message: "token_expired",
        userId: tokenRow.user_id,
        ...auditContextFromReq(req),
      });
      return res.status(401).json({ message: "Refresh token është skaduar" });
    }

    const [userRows] = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1",
      [tokenRow.user_id]
    );
    const user = userRows[0];
    if (!user) {
      return res.status(401).json({ message: "Përdoruesi nuk u gjet" });
    }

    // Rotate: revoke old token and issue a new one.
    const newRefreshToken = generateRefreshToken();
    const newRefreshHash = hashToken(newRefreshToken);
    const newRefreshExpiresAt = new Date(Date.now() + getRefreshTokenTtlMs());

    const [insertResult] = await pool.query(
      "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
      [user.id, newRefreshHash, newRefreshExpiresAt]
    );
    const newId = insertResult.insertId;

    await pool.query(
      "UPDATE refresh_tokens SET revoked_at = NOW(), replaced_by_token_id = ? WHERE id = ?",
      [newId, tokenRow.id]
    );

    const roleClaim = toRoleClaim(user.role);
    const accessToken = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        roles: [roleClaim],
      },
      secret,
      { expiresIn: getAccessTokenTtl() }
    );

    await saveAuditLog({
      module: "auth",
      action: "refresh",
      outcome: "success",
      userId: user.id,
      userEmail: user.email,
      role: user.role,
      ...auditContextFromReq(req),
    });

    return res.json({
      success: true,
      token: accessToken,
      accessToken,
      refreshToken: newRefreshToken,
      tokenType: "Bearer",
      expiresIn: getAccessTokenTtl(),
      user,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/logout", async (req, res) => {
  const schema = Joi.object({
    refreshToken: Joi.string().min(20).required(),
  });
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const incomingHash = hashToken(value.refreshToken);
  try {
    const [result] = await pool.query(
      "UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = ? AND revoked_at IS NULL",
      [incomingHash]
    );
    await saveAuditLog({
      module: "auth",
      action: "logout",
      outcome: "success",
      message: result.affectedRows ? "token_revoked" : "already_revoked_or_missing",
      ...auditContextFromReq(req),
    });
    return res.json({
      success: true,
      message: result.affectedRows ? "Logout u krye me sukses" : "Token ishte tashmë i revokuar",
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
