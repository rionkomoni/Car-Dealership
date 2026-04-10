const mongoose = require("mongoose");

const connectMongo = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/autosallon_logs");
    console.log("MongoDB connected");
  } catch (error) {
    console.log("MongoDB error:", error.message);
  }
};

module.exports = connectMongo;