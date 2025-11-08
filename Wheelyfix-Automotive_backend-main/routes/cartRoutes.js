const express = require('express');
const router = express.Router();
const { 
  addToCart, 
  getCart, 
  removeFromCart, 
  updateCartItem, 
  clearCart, 
  getAvailableServices 
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/services', getAvailableServices);

// Protected routes (require authentication)
router.post('/add', protect, addToCart);
router.get('/', protect, getCart);
router.delete('/remove/:id', protect, removeFromCart);
router.put('/update/:id', protect, updateCartItem);
router.delete('/clear', protect, clearCart);

module.exports = router;
