const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, updateBookingPayment, createServiceBooking, getCartBookings, deleteBooking } = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');
const Booking = require('../models/bookingModel');

router.post('/', protect, createBooking);
router.post('/service', protect, createServiceBooking);
router.get('/my', protect, getMyBookings);
router.get('/cart', protect, getCartBookings);
router.put('/:id/payment', protect, updateBookingPayment);
router.delete('/:id', protect, deleteBooking);

// Admin: list all bookings and update status
router.get('/', protect, admin, async (req, res) => {
  const list = await Booking.find({}).sort({ createdAt: -1 }).populate('user', 'name email');
  res.json(list);
});

router.put('/:id/status', protect, admin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  const allowed = ['upcoming', 'completed', 'cancelled'];
  if (!allowed.includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }
  const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true });
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  res.json(booking);
});

module.exports = router;


