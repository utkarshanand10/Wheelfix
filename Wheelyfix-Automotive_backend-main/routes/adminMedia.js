const express = require('express');
const router = express.Router();
const {
  uploadImage,
  uploadMultipleImages,
  getMedia,
  deleteMedia,
  getMediaStats
} = require('../controllers/adminMediaController');
const { authenticateAdmin, requirePermission } = require('../middleware/adminAuth');

// Apply authentication to all routes
router.use(authenticateAdmin);

// Upload single image
router.post('/upload', requirePermission('manage_media'), uploadImage);

// Upload multiple images
router.post('/upload-multiple', requirePermission('manage_media'), uploadMultipleImages);

// Get media files
router.get('/', requirePermission('manage_media'), getMedia);

// Get media statistics
router.get('/stats', requirePermission('manage_media'), getMediaStats);

// Delete media file
router.delete('/:filename', requirePermission('manage_media'), deleteMedia);

module.exports = router;
