/*
  Usage:
    node scripts/manageAdmins.js list

  Later we can extend to create or prune. This script lists users flagged as admin (role admin/manager/superadmin or isAdmin true).
*/

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/userModel");

const MONGODB_URL =
  process.env.MONGODB_URI ||
  process.env.MONGODB_URL ||
  "mongodb://localhost:27017/wheelyfix";

async function listAdmins() {
  try {
    // Connect directly so we can await and query synchronously in this script
    await mongoose.connect(MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const admins = await User.find({
      $or: [
        { role: { $in: ["admin", "manager", "superadmin"] } },
        { isAdmin: true },
      ],
    }).select("email role isAdmin name phoneNumber createdAt");

    if (!admins || admins.length === 0) {
      console.log(
        "No admin users found (role admin/manager/superadmin or isAdmin true)."
      );
    } else {
      console.log(`Found ${admins.length} admin user(s):`);
      admins.forEach((a, idx) => {
        console.log(
          `\n[${idx + 1}] id: ${a._id}\n  name: ${a.name}\n  email: ${
            a.email
          }\n  role: ${a.role}\n  isAdmin: ${a.isAdmin}\n  phone: ${
            a.phoneNumber
          }\n  createdAt: ${a.createdAt}`
        );
      });
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error listing admins:", err);
    try {
      await mongoose.disconnect();
    } catch (e) {}
    process.exit(1);
  }
}

const action = process.argv[2] || "list";
if (action === "list") {
  listAdmins();
} else {
  console.error("Unknown action. Supported: list");
  process.exit(1);
}
