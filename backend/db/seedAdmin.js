const bcrypt = require("bcryptjs");

/**
 * Ensures an admin account exists (from ADMIN_EMAIL / ADMIN_PASSWORD in .env).
 * Creates the user if missing; promotes existing user with that email to admin.
 */
async function seedAdminUser(pool) {
  const rawEmail = process.env.ADMIN_EMAIL || "admin@cardealership.local";
  const email = String(rawEmail).trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "admin123";

  const [rows] = await pool.query(
    "SELECT id, role FROM users WHERE email = ?",
    [email]
  );

  if (rows.length === 0) {
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      ["Administrator", email, hash, "admin"]
    );
    console.log(
      `Admin user created: ${email} (password from ADMIN_PASSWORD in .env)`
    );
    return;
  }

  if (rows[0].role !== "admin") {
    await pool.query("UPDATE users SET role = ? WHERE id = ?", [
      "admin",
      rows[0].id,
    ]);
    console.log(`User promoted to admin: ${email}`);
  }
}

module.exports = { seedAdminUser };
