const AuditLog = require("../models/AuditLog");

async function createAuditLog(entry) {
  return AuditLog.create(entry);
}

async function countAuditLogs() {
  return AuditLog.countDocuments();
}

async function listAuditLogs(limit = 300) {
  return AuditLog.find().sort({ createdAt: -1 }).limit(Number(limit)).lean();
}

module.exports = {
  createAuditLog,
  countAuditLogs,
  listAuditLogs,
};

