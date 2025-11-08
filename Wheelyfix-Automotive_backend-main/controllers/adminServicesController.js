const Service = require('../models/serviceModel');
const AuditLog = require('../models/auditLogModel');

// Get all services with pagination and filters
const getServices = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt:desc',
      search = '',
      category = '',
      status = '',
      featured = '',
      type = '',
      visible = '',
      priceMin = '',
      priceMax = '',
      dateFrom = '',
      dateTo = ''
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (featured !== '') {
      filter.featured = featured === 'true';
    }
    
    if (type) {
      filter.type = type;
    }
    
    if (visible !== '') {
      filter.visible = visible === 'true';
    }
    
    if (priceMin || priceMax) {
      filter.price = {};
      if (priceMin) filter.price.$gte = parseFloat(priceMin);
      if (priceMax) filter.price.$lte = parseFloat(priceMax);
    }
    
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    // Parse sort
    const [sortField, sortOrder] = sort.split(':');
    const sortObj = { [sortField]: sortOrder === 'asc' ? 1 : -1 };

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get services with populated createdBy
    const services = await Service.find(filter)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Service.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: {
        services,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage,
          hasPrevPage
        }
      }
    });

  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services'
    });
  }
};

// Get single service by ID
const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      data: { service }
    });

  } catch (error) {
    console.error('Get service by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service'
    });
  }
};

// Create new service
const createService = async (req, res) => {
  try {
    const serviceData = {
      ...req.body,
      createdBy: req.user._id
    };

    // Create service
    const service = new Service(serviceData);
    await service.save();

    // Populate createdBy
    await service.populate('createdBy', 'name email');

    // Log service creation
    await AuditLog.logActivity({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'create',
      entity: 'service',
      entityId: service._id.toString(),
      entityTitle: service.title,
      changes: {
        after: service
      },
      metadata: {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      },
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionID,
      severity: 'medium'
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: { service }
    });

  } catch (error) {
    console.error('Create service error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Service with this title already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create service'
    });
  }
};

// Update service
const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedBy: req.user._id
    };

    // Get original service for logging
    const originalService = await Service.findById(id);
    
    if (!originalService) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Update service
    const service = await Service.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email').populate('updatedBy', 'name email');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Log service update
    await AuditLog.logActivity({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'update',
      entity: 'service',
      entityId: service._id.toString(),
      entityTitle: service.title,
      changes: {
        before: originalService,
        after: service,
        fields: Object.keys(updateData)
      },
      metadata: {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      },
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionID,
      severity: 'medium'
    });

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: { service }
    });

  } catch (error) {
    console.error('Update service error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Service with this title already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update service'
    });
  }
};

// Delete service
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Log service deletion
    await AuditLog.logActivity({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'delete',
      entity: 'service',
      entityId: service._id.toString(),
      entityTitle: service.title,
      changes: {
        before: service
      },
      metadata: {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      },
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionID,
      severity: 'high'
    });

    await Service.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });

  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service'
    });
  }
};

// Bulk update services
const bulkUpdateServices = async (req, res) => {
  try {
    const { serviceIds, updateData } = req.body;

    if (!serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Service IDs are required'
      });
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Update data is required'
      });
    }

    // Add updatedBy to update data
    updateData.updatedBy = req.user._id;

    // Update services
    const result = await Service.updateMany(
      { _id: { $in: serviceIds } },
      updateData,
      { runValidators: true }
    );

    // Log bulk update
    await AuditLog.logActivity({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'bulk_action',
      entity: 'service',
      entityId: serviceIds.join(','),
      entityTitle: `${serviceIds.length} services`,
      changes: {
        after: updateData,
        fields: Object.keys(updateData)
      },
      metadata: {
        serviceIds,
        updatedCount: result.modifiedCount,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      },
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionID,
      severity: 'medium'
    });

    res.json({
      success: true,
      message: `${result.modifiedCount} services updated successfully`,
      data: { modifiedCount: result.modifiedCount }
    });

  } catch (error) {
    console.error('Bulk update services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update services'
    });
  }
};

// Get service statistics
const getServiceStats = async (req, res) => {
  try {
    const stats = await Service.aggregate([
      {
        $group: {
          _id: null,
          totalServices: { $sum: 1 },
          activeServices: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          draftServices: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
          },
          featuredServices: {
            $sum: { $cond: [{ $eq: ['$featured', true] }, 1, 0] }
          },
          averagePrice: { $avg: '$price' },
          totalRevenue: { $sum: '$price' }
        }
      }
    ]);

    // Get category breakdown
    const categoryStats = await Service.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          averagePrice: { $avg: '$price' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const result = stats[0] || {
      totalServices: 0,
      activeServices: 0,
      draftServices: 0,
      featuredServices: 0,
      averagePrice: 0,
      totalRevenue: 0
    };

    res.json({
      success: true,
      data: { 
        stats: result,
        categoryStats
      }
    });

  } catch (error) {
    console.error('Get service stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service statistics'
    });
  }
};

// Toggle service status
const toggleServiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'draft', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const service = await Service.findByIdAndUpdate(
      id,
      { 
        status,
        updatedBy: req.user._id
      },
      { new: true }
    ).populate('createdBy', 'name email').populate('updatedBy', 'name email');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Log status change
    await AuditLog.logActivity({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'status_change',
      entity: 'service',
      entityId: service._id.toString(),
      entityTitle: service.title,
      changes: {
        before: { status: service.status === status ? (status === 'active' ? 'inactive' : 'active') : service.status },
        after: { status },
        fields: ['status']
      },
      metadata: {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      },
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionID,
      severity: 'medium'
    });

    res.json({
      success: true,
      message: `Service ${status} successfully`,
      data: { service }
    });

  } catch (error) {
    console.error('Toggle service status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service status'
    });
  }
};

// Toggle service visibility
const toggleServiceVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { visible } = req.body;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    service.visible = visible;
    service.updatedBy = req.user._id;
    await service.save();

    // Log activity
    await AuditLog.logActivity({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'update',
      entity: 'service',
      entityId: service._id,
      entityTitle: service.title,
      metadata: { visible },
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionID,
      severity: 'low'
    });

    res.json({
      success: true,
      message: `Service ${visible ? 'shown' : 'hidden'}`,
      data: service
    });

  } catch (error) {
    console.error('Toggle service visibility error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle service visibility'
    });
  }
};

// Get services by type for frontend
const getServicesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { visible = true } = req.query;

    const filter = { type };
    if (visible !== 'false') {
      filter.visible = true;
    }

    const services = await Service.find(filter)
      .select('title description price duration category type visible images')
      .sort({ orderIndex: 1, createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: services
    });

  } catch (error) {
    console.error('Get services by type error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services by type'
    });
  }
};

module.exports = {
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
};
