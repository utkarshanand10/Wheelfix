const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const AuditLog = require("../models/auditLogModel");

// Generate JWT tokens
const generateTokens = (userId) => {
  // Validate presence of required secrets and provide an actionable error
  const accessSecret = process.env.JWT_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET || accessSecret;

  if (!accessSecret) {
    // Throw a clear, actionable error so callers can surface it instead of the
    // generic `secretOrPrivateKey must have a value` message from jsonwebtoken.
    throw new Error(
      "JWT_SECRET environment variable is not set. Copy `env.example` to `.env` and set a long, random JWT_SECRET (and optionally JWT_REFRESH_SECRET)."
    );
  }

  const accessToken = jwt.sign({ id: userId }, accessSecret, {
    expiresIn: process.env.JWT_ACCESS_EXPIRE || "15m",
  });

  const refreshToken = jwt.sign(
    { id: userId, type: "refresh" },
    refreshSecret,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d" }
  );

  return { accessToken, refreshToken };
};

// Admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if user is admin
    if (!user.isAdminUser()) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    // NOTE: Lockout behavior disabled — do not block login attempts based on lockUntil
    // The historical behavior set `lockUntil` after several failed attempts.
    // That logic has been removed/disabled in the User model. Keep this explicit
    // comment so future maintainers understand the change.

    // Check if account is active
    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Account is suspended or inactive",
      });
    }

    // Verify password
    const isPasswordValid = await user.matchPassword(password);

    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts();

      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Log login activity
    await AuditLog.log({
      adminId: user._id,
      action: "LOGIN",
      resource: "AUTH",
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
      metadata: {
        loginMethod: "email_password",
      },
      severity: "LOW",
    });

    // Prepare user data (exclude sensitive information)
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      status: user.status,
      lastLogin: user.lastLogin,
      avatarUrl: user.avatarUrl,
    };

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: userData,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

// Refresh access token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token required",
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    if (decoded.type !== "refresh") {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // Get user
    const user = await User.findById(decoded.id).select("-password");

    if (!user || !user.isAdminUser() || user.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "User not found or inactive",
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user._id
    );

    res.json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    console.error("Token refresh error:", error);
    res.status(500).json({
      success: false,
      message: "Token refresh failed",
    });
  }
};

// Admin logout
const adminLogout = async (req, res) => {
  try {
    // Log logout activity
    if (req.user) {
      await AuditLog.log({
        adminId: req.user._id,
        action: "LOGOUT",
        resource: "AUTH",
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get("User-Agent"),
        severity: "LOW",
      });
    }

    res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Admin logout error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

// Get current admin profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      permissions: user.permissions,
      status: user.status,
      lastLogin: user.lastLogin,
      avatarUrl: user.avatarUrl,
      address: user.address,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.json({
      success: true,
      data: { user: userData },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get profile",
    });
  }
};

// Update admin profile
const updateProfile = async (req, res) => {
  try {
    const { name, phoneNumber, address } = req.body;
    const userId = req.user._id;

    const updateData = {};
    if (name) updateData.name = name;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (address) updateData.address = address;

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Log profile update
    await AuditLog.log({
      adminId: user._id,
      action: "UPDATE",
      resource: "USER",
      targetId: user._id,
      targetName: user.name,
      changes: {
        before: req.user,
        after: user,
      },
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
      severity: "LOW",
    });

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      permissions: user.permissions,
      status: user.status,
      lastLogin: user.lastLogin,
      avatarUrl: user.avatarUrl,
      address: user.address,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: { user: userData },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Get user with password
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.matchPassword(currentPassword);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Log password change
    await AuditLog.log({
      adminId: user._id,
      action: "PASSWORD_RESET",
      resource: "USER",
      targetId: user._id,
      targetName: user.name,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
      severity: "HIGH",
    });

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};

module.exports = {
  adminLogin,
  refreshToken,
  adminLogout,
  getProfile,
  updateProfile,
  changePassword,
};
