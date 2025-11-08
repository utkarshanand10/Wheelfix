const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    serviceId: {
      type: String,
      required: true
    },
    serviceName: {
      type: String,
      required: true
    },
    serviceType: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true // in paise
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    // Additional service details for display
    description: {
      type: String
    },
    duration: {
      type: String // e.g., "2-3 hours"
    },
    // Cart metadata
    addedAt: {
      type: Date,
      default: Date.now
    }
  },
  { 
    timestamps: true,
    // Ensure unique combination of user and service
    indexes: [
      { userId: 1, serviceId: 1 }
    ]
  }
);

// Prevent duplicate services in cart
cartSchema.index({ userId: 1, serviceId: 1 }, { unique: true });

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
