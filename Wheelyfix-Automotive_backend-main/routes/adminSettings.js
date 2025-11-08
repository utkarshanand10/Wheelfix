const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
  updateCompanyInfo,
  updatePaymentSettings,
  updateEmailSettings,
  updateSiteSettings,
  toggleMaintenanceMode,
  updateFeatureFlags,
  resetSettings
} = require('../controllers/adminSettingsController');
const { verifyToken, requirePermission } = require('../middleware/adminAuth');
const { validateSettings } = require('../middleware/validateAdmin');

// Apply authentication to all routes
router.use(verifyToken);

// Get settings
router.get('/', requirePermission('manage_settings'), getSettings);

// Update all settings
router.put('/', requirePermission('manage_settings'), validateSettings, updateSettings);

// Update company information
router.put('/company', requirePermission('manage_settings'), updateCompanyInfo);

// Update payment settings
router.put('/payment', requirePermission('manage_settings'), updatePaymentSettings);

// Update email settings
router.put('/email', requirePermission('manage_settings'), updateEmailSettings);

// Update site settings
router.put('/site', requirePermission('manage_settings'), updateSiteSettings);

// Toggle maintenance mode
router.patch('/maintenance', requirePermission('manage_settings'), toggleMaintenanceMode);

// Update feature flags
router.patch('/features', requirePermission('manage_settings'), updateFeatureFlags);

// Reset settings to default
router.post('/reset', requirePermission('manage_settings'), resetSettings);

module.exports = router;
