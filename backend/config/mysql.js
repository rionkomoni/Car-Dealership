const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD ?? "",
  database: process.env.MYSQL_DB || "car_dealership",
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 5,
  idleTimeout: 30000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  connectTimeout: 30000,
  namedPlaceholders: true,
});

const RETRYABLE_CODES = new Set([
  "PROTOCOL_CONNECTION_LOST",
  "ECONNRESET",
  "ETIMEDOUT",
  "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR",
]);

function isRetryableMysqlError(err) {
  return (
    RETRYABLE_CODES.has(err.code) ||
    (typeof err.message === "string" && err.message.includes("Connection lost"))
  );
}

/** Përdor lidhje të freskëta — i dobishëm për MySQL remote (Railway) që mbyll idle connections. */
async function queryWithRetry(sql, params = [], maxAttempts = 5) {
  let lastError;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let conn;
    try {
      conn = await pool.getConnection();
      const result = await conn.query(sql, params);
      conn.release();
      return result;
    } catch (err) {
      lastError = err;
      if (conn) conn.destroy();
      if (isRetryableMysqlError(err) && attempt < maxAttempts - 1) {
        console.warn(
          `MySQL retry ${attempt + 1}/${maxAttempts - 1}: ${err.message}`
        );
        await new Promise((resolve) =>
          setTimeout(resolve, 500 * (attempt + 1))
        );
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

pool.queryWithRetry = queryWithRetry;
pool.query = queryWithRetry;

module.exports = pool;