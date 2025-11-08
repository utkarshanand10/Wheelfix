const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  resetUserPassword,
  getUserStats,
  exportUsers
} = require('../controllers/adminUsersController');
const { verifyToken, requirePermission, logActivity } = require('../middleware/adminAuth');
const { schemas } = require('../middleware/validateAdmin');

// All routes require authentication
router.use(verifyToken);

// Get users with pagination and filters
router.get('/',
  requirePermission('manage_users'),
  ...schemas.pagination,
  logActivity('read', 'user'),
  getUsers
);

// Get user statistics
router.get('/stats',
  requirePermission('view_reports'),
  getUserStats
);

// Export users
router.get('/export',
  requirePermission('manage_users'),
  exportUsers
);

// Get single user
router.get('/:id',
  requirePermission('manage_users'),
  ...schemas.mongoId,
  logActivity('read', 'user', (req) => req.params.id),
  getUserById
);

// Create new user
router.post('/',
  requirePermission('manage_users'),
  ...schemas.createUser,
  logActivity('create', 'user', (req, data) => data.user?._id, (req, data) => data.user?.name),
  createUser
);

// Update user
router.put('/:id',
  requirePermission('manage_users'),
  ...schemas.mongoId,
  ...schemas.updateUser,
  logActivity('update', 'user', (req) => req.params.id, (req) => req.body.name),
  updateUser
);

// Delete user
router.delete('/:id',
  requirePermission('manage_users'),
  ...schemas.mongoId,
  logActivity('delete', 'user', (req) => req.params.id),
  deleteUser
);

// Toggle user status (suspend/activate)
router.patch('/:id/status',
  requirePermission('manage_users'),
  ...schemas.mongoId,
  ...schemas.toggleUserStatus,
  logActivity('status_change', 'user', (req) => req.params.id),
  toggleUserStatus
);

// Reset user password
router.patch('/:id/reset-password',
  requirePermission('manage_users'),
  ...schemas.mongoId,
  ...schemas.resetPassword,
  logActivity('password_reset', 'user', (req) => req.params.id),
  resetUserPassword
);

module.exports = router;
