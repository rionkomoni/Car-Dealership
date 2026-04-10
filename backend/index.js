const express = require("express");
const cors = require("cors");
const pool = require("./config/mysql");
const connectMongo = require("./config/mongo");

const authRoutes = require("./routes/authRoutes");
const carRoutes = require("./routes/carRoutes");
const contactRoutes = require("./routes/contactRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Autosallon API po punon 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/contact", contactRoutes);

const startServer = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'client'
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS cars (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        year INT NOT NULL,
        image TEXT NOT NULL,
        created_by INT
      )
    `);

    console.log("MySQL connected");
    await connectMongo();

    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  } catch (error) {
    console.log("Server error:", error.message);
  }
};

startServer();