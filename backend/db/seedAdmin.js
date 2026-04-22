const bcrypt = require("bcryptjs");

/**
 * Ensures privileged accounts exist:
 * - admin (ADMIN_EMAIL / ADMIN_PASSWORD)
 * - manager (MANAGER_EMAIL / MANAGER_PASSWORD)
 */
async function seedAdminUser(pool) {
  async function upsertPrivilegedUser({ name, email, password, role }) {
    const normalizedEmail = String(email).trim().toLowerCase();
    const hash = await bcrypt.hash(password, 10);

    const [rows] = await pool.query(
      "SELECT id, role FROM users WHERE email = ?",
      [normalizedEmail]
    );

    if (rows.length === 0) {
      await pool.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [name, normalizedEmail, hash, role]
      );
      console.log(`${role} user created: ${normalizedEmail}`);
      return;
    }

    await pool.query("UPDATE users SET role = ?, password = ? WHERE id = ?", [
      role,
      hash,
      rows[0].id,
    ]);
    console.log(`${role} user synced: ${normalizedEmail} (role + password refreshed)`);
  }

  await upsertPrivilegedUser({
    name: "Administrator",
    email: process.env.ADMIN_EMAIL || "admin@gmail.com",
    password: process.env.ADMIN_PASSWORD || "12345678",
    role: "admin",
  });

  await upsertPrivilegedUser({
    name: "Manager",
    email: process.env.MANAGER_EMAIL || "manager@gmail.com",
    password: process.env.MANAGER_PASSWORD || "12345678",
    role: "manager",
  });
}

module.exports = { seedAdminUser };
