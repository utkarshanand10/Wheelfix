const express = require('express');
const router = express.Router();
const { verifyPayment, getConfig, createCartOrder, verifyCartPayment } = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/authMiddleware');

// Payment verification routes
router.post('/verify', protect, verifyPayment);
router.get('/config', getConfig);

// Cart-based payment routes
router.post('/create-cart-order', protect, createCartOrder);
router.post('/verify-cart-payment', protect, verifyCartPayment);

// Admin: list payments
router.get('/', protect, admin, async (_req, res) => {
  const Payment = require('../models/paymentModel');
  const items = await Payment.find({}).sort({ createdAt: -1 }).populate('user', 'name email');
  res.json(items);
});

module.exports = router;


