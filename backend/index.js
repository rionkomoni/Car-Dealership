const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const mysql = require("mysql2/promise");
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const pool = require("./config/mysql");
const connectMongo = require("./config/mongo");
const apiLimiter = require("./middleware/rateLimiter");
const openApiSpec = require("./docs/openapi");


const authRoutes = require("./routes/authRoutes");
const carRoutes = require("./routes/carRoutes");
const contactRoutes = require("./routes/contactRoutes");
const carLogRoutes = require("./routes/carLogRoutes");
const adminRoutes = require("./routes/adminRoutes");
const v1Routes = require("./routes/v1");

const { registerApiModules } = require("./modules/registerModules");

const {
  ensureCarSpecColumns,
  seedSampleCarsIfEmpty,
} = require("./db/seedSampleCars");
const { seedAdminUser } = require("./db/seedAdmin");

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());
app.use("/api", apiLimiter);

app.get("/", (req, res) => {
  res.send("Autosallon API po punon 🚀");
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.use("/api/v1", v1Routes);

registerApiModules(app);

async function ensureMysqlDatabase() {
  if (process.env.MYSQL_AUTO_CREATE_DB !== "true") {
    return;
  }

  const host = process.env.MYSQL_HOST || "localhost";
  const user = process.env.MYSQL_USER || "root";
  const password = process.env.MYSQL_PASSWORD ?? "";
  const rawDb = process.env.MYSQL_DB || "car_dealership";
  const database = rawDb.replace(/[^a-zA-Z0-9_]/g, "") || "car_dealership";

  const conn = await mysql.createConnection({ host, user, password });
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
  await conn.end();
}

const startServer = async () => {
  try {
    await ensureMysqlDatabase();

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
        name VARCHAR(120) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        year INT NOT NULL,
        image TEXT NOT NULL,
        created_by INT NULL,
        mileage_km INT NULL,
        fuel VARCHAR(40) NULL,
        transmission VARCHAR(40) NULL,
        engine VARCHAR(100) NULL,
        power_hp SMALLINT UNSIGNED NULL,
        color VARCHAR(50) NULL,
        body_type VARCHAR(40) NULL,
        description TEXT NULL,
        gallery LONGTEXT NULL,
        sold_out TINYINT(1) NOT NULL DEFAULT 0
      )
    `);

    await ensureCarSpecColumns(pool);
    await seedSampleCarsIfEmpty(pool);
    await seedAdminUser(pool);

    console.log("MySQL connected (phpMyAdmin / XAMPP)");
    await connectMongo();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.log("Server error:", error.message);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };