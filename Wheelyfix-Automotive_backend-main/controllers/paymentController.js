const asyncHandler = require('express-async-handler');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/paymentModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const Booking = require('../models/bookingModel');
const { generateInvoice } = require('../utils/invoiceGenerator');

const getRazorpayKeys = () => ({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'thisissupersecret',
});

// GET /api/payments/config
// Surface whether keys are configured so the UI can toggle Pay Now visibility/enabled state
const getConfig = asyncHandler(async (req, res) => {
  const { key_id, key_secret } = getRazorpayKeys();
  res.json({ enabled: Boolean(key_id && key_secret), keyId: key_id || null });
});

// @desc    Verify payment signature
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400);
    throw new Error('Invalid payment verification payload');
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    res.status(400);
    throw new Error('Payment verification secret not configured');
  }
  const sign = crypto
    .createHmac('sha256', secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  const isValid = sign === razorpay_signature;
  if (!isValid) {
    res.status(400);
    throw new Error('Payment verification failed');
  }

  await Payment.findOneAndUpdate(
    { orderId: razorpay_order_id },
    { paymentId: razorpay_payment_id, status: 'paid' },
    { new: true }
  );

  res.json({ success: true });
});

// @desc    Create payment order from cart
// @route   POST /api/payments/create-cart-order
// @access  Private
const createCartOrder = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get user's pending bookings (cart items)
  const cartItems = await Booking.find({ 
    user: userId, 
    bookingType: 'service_cart',
    paymentStatus: 'pending' 
  });
  
  if (cartItems.length === 0) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  // Calculate total amount
  const totalAmount = cartItems.reduce((total, item) => total + (item.amount || 0), 0);

  const { key_id, key_secret } = getRazorpayKeys();
  if (!key_id || !key_secret) {
    res.status(400);
    throw new Error('Razorpay keys are not configured');
  }

  try {
    const instance = new Razorpay({ key_id, key_secret });
    
    // Create order with cart details
    const order = await instance.orders.create({
      amount: Math.round(Number(totalAmount) * 100), // Convert to paise
      currency: 'INR',
      receipt: `cart_${Date.now()}`,
      notes: {
        userId: userId.toString(),
        itemCount: cartItems.length,
        cartItems: cartItems.map(item => ({
          serviceId: item.serviceId,
          serviceName: item.serviceName,
          quantity: 1,
          price: item.amount
        }))
      },
    });

    // Create payment record
    const payment = await Payment.create({
      user: userId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: 'created',
      meta: { 
        type: 'cart_payment',
        cartItems: cartItems.map(item => item._id),
        itemCount: cartItems.length
      },
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: key_id,
      paymentId: payment._id,
      cartSummary: {
        totalItems: cartItems.length,
        totalAmount: totalAmount,
        totalAmountInRupees: totalAmount / 100
      }
    });
  } catch (err) {
    console.error('Error creating cart payment order:', err);
    res.status(502);
    throw new Error(err?.message || 'Failed to create payment order');
  }
});

// @desc    Verify cart payment and clear cart
// @route   POST /api/payments/verify-cart-payment
// @access  Private
const verifyCartPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const userId = req.user._id;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400);
    throw new Error('Invalid payment verification payload');
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    res.status(400);
    throw new Error('Payment verification secret not configured');
  }

  // Verify signature
  const sign = crypto
    .createHmac('sha256', secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  const isValid = sign === razorpay_signature;
  if (!isValid) {
    res.status(400);
    throw new Error('Payment verification failed');
  }

  try {
    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { orderId: razorpay_order_id, user: userId },
      { 
        paymentId: razorpay_payment_id, 
        status: 'paid',
        verifiedAt: new Date()
      },
      { new: true }
    );

    if (!payment) {
      res.status(404);
      throw new Error('Payment record not found');
    }

    // Get pending bookings for this user
    const pendingBookings = await Booking.find({ 
      user: userId, 
      bookingType: 'service_cart',
      paymentStatus: 'pending' 
    });
    
    // Update all pending bookings to paid status
    if (pendingBookings.length > 0) {
      const bookingIds = pendingBookings.map(booking => booking._id);
      
      await Booking.updateMany(
        { _id: { $in: bookingIds } },
        {
          paymentStatus: 'paid',
          status: 'upcoming',
          paymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id
        }
      );

      // Generate invoice for the first booking (representing the payment)
      try {
        const firstBooking = pendingBookings[0];
        const invoicePath = await generateInvoice({
          _id: firstBooking._id,
          orderNumber: `WF${String(firstBooking._id).slice(-6).toUpperCase()}`,
          user: req.user,
          items: pendingBookings.map(booking => ({
            title: booking.serviceName,
            price: booking.amount,
            quantity: 1,
            total: booking.amount
          })),
          total: pendingBookings.reduce((sum, booking) => sum + booking.amount, 0),
          subtotal: pendingBookings.reduce((sum, booking) => sum + booking.amount, 0),
          paymentStatus: 'paid',
          razorpay: {
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id
          },
          createdAt: new Date()
        }, req.user);
        
        const fileName = invoicePath.split('/').pop();
        
        // Update all bookings with invoice details
        await Booking.updateMany(
          { _id: { $in: bookingIds } },
          {
            invoice: {
              url: `/uploads/invoices/${fileName}`,
              fileName: fileName,
              generatedAt: new Date()
            }
          }
        );
        
        console.log(`Invoice generated for ${pendingBookings.length} bookings: ${invoicePath}`);
      } catch (invoiceError) {
        console.error('Error generating invoice:', invoiceError);
        // Don't fail the payment if invoice generation fails
      }
    }

    res.json({ 
      success: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amount: payment.amount,
      clearedCartItems: cartItems.length,
      message: 'Payment successful, order created, and cart cleared'
    });
  } catch (error) {
    console.error('Error verifying cart payment:', error);
    res.status(500);
    throw new Error('Failed to verify payment');
  }
});

module.exports = { 
  getConfig,
  verifyPayment, 
  createCartOrder, 
  verifyCartPayment 
};