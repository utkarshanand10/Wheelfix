const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkUpdateProducts,
  toggleProductStatus,
  getProductStats
} = require('../controllers/adminProductsController');
const { verifyToken, requirePermission } = require('../middleware/adminAuth');
const { validateProduct } = require('../middleware/validateAdmin');

// Apply authentication to all routes
router.use(verifyToken);

// Get all products
router.get('/', requirePermission('manage_products'), getProducts);

// Get product statistics
router.get('/stats', requirePermission('view_reports'), getProductStats);

// Get single product
router.get('/:id', requirePermission('manage_products'), getProductById);

// Create new product
router.post('/', requirePermission('manage_products'), validateProduct, createProduct);

// Update product
router.put('/:id', requirePermission('manage_products'), validateProduct, updateProduct);

// Delete product
router.delete('/:id', requirePermission('manage_products'), deleteProduct);

// Bulk update products
router.patch('/bulk-update', requirePermission('manage_products'), bulkUpdateProducts);

// Toggle product status
router.patch('/:id/status', requirePermission('manage_products'), toggleProductStatus);

module.exports = router;
