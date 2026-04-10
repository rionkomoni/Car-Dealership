const mongoose = require("mongoose");

const connectMongo = async () => {
  const uri =
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/car_dealership";

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("MongoDB connected");
  } catch (error) {
    console.log(
      "MongoDB not available (contact form & car logs need MongoDB):",
      error.message
    );
  }
};

module.exports = connectMongo;
