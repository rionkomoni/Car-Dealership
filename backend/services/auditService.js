const mongoose = require("mongoose");
const auditLogRepository = require("../repositories/auditLogRepository");

function auditContextFromReq(req) {
  return {
    userId: req.user?.id,
    userEmail: req.user?.email,
    role: req.user?.role,
    ip: req.headers["x-forwarded-for"] || req.ip,
    userAgent: req.headers["user-agent"],
  };
}

async function saveAuditLog(entry) {
  try {
    if (mongoose.connection.readyState !== 1) return;
    await auditLogRepository.createAuditLog(entry);
  } catch (err) {
    console.warn("AuditLog skipped:", err.message);
  }
}

module.exports = {
  saveAuditLog,
  auditContextFromReq,
};

