const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository");
const authTokenRepository = require("../repositories/authTokenRepository");
const { generateRefreshToken, hashToken, parseTtlMs } = require("../lib/tokens");
const { saveAuditLog } = require("./auditService");

function getJwtSecret() {
  return process.env.JWT_SECRET || "sekreti123";
}

function getAccessTokenTtl() {
  const ms = parseTtlMs(process.env.ACCESS_TOKEN_TTL || "15m", 15 * 60 * 1000);
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

function buildAccessToken(user) {
  const roleClaim = toRoleClaim(user.role);
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      roles: [roleClaim],
    },
    getJwtSecret(),
    { expiresIn: getAccessTokenTtl() }
  );
}

function buildAuthResponse(user, accessToken, refreshToken) {
  return {
    success: true,
    message: "Login me sukses",
    token: accessToken,
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
  };
}

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function registerUser({ name, email, password }) {
  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = await userRepository.findUserByEmail(normalizedEmail);
  if (existing) {
    throw httpError(400, "Ky email ekziston");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  await userRepository.createUser({
    name,
    email: normalizedEmail,
    password: hashedPassword,
    role: "client",
  });
  return { message: "Regjistrimi u krye me sukses" };
}

async function loginUser({ email, password }, auditContext = {}) {
  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await userRepository.findUserByEmail(normalizedEmail);

  if (!user) {
    await saveAuditLog({
      module: "auth",
      action: "login",
      outcome: "failure",
      message: "user_not_found",
      userEmail: normalizedEmail,
      ...auditContext,
    });
    throw httpError(400, "Përdoruesi nuk u gjet");
  }

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
      ...auditContext,
    });
    throw httpError(400, "Password i gabuar");
  }

  const accessToken = buildAccessToken(user);
  const refreshToken = generateRefreshToken();
  const refreshHash = hashToken(refreshToken);
  const refreshExpiresAt = new Date(Date.now() + getRefreshTokenTtlMs());

  try {
    await authTokenRepository.insertRefreshToken({
      userId: user.id,
      tokenHash: refreshHash,
      expiresAt: refreshExpiresAt,
    });
  } catch (e) {
    throw httpError(500, e.message);
  }

  await saveAuditLog({
    module: "auth",
    action: "login",
    outcome: "success",
    userId: user.id,
    userEmail: user.email,
    role: user.role,
    ...auditContext,
  });

  return buildAuthResponse(user, accessToken, refreshToken);
}

async function refreshSession(refreshTokenRaw, auditContext = {}) {
  const incomingHash = hashToken(refreshTokenRaw);
  const tokenRow = await authTokenRepository.findRefreshTokenByHash(incomingHash);

  if (!tokenRow) {
    await saveAuditLog({
      module: "auth",
      action: "refresh",
      outcome: "failure",
      message: "token_not_found",
      ...auditContext,
    });
    throw httpError(401, "Refresh token i pavlefshëm");
  }
  if (tokenRow.revoked_at) {
    await saveAuditLog({
      module: "auth",
      action: "refresh",
      outcome: "failure",
      message: "token_revoked",
      userId: tokenRow.user_id,
      ...auditContext,
    });
    throw httpError(401, "Refresh token është revokuar");
  }
  if (new Date(tokenRow.expires_at).getTime() <= Date.now()) {
    await saveAuditLog({
      module: "auth",
      action: "refresh",
      outcome: "failure",
      message: "token_expired",
      userId: tokenRow.user_id,
      ...auditContext,
    });
    throw httpError(401, "Refresh token është skaduar");
  }

  const user = await userRepository.findUserById(tokenRow.user_id);
  if (!user) {
    throw httpError(401, "Përdoruesi nuk u gjet");
  }

  const newRefreshToken = generateRefreshToken();
  const newRefreshHash = hashToken(newRefreshToken);
  const newRefreshExpiresAt = new Date(Date.now() + getRefreshTokenTtlMs());
  const newId = await authTokenRepository.insertRefreshToken({
    userId: user.id,
    tokenHash: newRefreshHash,
    expiresAt: newRefreshExpiresAt,
  });
  await authTokenRepository.revokeRefreshToken(tokenRow.id, newId);

  const accessToken = buildAccessToken(user);
  await saveAuditLog({
    module: "auth",
    action: "refresh",
    outcome: "success",
    userId: user.id,
    userEmail: user.email,
    role: user.role,
    ...auditContext,
  });

  return buildAuthResponse(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
    newRefreshToken
  );
}

async function logoutUser(refreshTokenRaw, auditContext = {}) {
  const incomingHash = hashToken(refreshTokenRaw);
  const affected = await authTokenRepository.revokeRefreshTokenByHash(incomingHash);
  await saveAuditLog({
    module: "auth",
    action: "logout",
    outcome: "success",
    message: affected ? "token_revoked" : "already_revoked_or_missing",
    ...auditContext,
  });
  return {
    success: true,
    message: affected ? "Logout u krye me sukses" : "Token ishte tashmë i revokuar",
  };
}

module.exports = {
  toRoleClaim,
  getAccessTokenTtl,
  registerUser,
  loginUser,
  refreshSession,
  logoutUser,
};
