// scripts/createAdmin.js
// Run ONCE to create the admin record in the database:
//   node scripts/createAdmin.js
// After running, you can delete this file or keep it for reference.

const bcrypt = require("bcryptjs");
require("dotenv").config();

const sequelize = require("../config/database");
const Admin = require("../models/Admin");

const createAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected\n");

    // Sync only the admins table
    await Admin.sync({ alter: true });
    console.log("✅ Admins table ready\n");

    // ── Change these values as you like ──────────────────────────────────
    const username = "ashirvachana_admin";
    const email = "admin@ashirvachana.com"; // ← change this to your real email
    const password = "divine@admin2026"; // ← change to a strong password
    // ─────────────────────────────────────────────────────────────────────

    const existing = await Admin.findOne({ where: { username } });
    if (existing) {
      console.log(
        "⚠️  Admin already exists. To reset, delete the row and re-run.",
      );
      console.log(`   Username: ${existing.username}`);
      console.log(`   Email:    ${existing.email}`);
      process.exit(0);
    }

    const hashed = await bcrypt.hash(password, 12);
    const admin = await Admin.create({ username, email, password: hashed });

    console.log("🎉 Admin created successfully!");
    console.log("─────────────────────────────────");
    console.log(`   ID:       ${admin.id}`);
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email:    ${admin.email}`);
    console.log(`   Password: ${password}  (raw — save this securely)`);
    console.log("─────────────────────────────────");
    console.log("\nYou can now log in at POST /api/admin/login");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

createAdmin();
