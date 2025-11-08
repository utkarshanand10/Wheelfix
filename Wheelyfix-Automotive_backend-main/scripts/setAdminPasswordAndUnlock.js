/*
  Set admin password and unlock account.

  Usage:
    node scripts/setAdminPasswordAndUnlock.js <email> <newPassword>

  WARNING: Using weak passwords (like 'admin123') is insecure. Use only for short-lived testing and rotate immediately.
*/

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/userModel");

const MONGODB_URL =
  process.env.MONGODB_URI ||
  process.env.MONGODB_URL ||
  "mongodb://localhost:27017/wheelyfix";

async function setPasswordAndUnlock(email, newPassword) {
  try {
    if (!newPassword) {
      console.error("New password must be provided.");
      process.exit(1);
    }

    await mongoose.connect(MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.error(`User with email ${email} not found.`);
      await mongoose.disconnect();
      process.exit(1);
    }

    user.password = newPassword; // triggers pre-save hash
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.status = "active";

    await user.save();

    console.log(`Password updated and account unlocked for ${email}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error updating user:", err);
    try {
      await mongoose.disconnect();
    } catch (e) {}
    process.exit(1);
  }
}

const email = process.argv[2];
const newPass = process.argv[3];
if (!email || !newPass) {
  console.error(
    "Usage: node scripts/setAdminPasswordAndUnlock.js <email> <newPassword>"
  );
  process.exit(1);
}

setPasswordAndUnlock(email, newPass);
