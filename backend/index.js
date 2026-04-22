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
  syncSampleCarsByName,
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

async function ensurePurchaseColumns() {
  const fragments = [
    "ADD COLUMN trade_in_status VARCHAR(20) NOT NULL DEFAULT 'pending'",
    "ADD COLUMN manager_review_note TEXT NULL",
    "ADD COLUMN manager_reviewed_by INT NULL",
    "ADD COLUMN manager_reviewed_at TIMESTAMP NULL",
  ];

  for (const fragment of fragments) {
    try {
      await pool.query(`ALTER TABLE purchases ${fragment}`);
    } catch (err) {
      const dup =
        err.code === "ER_DUP_FIELDNAME" ||
        (err.message && err.message.includes("Duplicate column name"));
      if (!dup) {
        throw err;
      }
    }
  }
}

async function constraintExists(tableName, constraintName, type) {
  const [rows] = await pool.query(
    `SELECT 1
     FROM information_schema.TABLE_CONSTRAINTS
     WHERE CONSTRAINT_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND CONSTRAINT_NAME = ?
       AND CONSTRAINT_TYPE = ?
     LIMIT 1`,
    [tableName, constraintName, type]
  );
  return rows.length > 0;
}

async function indexExists(tableName, indexName) {
  const [rows] = await pool.query(
    `SELECT 1
     FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND INDEX_NAME = ?
     LIMIT 1`,
    [tableName, indexName]
  );
  return rows.length > 0;
}

async function ensureForeignKey(tableName, constraintName, ddlSql) {
  if (await constraintExists(tableName, constraintName, "FOREIGN KEY")) return;
  await pool.query(ddlSql);
}

async function ensureCheck(tableName, constraintName, ddlSql) {
  try {
    if (await constraintExists(tableName, constraintName, "CHECK")) return;
    await pool.query(ddlSql);
  } catch (err) {
    // Some MySQL/MariaDB variants handle CHECK differently; keep startup resilient.
    console.warn(`CHECK constraint skipped (${constraintName}): ${err.message}`);
  }
}

async function ensureIndex(tableName, indexName, ddlSql) {
  if (await indexExists(tableName, indexName)) return;
  await pool.query(ddlSql);
}

async function ensureProcedure(name, createSql) {
  const [rows] = await pool.query(
    `SELECT 1
     FROM information_schema.ROUTINES
     WHERE ROUTINE_SCHEMA = DATABASE()
       AND ROUTINE_NAME = ?
       AND ROUTINE_TYPE = 'PROCEDURE'
     LIMIT 1`,
    [name]
  );
  if (rows.length > 0) {
    await pool.query(`DROP PROCEDURE \`${name}\``);
  }
  await pool.query(createSql);
}

async function ensureTrigger(name, createSql) {
  const [rows] = await pool.query(
    `SELECT 1
     FROM information_schema.TRIGGERS
     WHERE TRIGGER_SCHEMA = DATABASE()
       AND TRIGGER_NAME = ?
     LIMIT 1`,
    [name]
  );
  if (rows.length > 0) {
    await pool.query(`DROP TRIGGER \`${name}\``);
  }
  await pool.query(createSql);
}

async function ensureAdvancedRelationalModel() {
  // CHECK constraints (business/data integrity).
  await ensureCheck(
    "users",
    "chk_users_role",
    "ALTER TABLE users ADD CONSTRAINT chk_users_role CHECK (role IN ('client','manager','admin'))"
  );
  await ensureCheck(
    "cars",
    "chk_cars_price_positive",
    "ALTER TABLE cars ADD CONSTRAINT chk_cars_price_positive CHECK (price > 0)"
  );
  await ensureCheck(
    "cars",
    "chk_cars_year_range",
    "ALTER TABLE cars ADD CONSTRAINT chk_cars_year_range CHECK (year BETWEEN 1950 AND 2100)"
  );
  await ensureCheck(
    "cars",
    "chk_cars_sold_out_bool",
    "ALTER TABLE cars ADD CONSTRAINT chk_cars_sold_out_bool CHECK (sold_out IN (0,1))"
  );
  await ensureCheck(
    "purchases",
    "chk_purchases_tradein_status",
    "ALTER TABLE purchases ADD CONSTRAINT chk_purchases_tradein_status CHECK (trade_in_status IN ('pending','approved','rejected'))"
  );
  await ensureCheck(
    "purchases",
    "chk_purchases_tradein_non_negative",
    "ALTER TABLE purchases ADD CONSTRAINT chk_purchases_tradein_non_negative CHECK (trade_in_value >= 0)"
  );
  await ensureCheck(
    "purchases",
    "chk_purchases_amount_non_negative",
    "ALTER TABLE purchases ADD CONSTRAINT chk_purchases_amount_non_negative CHECK (amount_to_add >= 0)"
  );

  // Foreign keys.
  await ensureForeignKey(
    "cars",
    "fk_cars_created_by",
    "ALTER TABLE cars ADD CONSTRAINT fk_cars_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE"
  );
  await ensureForeignKey(
    "purchases",
    "fk_purchases_car_id",
    "ALTER TABLE purchases ADD CONSTRAINT fk_purchases_car_id FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE ON UPDATE CASCADE"
  );
  await ensureForeignKey(
    "purchases",
    "fk_purchases_buyer_user_id",
    "ALTER TABLE purchases ADD CONSTRAINT fk_purchases_buyer_user_id FOREIGN KEY (buyer_user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE"
  );
  await ensureForeignKey(
    "purchases",
    "fk_purchases_manager_reviewed_by",
    "ALTER TABLE purchases ADD CONSTRAINT fk_purchases_manager_reviewed_by FOREIGN KEY (manager_reviewed_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE"
  );

  // Optimized indexes.
  await ensureIndex(
    "cars",
    "idx_cars_sold_out_year",
    "CREATE INDEX idx_cars_sold_out_year ON cars (sold_out, year)"
  );
  await ensureIndex(
    "cars",
    "idx_cars_price",
    "CREATE INDEX idx_cars_price ON cars (price)"
  );
  await ensureIndex(
    "purchases",
    "idx_purchases_created_at",
    "CREATE INDEX idx_purchases_created_at ON purchases (created_at)"
  );
  await ensureIndex(
    "purchases",
    "idx_purchases_status_created",
    "CREATE INDEX idx_purchases_status_created ON purchases (trade_in_status, created_at)"
  );
  await ensureIndex(
    "purchases",
    "idx_purchases_buyer_email",
    "CREATE INDEX idx_purchases_buyer_email ON purchases (buyer_email)"
  );
}

