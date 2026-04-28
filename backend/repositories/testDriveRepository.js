const pool = require("../config/mysql");

async function countPendingOrScheduled() {
  const [[row]] = await pool.query(
    "SELECT COUNT(*) AS c FROM test_drive_requests WHERE status IN ('pending','scheduled')"
  );
  return Number(row.c || 0);
}

async function listTestDrives(limit = 300) {
  const [rows] = await pool.query(
    `SELECT
      t.id, t.car_id, t.requester_name, t.requester_email, t.requester_phone,
      t.preferred_date, t.preferred_time, t.status, t.created_at,
      c.name AS car_name, c.year AS car_year
    FROM test_drive_requests t
    LEFT JOIN cars c ON c.id = t.car_id
    ORDER BY t.created_at DESC
    LIMIT ?`,
    [Number(limit)]
  );
  return rows;
}

module.exports = {
  countPendingOrScheduled,
  listTestDrives,
};

