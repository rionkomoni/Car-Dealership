const crypto = require("crypto");

function parseTtlMs(ttl, fallbackMs) {
  if (!ttl) return fallbackMs;
  const s = String(ttl).trim();
  const m = s.match(/^(\d+)\s*(ms|s|m|h|d)?$/i);
  if (!m) return fallbackMs;
  const n = Number(m[1]);
  const unit = (m[2] || "ms").toLowerCase();
  const mult =
    unit === "ms"
      ? 1
      : unit === "s"
        ? 1000
        : unit === "m"
          ? 60_000
          : unit === "h"
            ? 3_600_000
            : unit === "d"
              ? 86_400_000
              : 1;
  return n * mult;
}

function hashToken(raw) {
  return crypto.createHash("sha256").update(String(raw)).digest("hex");
}

function generateRefreshToken() {
  // URL-safe enough token (base64url) without padding.
  return crypto.randomBytes(48).toString("base64url");
}

module.exports = {
  parseTtlMs,
  hashToken,
  generateRefreshToken,
};