async function ensureDbProgrammability() {
  await ensureProcedure(
    "sp_tradein_review_queue",
    `CREATE PROCEDURE sp_tradein_review_queue()
     BEGIN
       SELECT
         id, car_id, buyer_name, buyer_email, trade_in_car, trade_in_year,
         trade_in_mileage_km, trade_in_value, amount_to_add, created_at
       FROM purchases
       WHERE trade_in_car IS NOT NULL
         AND trade_in_status = 'pending'
       ORDER BY created_at DESC;
     END`
  );

  await ensureTrigger(
    "trg_purchases_before_insert",
    `CREATE TRIGGER trg_purchases_before_insert
     BEFORE INSERT ON purchases
     FOR EACH ROW
     BEGIN
       SET NEW.buyer_email = LOWER(TRIM(NEW.buyer_email));
       IF NEW.trade_in_value IS NULL THEN
         SET NEW.trade_in_value = 0;
       END IF;
       IF NEW.amount_to_add IS NULL OR NEW.amount_to_add < 0 THEN
         SET NEW.amount_to_add = GREATEST(0, NEW.car_price - IFNULL(NEW.trade_in_value, 0));
       END IF;
       IF NEW.trade_in_car IS NULL OR TRIM(NEW.trade_in_car) = '' THEN
         SET NEW.trade_in_status = 'approved';
       END IF;
     END`
  );

  await ensureTrigger(
    "trg_purchases_before_update",
    `CREATE TRIGGER trg_purchases_before_update
     BEFORE UPDATE ON purchases
     FOR EACH ROW
     BEGIN
       IF NEW.trade_in_status = 'rejected' THEN
         SET NEW.amount_to_add = NEW.car_price;
       END IF;
       IF NEW.amount_to_add < 0 THEN
         SET NEW.amount_to_add = 0;
       END IF;
     END`
  );
}

const startServer = async () => {
  let startupStep = "initialization";
  try {
    startupStep = "ensure mysql database";
    await ensureMysqlDatabase();

    startupStep = "ensure users table";
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'client'
      )
    `);

    startupStep = "ensure cars table";
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

    startupStep = "ensure purchases table";
    await pool.query(`
      CREATE TABLE IF NOT EXISTS purchases (
        id INT AUTO_INCREMENT PRIMARY KEY,
        car_id INT NOT NULL UNIQUE,
        buyer_user_id INT NULL,
        buyer_name VARCHAR(120) NOT NULL,
        buyer_email VARCHAR(120) NOT NULL,
        buyer_phone VARCHAR(40) NULL,
        payment_method VARCHAR(40) NOT NULL,
        car_price DECIMAL(10,2) NOT NULL,
        trade_in_car VARCHAR(150) NULL,
        trade_in_year INT NULL,
        trade_in_mileage_km INT NULL,
        trade_in_value DECIMAL(10,2) NOT NULL DEFAULT 0,
        trade_in_status VARCHAR(20) NOT NULL DEFAULT 'pending',
        amount_to_add DECIMAL(10,2) NOT NULL,
        notes TEXT NULL,
        manager_review_note TEXT NULL,
        manager_reviewed_by INT NULL,
        manager_reviewed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    startupStep = "ensure test_drive_requests table";
    await pool.query(`
      CREATE TABLE IF NOT EXISTS test_drive_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        car_id INT NOT NULL,
        requester_user_id INT NULL,
        requester_name VARCHAR(120) NOT NULL,
        requester_email VARCHAR(120) NOT NULL,
        requester_phone VARCHAR(40) NULL,
        preferred_date DATE NOT NULL,
        preferred_time VARCHAR(40) NULL,
        notes TEXT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_test_drive_created_at (created_at),
        INDEX idx_test_drive_status_date (status, preferred_date)
      )
    `);
    startupStep = "ensure purchases columns";
    await ensurePurchaseColumns();
    startupStep = "ensure db constraints and indexes";
    await ensureAdvancedRelationalModel();
    startupStep = "ensure db procedures and triggers";
    await ensureDbProgrammability();

    startupStep = "ensure cars spec columns";
    await ensureCarSpecColumns(pool);
    startupStep = "seed sample cars";
    await seedSampleCarsIfEmpty(pool);
    startupStep = "sync sample cars visuals/specs";
    await syncSampleCarsByName(pool);
    startupStep = "seed admin user";
    await seedAdminUser(pool);

    console.log("MySQL connected (phpMyAdmin / XAMPP)");
    startupStep = "connect mongodb";
    await connectMongo();

    startupStep = "listen";
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    const message = error?.message || "Unknown startup error";
    const code = error?.code ? ` (${error.code})` : "";
    console.log(`Server error at "${startupStep}"${code}: ${message}`);
    if (error?.code === "ECONNREFUSED" || error?.code === "ECONNRESET") {
      console.log(
        "Hint: start MySQL in XAMPP and verify backend/.env MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DB."
      );
    }
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };