// backend/server.js
const express = require("express");
const mysql = require("mysql2");
const app = express();
const PORT = 5000;

// Middleware për JSON
app.use(express.json());

// --- Lidhja me MySQL ---
const db = mysql.createConnection({
  host: "localhost",        // default i XAMPP/phpMyAdmin
  user: "root",             // username i MySQL (zakonisht root)
  password: "",             // password, lë bosh nëse nuk ke
  database: "car_dealership_db" // emri i bazës që krijove në phpMyAdmin
});

// Test lidhjen
db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection error:", err);
  } else {
    console.log("✅ MySQL connected!");
  }
});

// Test route
app.get("/", (req, res) => {
  res.send("🚗 Car Dealership API connected to MySQL!");
});

// Nis serverin
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
