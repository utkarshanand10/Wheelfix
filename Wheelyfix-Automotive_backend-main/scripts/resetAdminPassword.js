/*
  Reset an admin user's password.

  Usage:
    node scripts/resetAdminPassword.js <email> [newPassword]

  If newPassword is omitted, the script generates a strong random password and prints it.
*/

require("dotenv").config();
const mongoose = require("mongoose");
const crypto = require("crypto");
const User = require("../models/userModel");

const MONGODB_URL =
  process.env.MONGODB_URI ||
  process.env.MONGODB_URL ||
  "mongodb://localhost:27017/wheelyfix";

async function resetPassword(email, newPassword) {
  try {
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

    const passwordToSet =
      newPassword || crypto.randomBytes(12).toString("base64");

    // Assigning to user.password triggers the pre('save') hook to hash it
    user.password = passwordToSet;
    await user.save();

    console.log("Password reset successful for:", email);
    console.log("New password:", passwordToSet);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error resetting password:", err);
    try {
      await mongoose.disconnect();
    } catch (e) {}
    process.exit(1);
  }
}

const email = process.argv[2];
const newPass = process.argv[3];

if (!email) {
  console.error(
    "Usage: node scripts/resetAdminPassword.js <email> [newPassword]"
  );
  process.exit(1);
}

resetPassword(email, newPass);
