const Product = require('../models/productModel');
const Brand = require('../models/brandModel');
const AuditLog = require('../models/auditLogModel');
const { validationResult } = require('express-validator');

// Get all products with pagination, search, and filters
const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      brand,
      status,
      featured,
      popular,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      minPrice,
      maxPrice,
      lowStock
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (status) filter.status = status;
    if (featured !== undefined) filter.featured = featured === 'true';
    if (popular !== undefined) filter.popular = popular === 'true';
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    if (lowStock === 'true') {
      filter.$expr = { $lte: ['$stock', '$lowStockThreshold'] };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const products = await Product.find(filter)
      .populate('brand', 'name logo')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Product.countDocuments(filter);

    // Log activity
    await AuditLog.logActivity({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'read',
      entity: 'product',
      entityId: 'multiple',
      entityTitle: 'Products List',
      metadata: {
        filters: filter,
        pagination: { page, limit },
        total
      },
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionID,
      severity: 'low'
    });

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

// Get single product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate('brand', 'name logo website')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Log activity
    await AuditLog.logActivity({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'read',
      entity: 'product',
      entityId: product._id.toString(),
      entityTitle: product.title,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionID,
      severity: 'low'
    });

    res.json({
      success: true,
      data: { product }
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
};

// Create new product
const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const productData = {
      ...req.body,
      createdBy: req.user._id
    };

    // Check if brand exists
    if (productData.brand) {
      const brand = await Brand.findById(productData.brand);
      if (!brand) {
        return res.status(400).json({
          success: false,
          message: 'Brand not found'
        });
      }
    }

    const product = new Product(productData);
    await product.save();

    // Populate references
    await product.populate('brand', 'name logo');
    await product.populate('createdBy', 'name email');

    // Log activity
    await AuditLog.logActivity({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'create',
      entity: 'product',
      entityId: product._id.toString(),
      entityTitle: product.title,
      changes: {
        after: product.toObject(),
        fields: Object.keys(productData)
      },
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionID,
      severity: 'medium'
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });

  } catch (error) {
    console.error('Create product error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create product'
    });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const oldProduct = product.toObject();
    const updateData = {
      ...req.body,
      updatedBy: req.user._id
    };

    // Check if brand exists
    if (updateData.brand) {
      const brand = await Brand.findById(updateData.brand);
      if (!brand) {
        return res.status(400).json({
          success: false,
          message: 'Brand not found'
        });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('brand', 'name logo')
     .populate('createdBy', 'name email')
     .populate('updatedBy', 'name email');

    // Log activity
    await AuditLog.logActivity({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'update',
      entity: 'product',
      entityId: product._id.toString(),
      entityTitle: product.title,
      changes: {
        before: oldProduct,
        after: updatedProduct.toObject(),
        fields: Object.keys(updateData)
      },
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionID,
      severity: 'medium'
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product: updatedProduct }
    });

  } catch (error) {
    console.error('Update product error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await Product.findByIdAndDelete(id);

    // Log activity
    await AuditLog.logActivity({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'delete',
      entity: 'product',
      entityId: product._id.toString(),
      entityTitle: product.title,
      changes: {
        before: product.toObject(),
        fields: Object.keys(product.toObject())
      },
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionID,
      severity: 'high'
    });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
};

// Bulk update products
const bulkUpdateProducts = async (req, res) => {
  try {
    const { productIds, updateData } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Product IDs are required'
      });
    }

    const updateResult = await Product.updateMany(
      { _id: { $in: productIds } },
      { ...updateData, updatedBy: req.user._id }
    );

    // Log activity
    await AuditLog.logActivity({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'bulk_action',
      entity: 'product',
      entityId: 'multiple',
      entityTitle: 'Bulk Update Products',
      metadata: {
        productIds,
        updateData,
        modifiedCount: updateResult.modifiedCount
      },
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionID,
      severity: 'medium'
    });

    res.json({
      success: true,
      message: `${updateResult.modifiedCount} products updated successfully`,
      data: { modifiedCount: updateResult.modifiedCount }
    });

  } catch (error) {
    console.error('Bulk update products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update products'
    });
  }
};

// Toggle product status
const toggleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'draft', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { status, updatedBy: req.user._id },
      { new: true }
    ).populate('brand', 'name logo')
     .populate('updatedBy', 'name email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Log activity
    await AuditLog.logActivity({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'status_change',
      entity: 'product',
      entityId: product._id.toString(),
      entityTitle: product.title,
      changes: {
        before: { status: product.status },
        after: { status },
        fields: ['status']
      },
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionID,
      severity: 'medium'
    });

    res.json({
      success: true,
      message: 'Product status updated successfully',
      data: { product }
    });

  } catch (error) {
    console.error('Toggle product status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product status'
    });
  }
};

// Get product statistics
const getProductStats = async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          inactiveProducts: {
            $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
          },
          draftProducts: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
          },
          featuredProducts: {
            $sum: { $cond: ['$featured', 1, 0] }
          },
          popularProducts: {
            $sum: { $cond: ['$popular', 1, 0] }
          },
          totalStock: { $sum: '$stock' },
          lowStockProducts: {
            $sum: {
              $cond: [
                { $lte: ['$stock', '$lowStockThreshold'] },
                1,
                0
              ]
            }
          },
          averagePrice: { $avg: '$price' },
          totalValue: { $sum: { $multiply: ['$price', '$stock'] } }
        }
      }
    ]);

    const categoryStats = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          averagePrice: { $avg: '$price' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const brandStats = await Product.aggregate([
      {
        $group: {
          _id: '$brand',
          count: { $sum: 1 },
          totalStock: { $sum: '$stock' }
        }
      },
      {
        $lookup: {
          from: 'brands',
          localField: '_id',
          foreignField: '_id',
          as: 'brandInfo'
        }
      },
      {
        $unwind: '$brandInfo'
      },
      {
        $project: {
          brandName: '$brandInfo.name',
          count: 1,
          totalStock: 1
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Log activity
    await AuditLog.logActivity({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'read',
      entity: 'product',
      entityId: 'stats',
      entityTitle: 'Product Statistics',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionID,
      severity: 'low'
    });

    res.json({
      success: true,
      data: {
        overview: stats[0] || {},
        categoryStats,
        brandStats
      }
    });

  } catch (error) {
    console.error('Get product stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product statistics'
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkUpdateProducts,
  toggleProductStatus,
  getProductStats
};
