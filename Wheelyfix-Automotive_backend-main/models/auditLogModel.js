const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "CREATE",
        "UPDATE",
        "DELETE",
        "LOGIN",
        "LOGOUT",
        "EXPORT",
        "BULK_UPDATE",
        "BULK_DELETE",
        "STATUS_CHANGE",
        "PASSWORD_RESET",
        "ROLE_CHANGE",
        "PERMISSION_CHANGE",
        "READ",
      ],
    },
    resource: {
      type: String,
      required: true,
      enum: [
        "USER",
        "SERVICE",
        "BRAND",
        "ORDER",
        "PAYMENT",
        "BOOKING",
        "PRODUCT",
        "SETTINGS",
        "MEDIA",
        "AUTH",
        "ANALYTICS",
      ],
    },
    targetId: {
      type: mongoose.Schema.Types.Mixed, // Allow both ObjectId and String
      required: function () {
        return [
          "CREATE",
          "UPDATE",
          "DELETE",
          "STATUS_CHANGE",
          "PASSWORD_RESET",
          "ROLE_CHANGE",
          "PERMISSION_CHANGE",
        ].includes(this.action);
      },
    },
    targetName: {
      type: String,
      required: function () {
        return [
          "CREATE",
          "UPDATE",
          "DELETE",
          "STATUS_CHANGE",
          "PASSWORD_RESET",
          "ROLE_CHANGE",
          "PERMISSION_CHANGE",
        ].includes(this.action);
      },
    },
    changes: {
      before: mongoose.Schema.Types.Mixed,
      after: mongoose.Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "LOW",
    },
  },
  {
    timestamps: true,
    // TTL index to automatically delete logs older than 1 year
    expireAfterSeconds: 31536000, // 1 year in seconds
  }
);

// Indexes for better performance
auditLogSchema.index({ adminId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, resource: 1 });
auditLogSchema.index({ targetId: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ severity: 1 });

// Static method to create audit log
auditLogSchema.statics.log = function (data) {
  return this.create({
    adminId: data.adminId,
    action: data.action,
    resource: data.resource,
    targetId: data.targetId,
    targetName: data.targetName,
    changes: data.changes,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    metadata: data.metadata || {},
    severity: data.severity || "LOW",
  });
};

// Backwards-compatible helper used by several controllers: AuditLog.logActivity({...})
// Accepts a looser payload and maps it to the strict AuditLog schema.
auditLogSchema.statics.logActivity = async function (payload = {}) {
  try {
    const toUpperSafe = (v, fallback) =>
      typeof v === "string" && v.length > 0 ? v.toUpperCase() : fallback;

    const ACTION_MAP = {
      create: "CREATE",
      update: "UPDATE",
      delete: "DELETE",
      login: "LOGIN",
      logout: "LOGOUT",
      export: "EXPORT",
      bulk_update: "BULK_UPDATE",
      bulk_delete: "BULK_DELETE",
      bulk_action: "BULK_UPDATE",
      status_change: "STATUS_CHANGE",
      password_reset: "PASSWORD_RESET",
      role_change: "ROLE_CHANGE",
      permission_change: "PERMISSION_CHANGE",
      read: "READ",
    };

    const actionKey = (payload.action || "").toString().toLowerCase();
    const action = ACTION_MAP[actionKey] || toUpperSafe(payload.action, "READ");

    const resource = toUpperSafe(payload.entity, "UNKNOWN");

    const data = {
      adminId: payload.actorId,
      action,
      resource,
      targetId: payload.entityId,
      targetName: payload.entityTitle,
      changes: payload.changes,
      ipAddress: payload.ip || payload.ipAddress || "unknown",
      userAgent: payload.userAgent || "unknown",
      metadata: payload.metadata || {},
      severity: toUpperSafe(payload.severity, "LOW"),
    };

    // Use the strict creator to persist
    await this.log(data);
  } catch (err) {
    // Never crash controllers due to audit logging issues
    // eslint-disable-next-line no-console
    console.error("AuditLog.logActivity failed:", err?.message || err);
  }
};

module.exports = mongoose.model("AuditLog", auditLogSchema);
