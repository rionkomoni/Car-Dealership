/**
 * Unique slot for test-drive: same car + same calendar date + same normalized time
 * cannot be double-booked while slot_key is set (pending/scheduled).
 */

function formatPreferredDate(value) {
  if (!value) return "";
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  const s = String(value);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

function normalizePreferredTime(raw) {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  const m = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  const h = Math.min(23, Math.max(0, parseInt(m[1], 10)));
  const min = Math.min(59, Math.max(0, parseInt(m[2], 10)));
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function buildTestDriveSlotKey(carId, preferredDate, preferredTimeRaw) {
  const dateStr = formatPreferredDate(preferredDate);
  const t = normalizePreferredTime(preferredTimeRaw);
  const slot = t || "NO_TIME";
  return `${Number(carId)}|${dateStr}|${slot}`;
}

module.exports = {
  formatPreferredDate,
  normalizePreferredTime,
  buildTestDriveSlotKey,
};
