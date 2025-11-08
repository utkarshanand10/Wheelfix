const AuditLog = require('../models/auditLogModel');

/**
 * Create an audit log entry
 * @param {Object} data - Audit log data
 * @param {string} data.adminId - Admin user ID
 * @param {string} data.action - Action performed
 * @param {string} data.resource - Resource type
 * @param {string} data.targetId - Target resource ID (optional)
 * @param {string} data.targetName - Target resource name (optional)
 * @param {Object} data.changes - Before/after changes (optional)
 * @param {string} data.ipAddress - IP address
 * @param {string} data.userAgent - User agent
 * @param {Object} data.metadata - Additional metadata (optional)
 * @param {string} data.severity - Severity level (optional)
 */
const logAudit = async (data) => {
  try {
    await AuditLog.log(data);
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw error to avoid breaking the main operation
  }
};

/**
 * Middleware to automatically log admin actions
 */
const auditMiddleware = (action, resource, options = {}) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log the action after successful response
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const auditData = {
          adminId: req.user?._id || req.user?.id,
          action,
          resource,
          targetId: req.params?.id || options.targetId,
          targetName: options.targetName || req.body?.name || req.body?.title || req.body?.email,
          changes: options.changes || {
            before: options.before,
            after: req.body
          },
          ipAddress: req.ip || req.connection.remoteAddress || req.socket.remoteAddress,
          userAgent: req.get('User-Agent') || 'Unknown',
          metadata: {
            method: req.method,
            url: req.originalUrl,
            ...options.metadata
          },
          severity: options.severity || 'LOW'
        };
        
        // Log asynchronously without blocking response
        setImmediate(() => {
          logAudit(auditData);
        });
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};

/**
 * Log specific admin actions
 */
const logAdminAction = {
  userCreated: (adminId, targetId, targetName, ipAddress, userAgent) => 
    logAudit({
      adminId,
      action: 'CREATE',
      resource: 'USER',
      targetId,
      targetName,
      ipAddress,
      userAgent,
      severity: 'MEDIUM'
    }),

  userUpdated: (adminId, targetId, targetName, changes, ipAddress, userAgent) =>
    logAudit({
      adminId,
      action: 'UPDATE',
      resource: 'USER',
      targetId,
      targetName,
      changes,
      ipAddress,
      userAgent,
      severity: 'MEDIUM'
    }),

  userDeleted: (adminId, targetId, targetName, ipAddress, userAgent) =>
    logAudit({
      adminId,
      action: 'DELETE',
      resource: 'USER',
      targetId,
      targetName,
      ipAddress,
      userAgent,
      severity: 'HIGH'
    }),

  serviceCreated: (adminId, targetId, targetName, ipAddress, userAgent) =>
    logAudit({
      adminId,
      action: 'CREATE',
      resource: 'SERVICE',
      targetId,
      targetName,
      ipAddress,
      userAgent,
      severity: 'MEDIUM'
    }),

  serviceUpdated: (adminId, targetId, targetName, changes, ipAddress, userAgent) =>
    logAudit({
      adminId,
      action: 'UPDATE',
      resource: 'SERVICE',
      targetId,
      targetName,
      changes,
      ipAddress,
      userAgent,
      severity: 'MEDIUM'
    }),

  serviceDeleted: (adminId, targetId, targetName, ipAddress, userAgent) =>
    logAudit({
      adminId,
      action: 'DELETE',
      resource: 'SERVICE',
      targetId,
      targetName,
      ipAddress,
      userAgent,
      severity: 'HIGH'
    }),

  orderStatusChanged: (adminId, targetId, targetName, changes, ipAddress, userAgent) =>
    logAudit({
      adminId,
      action: 'STATUS_CHANGE',
      resource: 'ORDER',
      targetId,
      targetName,
      changes,
      ipAddress,
      userAgent,
      severity: 'MEDIUM'
    }),

  adminLogin: (adminId, ipAddress, userAgent) =>
    logAudit({
      adminId,
      action: 'LOGIN',
      resource: 'AUTH',
      ipAddress,
      userAgent,
      severity: 'LOW'
    }),

  adminLogout: (adminId, ipAddress, userAgent) =>
    logAudit({
      adminId,
      action: 'LOGOUT',
      resource: 'AUTH',
      ipAddress,
      userAgent,
      severity: 'LOW'
    }),

  bulkAction: (adminId, action, resource, count, ipAddress, userAgent) =>
    logAudit({
      adminId,
      action: `BULK_${action}`,
      resource,
      ipAddress,
      userAgent,
      metadata: { count },
      severity: 'HIGH'
    })
};

module.exports = {
  logAudit,
  auditMiddleware,
  logAdminAction
};