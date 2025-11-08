const express = require('express');
const router = express.Router();
const { 
  createOrderFromCart, 
  getMyOrders, 
  getOrder, 
  updateOrderStatus, 
  getAllOrders,
  downloadInvoice
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

// User routes
router.post('/create-from-cart', protect, createOrderFromCart);
router.get('/my', protect, getMyOrders);
router.get('/:id', protect, getOrder);
router.get('/:id/invoice', protect, downloadInvoice);

// Admin routes
router.get('/', protect, admin, getAllOrders);
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
