const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getRevenueChart,
  getServiceChart,
  getActivityLogs,
  exportAnalytics
} = require('../controllers/adminAnalyticsController');
const { authenticateAdmin, requirePermission } = require('../middleware/adminAuth');

// Apply authentication to all routes
router.use(authenticateAdmin);

// Get dashboard statistics
router.get('/dashboard', requirePermission('view_reports'), getDashboardStats);

// Get revenue chart data
router.get('/revenue', requirePermission('view_reports'), getRevenueChart);

// Get service chart data
router.get('/services', requirePermission('view_reports'), getServiceChart);

// Get activity logs
router.get('/activity-logs', requirePermission('view_reports'), getActivityLogs);

// Export analytics data
router.get('/export', requirePermission('view_reports'), exportAnalytics);

module.exports = router;
