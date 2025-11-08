const express = require('express');
const router = express.Router();
const {
  getOrders,
  getOrderById,
  updateOrder,
  capturePayment,
  refundOrder,
  createManualOrder,
  getOrderStats
} = require('../controllers/adminOrdersController');
const { verifyToken, requirePermission } = require('../middleware/adminAuth');
const { validateOrder } = require('../middleware/validateAdmin');

// Apply authentication to all routes
router.use(verifyToken);

// Get all orders
router.get('/', requirePermission('manage_orders'), getOrders);

// Get order statistics
router.get('/stats', requirePermission('view_reports'), getOrderStats);

// Get single order
router.get('/:id', requirePermission('manage_orders'), getOrderById);

// Update order
router.put('/:id', requirePermission('manage_orders'), validateOrder, updateOrder);

// Capture payment
router.post('/:id/capture', requirePermission('manage_orders'), capturePayment);

// Refund order
router.post('/:id/refund', requirePermission('manage_orders'), refundOrder);

// Create manual order
router.post('/manual', requirePermission('manage_orders'), validateOrder, createManualOrder);

module.exports = router;
