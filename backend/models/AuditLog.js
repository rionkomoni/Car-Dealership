const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    module: { type: String, required: true, index: true },
    action: { type: String, required: true, index: true },
    outcome: { type: String, enum: ["success", "failure"], required: true, index: true },
    userId: { type: Number, index: true },
    userEmail: { type: String },
    role: { type: String },
    ip: { type: String },
    userAgent: { type: String },
    targetType: { type: String },
    targetId: { type: String },
    message: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);

