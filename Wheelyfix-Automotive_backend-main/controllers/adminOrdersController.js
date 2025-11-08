const Order = require('../models/orderModel');
const User = require('../models/userModel');
const Service = require('../models/serviceModel');
const Product = require('../models/productModel');
const AuditLog = require('../models/auditLogModel');
const { validationResult } = require('express-validator');

// Get all orders with pagination, search, and filters
const getOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      paymentStatus,
      paymentMethod,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      startDate,
      endDate,
      minAmount,
      maxAmount
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'billingAddress.name': { $regex: search, $options: 'i' } },
        { 'billingAddress.email': { $regex: search, $options: 'i' } },
        { 'billingAddress.phone': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    if (minAmount || maxAmount) {
      filter.total = {};
      if (minAmount) filter.total.$gte = Number(minAmount);
      if (maxAmount) filter.total.$lte = Number(maxAmount);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const orders = await Order.find(filter)
      .populate('user', 'name email phoneNumber')
      .populate('items.itemId')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Order.countDocuments(filter);

    // Log activity
    await AuditLog.logActivity({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'read',
      entity: 'order',
      entityId: 'multiple',
      entityTitle: 'Orders List',
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
        orders,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

// Get single order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('user', 'name email phoneNumber address')
      .populate('items.itemId')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Log activity
    await AuditLog.logActivity({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'read',
      entity: 'order',
      entityId: order._id.toString(),
      entityTitle: order.orderNumber,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionID,
      severity: 'low'
    });

    res.json({
      success: true,
      data: { order }
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
};

// Update order
const updateOrder = async (req, res) => {
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

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const oldOrder = order.toObject();
    const updateData = {
      ...req.body,
      updatedBy: req.user._id
    };

    // Handle status changes
    if (updateData.status && updateData.status !== order.status) {
      if (updateData.status === 'delivered') {
        updateData.completedDate = new Date();
      } else if (updateData.status === 'cancelled') {
        updateData.cancelledDate = new Date();
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'name email phoneNumber')
     .populate('items.itemId')
     .populate('updatedBy', 'name email');

    // Log activity
    await AuditLog.logActivity({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'update',
      entity: 'order',
      entityId: order._id.toString(),
      entityTitle: order.orderNumber,
      changes: {
        before: oldOrder,
        after: updatedOrder.toObject(),
        fields: Object.keys(updateData)
      },
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionID,
      severity: 'medium'
    });

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: { order: updatedOrder }
    });

  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order'
    });
  }
};

// Capture payment
const capturePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment already captured'
      });
    }

    if (!order.razorpay.paymentId) {
      return res.status(400).json({
        success: false,
        message: 'No payment ID found for this order'
      });
    }

    // Here you would typically call Razorpay API to capture the payment
    // For now, we'll just update the status
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { 
        paymentStatus: 'paid',
        updatedBy: req.user._id
      },
      { new: true }
    ).populate('user', 'name email phoneNumber')
     .populate('items.itemId')
     .populate('updatedBy', 'name email');

    // Log activity
    await AuditLog.logActivity({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'payment_capture',
      entity: 'order',
      entityId: order._id.toString(),
      entityTitle: order.orderNumber,
      changes: {
        before: { paymentStatus: order.paymentStatus },
        after: { paymentStatus: 'paid' },
        fields: ['paymentStatus']
      },
      metadata: {
        razorpayPaymentId: order.razorpay.paymentId
      },
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionID,
      severity: 'high'
    });

    res.json({
      success: true,
      message: 'Payment captured successfully',
      data: { order: updatedOrder }
    });

  } catch (error) {
    console.error('Capture payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to capture payment'
    });
  }
};

