const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"],
    },
    avatarUrl: {
      type: String,
    },
    // Enhanced admin system
    role: {
      type: String,
      enum: ["customer", "admin", "manager", "superadmin"],
      default: "customer",
    },
    permissions: [
      {
        type: String,
        enum: [
          "manage_users",
          "manage_services",
          "manage_products",
          "manage_brands",
          "manage_orders",
          "view_reports",
          "manage_settings",
          "manage_content",
          "manage_media",
        ],
      },
    ],
    status: {
      type: String,
      enum: ["active", "suspended", "inactive"],
      default: "active",
    },
    lastLogin: {
      type: Date,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    // Legacy field for backward compatibility
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    vehicles: [
      {
        type: {
          type: String,
          enum: ["Car", "Bike", "Truck", "Other"],
        },
        model: String,
        year: Number,
        registrationNumber: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if user is locked
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Default permissions by role when explicit permissions are not set
const ROLE_DEFAULT_PERMISSIONS = {
  admin: [
    "manage_users",
    "manage_services",
    "manage_products",
    "manage_brands",
    "manage_orders",
    "view_reports",
    "manage_settings",
    "manage_content",
    "manage_media",
  ],
  manager: [
    "manage_users",
    "manage_orders",
    "view_reports",
    "manage_media",
    // Added product management so managers can access Products panel by default
    "manage_products",
    // Allow managers to access Settings page
    "manage_settings",
  ],
};

// Check if user has permission
userSchema.methods.hasPermission = function (permission) {
  if (this.role === "superadmin") return true;

  const explicit = Array.isArray(this.permissions) ? this.permissions : [];
  if (explicit.includes(permission)) return true;

  // Fallback: grant sensible defaults to admin/manager when no explicit permissions are configured
  const defaults = ROLE_DEFAULT_PERMISSIONS[this.role] || [];
  return defaults.includes(permission);
};

// Check if user is admin
userSchema.methods.isAdminUser = function () {
  return ["admin", "manager", "superadmin"].includes(this.role);
};

// Increment login attempts
userSchema.methods.incLoginAttempts = function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }

  return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
  });
};

// Ensure next() is always called when using callback-style middleware
userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
