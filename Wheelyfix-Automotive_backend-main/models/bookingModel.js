const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Service details
    serviceId: { type: String }, // ID from services list
    serviceName: { type: String, required: true },
    serviceDescription: { type: String },
    serviceCategory: { type: String },
    serviceDuration: { type: String },
    serviceIcon: { type: String },
    
    // Customer details (for direct bookings)
    name: { type: String, trim: true },
    phoneNumber: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    vehicleType: { type: String },
    vehicleModel: { type: String },
    date: { type: Date },
    timeSlot: { type: String },
    address: { type: String },
    notes: { type: String },
    
    // Booking type
    bookingType: {
      type: String,
      enum: ['direct', 'service_cart'],
      default: 'direct'
    },
    
    // Status
    status: {
      type: String,
      enum: ['upcoming', 'completed', 'cancelled', 'pending'],
      default: 'pending',
    },
    
    // Payment related fields
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentId: { type: String },
    razorpayOrderId: { type: String },
    amount: { type: Number }, // in paise
    currency: { type: String, default: 'INR' },
    
    // Invoice details
    invoice: {
      url: String,
      fileName: String,
      generatedAt: Date,
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;


