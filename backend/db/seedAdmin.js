const bcrypt = require("bcryptjs");

/**
 * Ensures an admin account exists (from ADMIN_EMAIL / ADMIN_PASSWORD in .env).
 * Creates the user if missing; promotes existing user with that email to admin.
 */
async function seedAdminUser(pool) {
  const rawEmail = process.env.ADMIN_EMAIL || "admin@gmail.com";
  const email = String(rawEmail).trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "12345678";
  const hash = await bcrypt.hash(password, 10);

  const [rows] = await pool.query(
    "SELECT id, role FROM users WHERE email = ?",
    [email]
  );

  if (rows.length === 0) {
    await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      ["Administrator", email, hash, "admin"]
    );
    console.log(
      `Admin user created: ${email} (password from ADMIN_PASSWORD in .env)`
    );
    return;
  }

  await pool.query("UPDATE users SET role = ?, password = ? WHERE id = ?", [
    "admin",
    hash,
    rows[0].id,
  ]);
  console.log(`Admin user synced: ${email} (role + password refreshed)`);
}

module.exports = { seedAdminUser };
