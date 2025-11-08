const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AuditLog = require('../models/auditLogModel');

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Account is suspended or inactive'
      });
    }

    // Check if user is admin
    if (!user.isAdminUser()) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Check if user has specific permission
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!req.user.hasPermission(permission)) {
      return res.status(403).json({
        success: false,
        message: `Permission '${permission}' required`
      });
    }

    next();
  };
};

// Check if user has any of the specified roles
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `One of these roles required: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Check if user is superadmin
const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Super admin access required'
    });
  }

  next();
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (user && user.status === 'active') {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Don't fail on optional auth errors
    next();
  }
};

// Log admin activity
const logActivity = (action, entity, getEntityId, getEntityTitle) => {
  return async (req, res, next) => {
    const startTime = Date.now();
    
    // Override res.json to capture response
    const originalJson = res.json;
    res.json = function(data) {
      const duration = Date.now() - startTime;
      
      // Log activity asynchronously (don't wait for it)
      if (req.user && res.statusCode < 400) {
        const entityId = typeof getEntityId === 'function' ? getEntityId(req, data) : getEntityId;
        const entityTitle = typeof getEntityTitle === 'function' ? getEntityTitle(req, data) : getEntityTitle;
        
        AuditLog.log({
          adminId: req.user._id,
          action: action.toUpperCase(),
          resource: entity.toUpperCase(),
          targetId: entityId || req.params.id || 'unknown',
          targetName: entityTitle || 'Unknown',
          changes: req.body,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent'),
          metadata: {
            method: req.method,
            url: req.originalUrl,
            duration,
            status: res.statusCode < 400 ? 'success' : 'failed'
          },
          severity: 'LOW'
        }).catch(err => {
          console.error('Failed to log activity:', err);
        });
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// Rate limiting for admin endpoints
const adminRateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const key = req.user ? req.user._id.toString() : req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    for (const [k, v] of requests.entries()) {
      if (v.lastRequest < windowStart) {
        requests.delete(k);
      }
    }
    
    const userRequests = requests.get(key) || { count: 0, lastRequest: 0 };
    
    if (userRequests.lastRequest < windowStart) {
      userRequests.count = 0;
    }
    
    if (userRequests.count >= max) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil((userRequests.lastRequest + windowMs - now) / 1000)
      });
    }
    
    userRequests.count++;
    userRequests.lastRequest = now;
    requests.set(key, userRequests);
    
    next();
  };
};

// Alias for verifyToken (for backward compatibility)
const authenticateAdmin = verifyToken;

module.exports = {
  verifyToken,
  authenticateAdmin,
  requirePermission,
  requireRole,
  requireSuperAdmin,
  optionalAuth,
  logActivity,
  adminRateLimit
};
