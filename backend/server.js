// backend/server.js
const express = require("express");
const mysql = require("mysql2");
const app = express();
const PORT = 5000;

// Middleware për JSON
app.use(express.json());

// --- Lidhja me MySQL ---
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "car_dealership_db",
});

// Test lidhjen me DB
db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection error:", err);
  } else {
    console.log("✅ MySQL connected!");
  }
});

// ----------------------------
// ROUTES
// ----------------------------

// Test route
app.get("/", (req, res) => {
  res.send("🚗 Car Dealership API connected to MySQL!");
});

// ============================
// AUTH ROUTES (LOGIN + REGISTER)
// ============================

// REGISTER
app.post("/api/register", (req, res) => {
  const { email, password } = req.body;

  const sql = "INSERT INTO users (email, password) VALUES (?, ?)";

  db.query(sql, [email, password], (err) => {
    if (err) {
      console.log(err);
      return res.json({ success: false, message: "Error registering user" });
    }

    res.json({ success: true, message: "User registered successfully" });
  });
});

// LOGIN
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";

  db.query(sql, [email, password], (err, result) => {
    if (err) {
      console.log(err);
      return res.json({ success: false, message: "Server error" });
    }

    if (result.length > 0) {
      res.json({
        success: true,
        message: "Login successful",
        user: result[0],
      });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  });
});

// ----------------------------
// START SERVER
// ----------------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
