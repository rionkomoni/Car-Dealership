const mongoose = require("mongoose");

const carLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: [
        "view",
        "create",
        "update",
        "delete",
        "purchase",
        "mark_sold_out",
        "mark_available",
      ],
      required: true,
    },
    carId: { type: Number },
    userId: { type: Number },
    carName: { type: String },
    details: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CarLog", carLogSchema);
