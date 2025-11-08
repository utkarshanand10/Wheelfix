const express = require('express');
const router = express.Router();
const {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  bulkUpdateServices,
  getServiceStats,
  toggleServiceStatus,
  toggleServiceVisibility,
  getServicesByType
} = require('../controllers/adminServicesController');
const { verifyToken, requirePermission, logActivity } = require('../middleware/adminAuth');
const { schemas } = require('../middleware/validateAdmin');

// All routes require authentication
router.use(verifyToken);

// Get services with pagination and filters
router.get('/',
  requirePermission('manage_services'),
  ...schemas.pagination,
  logActivity('read', 'service'),
  getServices
);

// Get service statistics
router.get('/stats',
  requirePermission('view_reports'),
  getServiceStats
);

// Get single service
router.get('/:id',
  requirePermission('manage_services'),
  ...schemas.mongoId,
  logActivity('read', 'service', (req) => req.params.id),
  getServiceById
);

// Create new service
router.post('/',
  requirePermission('manage_services'),
  ...schemas.createService,
  logActivity('create', 'service', (req, data) => data.service?._id, (req, data) => data.service?.title),
  createService
);

// Update service
router.put('/:id',
  requirePermission('manage_services'),
  ...schemas.mongoId,
  ...schemas.updateService,
  logActivity('update', 'service', (req) => req.params.id, (req) => req.body.title),
  updateService
);

// Delete service
router.delete('/:id',
  requirePermission('manage_services'),
  ...schemas.mongoId,
  logActivity('delete', 'service', (req) => req.params.id),
  deleteService
);

// Bulk update services
router.patch('/bulk-update',
  requirePermission('manage_services'),
  ...schemas.bulkUpdateServices,
  logActivity('bulk_action', 'service'),
  bulkUpdateServices
);

// Toggle service status
router.patch('/:id/status',
  requirePermission('manage_services'),
  ...schemas.mongoId,
  ...schemas.toggleServiceStatus,
  logActivity('status_change', 'service', (req) => req.params.id),
  toggleServiceStatus
);

// Toggle service visibility
router.patch('/:id/visibility',
  requirePermission('manage_services'),
  ...schemas.mongoId,
  logActivity('update', 'service', (req) => req.params.id),
  toggleServiceVisibility
);

// Get services by type (for frontend)
router.get('/type/:type',
  getServicesByType
);

module.exports = router;
