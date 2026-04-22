const mongoose = require("mongoose");

const contactContextSchema = new mongoose.Schema(
  {
    carId: { type: Number, min: 1 },
    source: {
      type: String,
      enum: ["landing", "car_detail", "buy_flow", "manual"],
      default: "manual",
    },
    tags: [{ type: String, trim: true }],
  },
  { _id: false }
);

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true },
    message: { type: String, required: true, trim: true, minlength: 5, maxlength: 3000 },
    context: { type: contactContextSchema, default: {} },
  },
  { timestamps: true }
);

contactSchema.path("email").validate((value) => /\S+@\S+\.\S+/.test(value), "Invalid email format");

module.exports = mongoose.model("Contact", contactSchema);
