const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const path = require('path');
const fs = require('fs');

// @desc    Create order from cart after successful payment
// @route   POST /api/orders/create-from-cart
// @access  Private
const createOrderFromCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { paymentId, orderId, amount } = req.body;

  if (!paymentId || !orderId || !amount) {
    res.status(400);
    throw new Error('Payment details are required');
  }

  try {
    // Get cart items (they should still exist at this point)
    const cartItems = await Cart.find({ userId });
    
    if (cartItems.length === 0) {
      res.status(400);
      throw new Error('No cart items found');
    }

    // Create order items from cart
    const orderItems = cartItems.map(item => ({
      type: 'service',
      itemId: item._id, // Using cart item ID as reference
      itemModel: 'Service',
      title: item.serviceName,
      price: item.price,
      quantity: item.quantity,
      total: item.price * item.quantity,
    }));

    // Calculate totals
    const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);

    // Create order
    const order = await Order.create({
      user: userId,
      items: orderItems,
      subtotal: subtotal,
      total: subtotal,
      currency: 'INR',
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: 'razorpay',
      razorpay: {
        orderId: orderId,
        paymentId: paymentId,
        receipt: `cart_${Date.now()}`,
      },
      billingAddress: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phoneNumber || '',
      },
      notes: {
        customer: `Order created from cart with ${cartItems.length} service(s)`,
        admin: `Payment verified: ${paymentId}`,
      },
      createdBy: userId,
    });

    res.status(201).json({
      success: true,
      order: order,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Error creating order from cart:', error);
    res.status(500);
    throw new Error('Failed to create order');
  }
});

// @desc    Get user's orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const orders = await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate('user', 'name email phoneNumber');

  res.json({
    success: true,
    orders: orders
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const userId = req.user._id;

  const order = await Order.findOne({ _id: orderId, user: userId })
    .populate('user', 'name email phoneNumber');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  res.json({
    success: true,
    order: order
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin only)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const { status, notes } = req.body;

  if (!status) {
    res.status(400);
    throw new Error('Status is required');
  }

  const order = await Order.findById(orderId);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.status = status;
  if (notes) {
    order.notes.admin = notes;
  }
  order.updatedBy = req.user._id;

  await order.save();

  res.json({
    success: true,
    order: order,
    message: 'Order status updated successfully'
  });
});

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private (Admin only)
const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const orders = await Order.find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'name email phoneNumber');

  const total = await Order.countDocuments();

  res.json({
    success: true,
    orders: orders,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalOrders: total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }
  });
});

// @desc    Download invoice for an order
// @route   GET /api/orders/:id/invoice
// @access  Private
const downloadInvoice = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const userId = req.user._id;

  const order = await Order.findOne({ _id: orderId, user: userId });

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (!order.invoice || !order.invoice.url) {
    res.status(404);
    throw new Error('Invoice not found for this order');
  }

  // Check if payment is completed
  if (order.paymentStatus !== 'paid') {
    res.status(400);
    throw new Error('Invoice is only available for paid orders');
  }

  try {
    const invoicePath = path.join(__dirname, '../public', order.invoice.url);
    
    // Check if file exists
    if (!fs.existsSync(invoicePath)) {
      res.status(404);
      throw new Error('Invoice file not found on server');
    }

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${order.invoice.fileName}"`);
    res.setHeader('Cache-Control', 'no-cache');

    // Stream the file
    const fileStream = fs.createReadStream(invoicePath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      console.error('Error streaming invoice file:', error);
      res.status(500).json({ error: 'Error downloading invoice' });
    });

  } catch (error) {
    console.error('Error downloading invoice:', error);
    res.status(500);
    throw new Error('Error downloading invoice');
  }
});

module.exports = {
  createOrderFromCart,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  getAllOrders,
  downloadInvoice
};
