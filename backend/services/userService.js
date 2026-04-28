const userRepository = require("../repositories/userRepository");
const bcrypt = require("bcryptjs");
const { generateRefreshToken, hashToken, parseTtlMs } = require("../lib/tokens");
const { sendActivationEmail, sendPasswordResetEmail } = require("./emailService");

function getProfileFromToken(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    roles: user.roles,
  };
}

async function listUsersForAdmin() {
  return userRepository.listUsersSafe();
}

async function getUserForAdmin(id) {
  const u = await userRepository.findUserById(id);
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    is_active: Number(u.is_active) === 1,
    activated_at: u.activated_at,
  };
}

async function createUserAsAdmin({ name, email, password, role, is_active }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return userRepository.createUserAdmin({
    name,
    email,
    password: hashedPassword,
    role,
    is_active,
  });
}

async function updateUserAsAdmin(id, patch) {
  const next = { ...patch };
  if (next.password) {
    next.password = await bcrypt.hash(next.password, 10);
  }
  return userRepository.updateUserById(id, next);
}

async function deleteUserAsAdmin(id) {
  return userRepository.deleteUserById(id);
}

function getActivationTtlMs() {
  return parseTtlMs(process.env.ACTIVATION_TOKEN_TTL || "1d", 24 * 60 * 60 * 1000);
}

function getPasswordResetTtlMs() {
  return parseTtlMs(process.env.PASSWORD_RESET_TOKEN_TTL || "30m", 30 * 60 * 1000);
}

async function requestActivationForEmail(email) {
  const normalized = String(email).trim().toLowerCase();
  const user = await userRepository.findUserByEmail(normalized);
  // Avoid user enumeration: always return ok-ish response.
  if (!user) return { ok: true, activationLink: null, delivered: false };
  if (Number(user.is_active) === 1) return { ok: true, activationLink: null, delivered: false };

  const raw = generateRefreshToken(); // reuse strong random generator
  const tokenHash = hashToken(raw);
  const expiresAt = new Date(Date.now() + getActivationTtlMs());
  await userRepository.insertActivationToken({
    user_id: user.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  // Activation endpoint is backend-driven so it works without frontend changes.
  const apiBase = process.env.PUBLIC_API_URL || "http://localhost:5000";
  const activationLink = `${apiBase}/api/users/activate?token=${raw}`;
  const sent = await sendActivationEmail({
    to: normalized,
    activationLink,
  });
  return { ok: true, activationLink, delivered: sent.delivered };
}

async function activateAccountByToken(rawToken) {
  const tokenHash = hashToken(rawToken);
  const t = await userRepository.findActivationTokenByHash(tokenHash);
  if (!t) return { ok: false, reason: "invalid" };
  if (t.used_at) return { ok: false, reason: "used" };
  if (new Date(t.expires_at).getTime() <= Date.now()) return { ok: false, reason: "expired" };

  await userRepository.markActivationTokenUsed(t.id);
  await userRepository.setUserActiveById(t.user_id);
  return { ok: true };
}

async function changePasswordWithVerification(userId, currentPassword, newPassword) {
  const user = await userRepository.findUserById(userId);
  if (!user) return { ok: false, reason: "not_found" };
  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) return { ok: false, reason: "current_invalid" };
  const hashed = await bcrypt.hash(newPassword, 10);
  await userRepository.setUserPasswordById(userId, hashed);
  return { ok: true };
}

async function requestPasswordResetForEmail(email) {
  const normalized = String(email).trim().toLowerCase();
  const user = await userRepository.findUserByEmail(normalized);
  if (!user) return { ok: true, resetLink: null, delivered: false };

  const raw = generateRefreshToken();
  const tokenHash = hashToken(raw);
  const expiresAt = new Date(Date.now() + getPasswordResetTtlMs());
  await userRepository.insertPasswordResetToken({
    user_id: user.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  const appBase = process.env.PUBLIC_APP_URL || "http://localhost:3000";
  const resetLink = `${appBase}/reset-password?token=${raw}`;
  const sent = await sendPasswordResetEmail({
    to: normalized,
    resetLink,
  });
  return { ok: true, resetLink, delivered: sent.delivered };
}

async function resetPasswordByToken(rawToken, newPassword) {
  const tokenHash = hashToken(rawToken);
  const t = await userRepository.findPasswordResetTokenByHash(tokenHash);
  if (!t) return { ok: false, reason: "invalid" };
  if (t.used_at) return { ok: false, reason: "used" };
  if (new Date(t.expires_at).getTime() <= Date.now()) return { ok: false, reason: "expired" };

  const hashed = await bcrypt.hash(newPassword, 10);
  await userRepository.setUserPasswordById(t.user_id, hashed);
  await userRepository.markPasswordResetTokenUsed(t.id);
  return { ok: true, userId: t.user_id };
}

module.exports = {
  getProfileFromToken,
  listUsersForAdmin,
  getUserForAdmin,
  createUserAsAdmin,
  updateUserAsAdmin,
  deleteUserAsAdmin,
  requestActivationForEmail,
  activateAccountByToken,
  changePasswordWithVerification,
  requestPasswordResetForEmail,
  resetPasswordByToken,
};
