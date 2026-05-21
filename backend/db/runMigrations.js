const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

/**
 * Ekzekuton skedarët .sql nga backend/db/migrations/ (rend alfabetik).
 * Përdor multipleStatements për procedure/trigger me ; brenda BEGIN…END.
 */
async function runSqlMigrations() {
  const dir = path.join(__dirname, "migrations");
  if (!fs.existsSync(dir)) return;

  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) return;

  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "localhost",
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD ?? "",
    database: process.env.MYSQL_DB || "car_dealership",
    multipleStatements: true,
  });

  try {
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const sql = fs
        .readFileSync(fullPath, "utf8")
        .replace(/^--.*$/gm, "")
        .trim();
      if (!sql) continue;
      try {
        await conn.query(sql);
      } catch (err) {
        const benign =
          err.code === "ER_SP_ALREADY_EXISTS" ||
          err.code === "ER_TRG_ALREADY_EXISTS" ||
          (err.message && /already exists/i.test(err.message));
        if (!benign) {
          console.warn(`[migrations] ${file}: ${err.message}`);
        }
      }
    }
  } finally {
    await conn.end();
  }
}

module.exports = { runSqlMigrations };
