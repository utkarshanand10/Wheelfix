const Settings = require('../models/settingsModel');
const AuditLog = require('../models/auditLogModel');
const { validationResult } = require('express-validator');

// Get settings
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      // Create default settings if none exist
      settings = new Settings({
        updatedBy: req.user._id
      });
      await settings.save();
    }

    // Log activity
    await AuditLog.logActivity({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'read',
      entity: 'settings',
      entityId: settings._id.toString(),
      entityTitle: 'System Settings',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionID,
      severity: 'low'
    });

    res.json({
      success: true,
      data: { settings }
    });

  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings'
    });
  }
};

// Update settings
const updateSettings = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const updateData = {
      ...req.body,
      updatedBy: req.user._id
    };

    let settings = await Settings.findOne();
    
    if (!settings) {
      // Create new settings if none exist
      settings = new Settings(updateData);
    } else {
      // Update existing settings
      Object.assign(settings, updateData);
    }

    await settings.save();

    // Log activity
    await AuditLog.logActivity({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'update',
      entity: 'settings',
      entityId: settings._id.toString(),
      entityTitle: 'System Settings',
      changes: {
        before: settings.toObject(),
        after: settings.toObject(),
        fields: Object.keys(updateData)
      },
      metadata: {
        sectionsUpdated: Object.keys(updateData)
      },
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionID,
      severity: 'high'
    });

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: { settings }
    });

  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    });
  }
};

// Update company information
const updateCompanyInfo = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { company } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({});
    }

    settings.company = { ...settings.company, ...company };
    settings.updatedBy = req.user._id;
    await settings.save();

    // Log activity
    await AuditLog.logActivity({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'update',
      entity: 'settings',
      entityId: settings._id.toString(),
      entityTitle: 'Company Information',
      changes: {
        before: { company: settings.company },
        after: { company: settings.company },
        fields: Object.keys(company)
      },
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionID,
      severity: 'medium'
    });

    res.json({
      success: true,
      message: 'Company information updated successfully',
      data: { settings }
    });

  } catch (error) {
    console.error('Update company info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update company information'
    });
  }
};

// Update payment settings
const updatePaymentSettings = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { payment } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({});
    }

    settings.payment = { ...settings.payment, ...payment };
    settings.updatedBy = req.user._id;
    await settings.save();

    // Log activity
    await AuditLog.logActivity({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'update',
      entity: 'settings',
      entityId: settings._id.toString(),
      entityTitle: 'Payment Settings',
      changes: {
        before: { payment: settings.payment },
        after: { payment: settings.payment },
        fields: Object.keys(payment)
      },
      metadata: {
        sensitiveData: true
      },
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionID,
      severity: 'high'
    });

    res.json({
      success: true,
      message: 'Payment settings updated successfully',
      data: { settings }
    });

  } catch (error) {
    console.error('Update payment settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment settings'
    });
  }
};

// Update email settings
const updateEmailSettings = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({});
    }

    settings.email = { ...settings.email, ...email };
    settings.updatedBy = req.user._id;
    await settings.save();

    // Log activity
    await AuditLog.logActivity({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'update',
      entity: 'settings',
      entityId: settings._id.toString(),
      entityTitle: 'Email Settings',
      changes: {
        before: { email: settings.email },
        after: { email: settings.email },
        fields: Object.keys(email)
      },
      metadata: {
        sensitiveData: true
      },
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionID,
      severity: 'high'
    });

    res.json({
      success: true,
      message: 'Email settings updated successfully',
      data: { settings }
    });

  } catch (error) {
    console.error('Update email settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update email settings'
    });
  }
};

// Update site settings
const updateSiteSettings = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { site } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({});
    }

    settings.site = { ...settings.site, ...site };
    settings.updatedBy = req.user._id;
    await settings.save();

    // Log activity
    await AuditLog.logActivity({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'update',
      entity: 'settings',
      entityId: settings._id.toString(),
      entityTitle: 'Site Settings',
      changes: {
        before: { site: settings.site },
        after: { site: settings.site },
        fields: Object.keys(site)
      },
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionID,
      severity: 'medium'
    });

    res.json({
      success: true,
      message: 'Site settings updated successfully',
      data: { settings }
    });

  } catch (error) {
    console.error('Update site settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update site settings'
    });
  }
};

// Toggle maintenance mode
const toggleMaintenanceMode = async (req, res) => {
  try {
    const { enabled, message } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({});
    }

    settings.site.maintenanceMode = enabled;
    if (message) {
      settings.site.maintenanceMessage = message;
    }
    settings.updatedBy = req.user._id;
    await settings.save();

    // Log activity
    await AuditLog.logActivity({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'update',
      entity: 'settings',
      entityId: settings._id.toString(),
      entityTitle: 'Maintenance Mode',
      changes: {
        before: { maintenanceMode: !enabled },
        after: { maintenanceMode: enabled },
        fields: ['maintenanceMode']
      },
      metadata: {
        maintenanceMessage: message
      },
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionID,
      severity: 'high'
    });

    res.json({
      success: true,
      message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'} successfully`,
      data: { 
        maintenanceMode: enabled,
        maintenanceMessage: settings.site.maintenanceMessage
      }
    });

  } catch (error) {
    console.error('Toggle maintenance mode error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle maintenance mode'
    });
  }
};

// Update feature flags
const updateFeatureFlags = async (req, res) => {
  try {
    const { features } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({});
    }

    settings.features = { ...settings.features, ...features };
    settings.updatedBy = req.user._id;
    await settings.save();

    // Log activity
    await AuditLog.logActivity({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'update',
      entity: 'settings',
      entityId: settings._id.toString(),
      entityTitle: 'Feature Flags',
      changes: {
        before: { features: settings.features },
        after: { features: settings.features },
        fields: Object.keys(features)
      },
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionID,
      severity: 'medium'
    });

    res.json({
      success: true,
      message: 'Feature flags updated successfully',
      data: { features: settings.features }
    });

  } catch (error) {
    console.error('Update feature flags error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update feature flags'
    });
  }
};

// Reset settings to default
const resetSettings = async (req, res) => {
  try {
    const { confirm } = req.body;

    if (confirm !== 'RESET') {
      return res.status(400).json({
        success: false,
        message: 'Please confirm by typing "RESET"'
      });
    }

    // Delete existing settings
    await Settings.deleteMany({});
    
    // Create default settings
    const defaultSettings = new Settings({
      updatedBy: req.user._id
    });
    await defaultSettings.save();

    // Log activity
    await AuditLog.logActivity({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'delete',
      entity: 'settings',
      entityId: 'all',
      entityTitle: 'All Settings',
      changes: {
        before: {},
        after: defaultSettings.toObject(),
        fields: Object.keys(defaultSettings.toObject())
      },
      metadata: {
        resetToDefault: true
      },
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionID,
      severity: 'critical'
    });

    res.json({
      success: true,
      message: 'Settings reset to default successfully',
      data: { settings: defaultSettings }
    });

  } catch (error) {
    console.error('Reset settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset settings'
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  updateCompanyInfo,
  updatePaymentSettings,
  updateEmailSettings,
  updateSiteSettings,
  toggleMaintenanceMode,
  updateFeatureFlags,
  resetSettings
};
