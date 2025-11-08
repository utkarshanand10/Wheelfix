const asyncHandler = require('express-async-handler');
const Booking = require('../models/bookingModel');
const Razorpay = require('razorpay');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
  const {
    // Service details
    serviceId,
    serviceName,
    serviceDescription,
    serviceCategory,
    serviceDuration,
    serviceIcon,
    
    // Customer details (for direct bookings)
    name,
    phone,
    email,
    vehicleType,
    vehicleModel,
    serviceType,
    date,
    timeSlot,
    address,
    notes,
    amount, // in paise
    createPaymentOrder = false, // flag to create payment order
  } = req.body;

  // For service cart bookings, only serviceName is required
  if (!serviceName) {
    res.status(400);
    throw new Error('Service name is required');
  }

  // For direct bookings, validate required fields
  if (!serviceId && (!name || !phone || !email || !vehicleType || !vehicleModel || !serviceType || !date || !timeSlot || !address)) {
    res.status(400);
    throw new Error('Missing required booking fields for direct booking');
  }

  const booking = await Booking.create({
    user: req.user._id,
    // Service details
    serviceId: serviceId || null,
    serviceName,
    serviceDescription: serviceDescription || null,
    serviceCategory: serviceCategory || null,
    serviceDuration: serviceDuration || null,
    serviceIcon: serviceIcon || null,
    
    // Customer details (for direct bookings)
    name: name || null,
    phoneNumber: phone || null,
    email: email || null,
    vehicleType: vehicleType || null,
    vehicleModel: vehicleModel || null,
    date: date ? new Date(date) : null,
    timeSlot: timeSlot || null,
    address: address || null,
    notes: notes || null,
    
    // Booking type
    bookingType: serviceId ? 'service_cart' : 'direct',
    
    amount: amount || 0,
  });

  // If payment order is requested, create Razorpay order
  if (createPaymentOrder && amount && amount > 0) {
    try {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const order = await razorpay.orders.create({
        amount: Math.round(Number(amount)),
        currency: 'INR',
        receipt: `booking_${booking._id}`,
        notes: {
          bookingId: booking._id.toString(),
          serviceType: serviceType,
        },
      });

      // Update booking with Razorpay order ID
      booking.razorpayOrderId = order.id;
      await booking.save();

      res.status(201).json({
        booking,
        paymentOrder: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: process.env.RAZORPAY_KEY_ID,
        },
      });
    } catch (error) {
      console.error('Error creating payment order:', error);
      res.status(201).json({
        booking,
        paymentError: 'Failed to create payment order',
      });
    }
  } else {
    res.status(201).json(booking);
  }
});

// @desc    Get current user's bookings
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(bookings);
});

// @desc    Update booking payment status
// @route   PUT /api/bookings/:id/payment
// @access  Private
const updateBookingPayment = asyncHandler(async (req, res) => {
  const { paymentId, paymentStatus, razorpayOrderId } = req.body;
  
  const booking = await Booking.findById(req.params.id);
  
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  if (booking.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this booking');
  }

  booking.paymentId = paymentId;
  booking.paymentStatus = paymentStatus;
  if (razorpayOrderId) {
    booking.razorpayOrderId = razorpayOrderId;
  }

  await booking.save();

  res.json(booking);
});

// @desc    Create service booking from Services page
// @route   POST /api/bookings/service
// @access  Private
const createServiceBooking = asyncHandler(async (req, res) => {
  const { serviceId, serviceName, serviceDescription, serviceCategory, serviceDuration, serviceIcon, amount } = req.body;

  if (!serviceId || !serviceName) {
    res.status(400);
    throw new Error('Service ID and name are required');
  }

  const booking = await Booking.create({
    user: req.user._id,
    serviceId,
    serviceName,
    serviceDescription: serviceDescription || null,
    serviceCategory: serviceCategory || null,
    serviceDuration: serviceDuration || null,
    serviceIcon: serviceIcon || null,
    bookingType: 'service_cart',
    status: 'pending',
    paymentStatus: 'pending',
    amount: amount || 0,
  });

  res.status(201).json({
    success: true,
    booking,
    message: 'Service booked successfully'
  });
});

// @desc    Get bookings for cart display
// @route   GET /api/bookings/cart
// @access  Private
const getCartBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ 
    user: req.user._id, 
    bookingType: 'service_cart',
    paymentStatus: 'pending'
  }).sort({ createdAt: -1 });

  res.json({
    success: true,
    bookings
  });
});

// @desc    Delete a booking
// @route   DELETE /api/bookings/:id
// @access  Private
const deleteBooking = asyncHandler(async (req, res) => {
  const bookingId = req.params.id;
  const userId = req.user._id;

  const booking = await Booking.findOne({ _id: bookingId, user: userId });

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Only allow deletion of pending bookings
  if (booking.paymentStatus !== 'pending') {
    res.status(400);
    throw new Error('Cannot delete paid or confirmed bookings');
  }

  await Booking.findByIdAndDelete(bookingId);

  res.json({
    success: true,
    message: 'Booking deleted successfully'
  });
});

module.exports = { 
  createBooking, 
  getMyBookings, 
  updateBookingPayment, 
  createServiceBooking,
  getCartBookings,
  deleteBooking
};


