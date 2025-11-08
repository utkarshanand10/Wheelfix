const User = require("../models/userModel");
const AuditLog = require("../models/auditLogModel");
const bcrypt = require("bcryptjs");

// Get all users with pagination and filters
const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "createdAt:desc",
      search = "",
      role = "",
      status = "",
      dateFrom = "",
      dateTo = "",
    } = req.query;

    // Build filter object
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ];
    }

    if (role) {
      filter.role = role;
    }

    if (status) {
      filter.status = status;
    }

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    // Parse sort
    const [sortField, sortOrder] = sort.split(":");
    const sortObj = { [sortField]: sortOrder === "asc" ? 1 : -1 };

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get users
    const users = await User.find(filter)
      .select("-password")
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await User.countDocuments(filter);

    // Calculate pagination info
    const parsedPage = parseInt(page);
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parsedPage < totalPages;
    const hasPrevPage = parsedPage > 1;

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage,
          hasPrevPage,
        },
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

// Get single user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};

// Create new user
const createUser = async (req, res) => {
  try {
    const userData = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({
      email: userData.email.toLowerCase(),
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Create user
    const user = new User(userData);
    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    // Log user creation
    await AuditLog.log({
      adminId: req.user._id,
      action: "CREATE",
      resource: "USER",
      targetId: user._id.toString(),
      targetName: user.name,
      changes: {
        after: userResponse,
      },
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
      severity: "MEDIUM",
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: { user: userResponse },
    });
  } catch (error) {
    console.error("Create user error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create user",
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Prevent password updates here (use reset password endpoint)
    if (Object.prototype.hasOwnProperty.call(updateData, "password")) {
      return res.status(400).json({
        success: false,
        message:
          "Password cannot be updated via this endpoint. Use reset-password.",
      });
    }

    // Get original user for logging
    const originalUser = await User.findById(id).select("-password");

    if (!originalUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if email is being changed and if it already exists
    if (updateData.email && updateData.email !== originalUser.email) {
      const existingUser = await User.findOne({
        email: updateData.email.toLowerCase(),
        _id: { $ne: id },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    // Guard role/permissions changes: only superadmin can change roles/permissions or modify a superadmin
    if (
      (updateData.role || updateData.permissions) &&
      req.user.role !== "superadmin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Only superadmin can change roles or permissions",
      });
    }

    if (originalUser.role === "superadmin" && req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "You cannot modify a superadmin user",
      });
    }

    // Update user safely
    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Log user update
    await AuditLog.log({
      adminId: req.user._id,
      action: "UPDATE",
      resource: "USER",
      targetId: user._id.toString(),
      targetName: user.name,
      changes: {
        before: originalUser,
        after: user,
        fields: Object.keys(updateData),
      },
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
      severity: "MEDIUM",
    });

    res.json({
      success: true,
      message: "User updated successfully",
      data: { user },
    });
  } catch (error) {
    console.error("Update user error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting own account
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Log user deletion
    await AuditLog.log({
      adminId: req.user._id,
      action: "DELETE",
      resource: "USER",
      targetId: user._id.toString(),
      targetName: user.name,
      changes: {
        before: user,
      },
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
      severity: "HIGH",
    });

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};

// Suspend/Activate user
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "suspended", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be active, suspended, or inactive",
      });
    }

    // Prevent suspending own account
    if (id === req.user._id.toString() && status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Cannot suspend your own account",
      });
    }

    const beforeUser = await User.findById(id).select("-password");
    if (!beforeUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Log status change with accurate before/after
    await AuditLog.log({
      adminId: req.user._id,
      action: "STATUS_CHANGE",
      resource: "USER",
      targetId: user._id.toString(),
      targetName: user.name,
      changes: {
        before: { status: beforeUser.status },
        after: { status: user.status },
        fields: ["status"],
      },
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
      severity: "HIGH",
    });

    res.json({
      success: true,
      message: `User ${
        status === "active"
          ? "activated"
          : status === "suspended"
          ? "suspended"
          : "deactivated"
      } successfully`,
      data: { user },
    });
  } catch (error) {
    console.error("Toggle user status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user status",
    });
  }
};

// Reset user password
const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (
      !newPassword ||
      typeof newPassword !== "string" ||
      newPassword.length < 6
    ) {
      return res.status(400).json({
        success: false,
        message: "newPassword is required and must be at least 6 characters",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Only superadmin can reset superadmin's password
    if (user.role === "superadmin" && req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Only superadmin can reset a superadmin password",
      });
    }

    // Update password (hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    // Log password reset
    await AuditLog.log({
      adminId: req.user._id,
      action: "PASSWORD_RESET",
      resource: "USER",
      targetId: user._id.toString(),
      targetName: user.name,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
      severity: "HIGH",
    });

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset user password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password",
    });
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
          },
          suspendedUsers: {
            $sum: { $cond: [{ $eq: ["$status", "suspended"] }, 1, 0] },
          },
          adminUsers: {
            $sum: {
              $cond: [
                { $in: ["$role", ["admin", "manager", "superadmin"]] },
                1,
                0,
              ],
            },
          },
          customerUsers: {
            $sum: { $cond: [{ $eq: ["$role", "customer"] }, 1, 0] },
          },
        },
      },
    ]);

    const result = stats[0] || {
      totalUsers: 0,
      activeUsers: 0,
      suspendedUsers: 0,
      adminUsers: 0,
      customerUsers: 0,
    };

    res.json({
      success: true,
      data: { stats: result },
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user statistics",
    });
  }
};

// Export users to CSV
const exportUsers = async (req, res) => {
  try {
    const { format = "csv" } = req.query;

    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    if (format === "csv") {
      // Convert to CSV
      const csvHeader = "Name,Email,Phone,Role,Status,Created At\n";
      const csvData = users
        .map(
          (user) =>
            `"${user.name}","${user.email}","${user.phoneNumber}","${
              user.role
            }","${user.status}","${user.createdAt.toISOString()}"`
        )
        .join("\n");

      const csv = csvHeader + csvData;

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=users.csv");
      res.send(csv);
    } else {
      res.json({
        success: true,
        data: { users },
      });
    }
  } catch (error) {
    console.error("Export users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export users",
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  resetUserPassword,
  getUserStats,
  exportUsers,
};