// Refund order
const refundOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid refund amount is required'
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot refund unpaid order'
      });
    }

    if (amount > order.total) {
      return res.status(400).json({
        success: false,
        message: 'Refund amount cannot exceed order total'
      });
    }

    // Calculate new payment status
    const refundedAmount = (order.refund?.amount || 0) + amount;
    const newPaymentStatus = refundedAmount >= order.total ? 'refunded' : 'partially_refunded';

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        paymentStatus: newPaymentStatus,
        refund: {
          amount: refundedAmount,
          reason,
          processedAt: new Date(),
          processedBy: req.user._id
        },
        updatedBy: req.user._id
      },
      { new: true }
    ).populate('user', 'name email phoneNumber')
     .populate('items.itemId')
     .populate('updatedBy', 'name email')
     .populate('refund.processedBy', 'name email');

    // Log activity
    await AuditLog.logActivity({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'payment_refund',
      entity: 'order',
      entityId: order._id.toString(),
      entityTitle: order.orderNumber,
      changes: {
        before: { 
          paymentStatus: order.paymentStatus,
          refund: order.refund
        },
        after: { 
          paymentStatus: newPaymentStatus,
          refund: updatedOrder.refund
        },
        fields: ['paymentStatus', 'refund']
      },
      metadata: {
        refundAmount: amount,
        refundReason: reason,
        totalRefunded: refundedAmount
      },
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionID,
      severity: 'high'
    });

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: { order: updatedOrder }
    });

  } catch (error) {
    console.error('Refund order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund'
    });
  }
};

// Create manual order
const createManualOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userId, items, billingAddress, shippingAddress, notes } = req.body;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify items exist and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      let itemDoc;
      if (item.type === 'service') {
        itemDoc = await Service.findById(item.itemId);
      } else if (item.type === 'product') {
        itemDoc = await Product.findById(item.itemId);
      }

      if (!itemDoc) {
        return res.status(400).json({
          success: false,
          message: `${item.type} not found: ${item.itemId}`
        });
      }

      const itemTotal = itemDoc.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        type: item.type,
        itemId: item.itemId,
        itemModel: item.type === 'service' ? 'Service' : 'Product',
        title: itemDoc.title,
        price: itemDoc.price,
        quantity: item.quantity,
        total: itemTotal,
        variant: item.variant
      });
    }

    // Calculate tax (assuming 18% GST)
    const taxAmount = subtotal * 0.18;
    const total = subtotal + taxAmount;

    const orderData = {
      user: userId,
      items: orderItems,
      subtotal,
      tax: {
        amount: taxAmount,
        rate: 18,
        type: 'GST'
      },
      total,
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: 'manual',
      billingAddress,
      shippingAddress: shippingAddress || billingAddress,
      notes: {
        admin: notes
      },
      createdBy: req.user._id
    };

    const order = new Order(orderData);
    await order.save();

    // Populate references
    await order.populate('user', 'name email phoneNumber');
    await order.populate('items.itemId');
    await order.populate('createdBy', 'name email');

    // Log activity
    await AuditLog.logActivity({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'create',
      entity: 'order',
      entityId: order._id.toString(),
      entityTitle: order.orderNumber,
      changes: {
        after: order.toObject(),
        fields: Object.keys(orderData)
      },
      metadata: {
        manualOrder: true,
        itemsCount: items.length,
        totalAmount: total
      },
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionID,
      severity: 'medium'
    });

    res.status(201).json({
      success: true,
      message: 'Manual order created successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Create manual order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create manual order'
    });
  }
};

// Get order statistics
const getOrderStats = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let startDate;
    const endDate = new Date();
    
    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const stats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          confirmedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          processingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
          },
          shippedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] }
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          paidOrders: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] }
          },
          pendingPayments: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] }
          },
          refundedOrders: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'refunded'] }, 1, 0] }
          }
        }
      }
    ]);

    const dailyStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Log activity
    await AuditLog.logActivity({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'read',
      entity: 'order',
      entityId: 'stats',
      entityTitle: 'Order Statistics',
      metadata: { period, startDate, endDate },
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionID,
      severity: 'low'
    });

    res.json({
      success: true,
      data: {
        overview: stats[0] || {},
        dailyStats,
        period: {
          start: startDate,
          end: endDate,
          days: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
        }
      }
    });

  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics'
    });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  updateOrder,
  capturePayment,
  refundOrder,
  createManualOrder,
  getOrderStats
};
