const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [{
      type: {
        type: String,
        enum: ['service', 'product'],
        required: true,
      },
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'items.itemModel',
      },
      itemModel: {
        type: String,
        enum: ['Service', 'Product'],
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative'],
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
      },
      total: {
        type: Number,
        required: true,
        min: [0, 'Total cannot be negative'],
      },
      variant: {
        name: String,
        value: String,
        price: Number,
      },
    }],
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative'],
    },
    tax: {
      amount: {
        type: Number,
        default: 0,
        min: [0, 'Tax amount cannot be negative'],
      },
      rate: {
        type: Number,
        default: 0,
        min: [0, 'Tax rate cannot be negative'],
        max: [100, 'Tax rate cannot exceed 100%'],
      },
      type: {
        type: String,
        enum: ['GST', 'VAT', 'Sales Tax', 'Other'],
        default: 'GST',
      },
    },
    discount: {
      amount: {
        type: Number,
        default: 0,
        min: [0, 'Discount amount cannot be negative'],
      },
      type: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'fixed',
      },
      code: String,
      description: String,
    },
    shipping: {
      amount: {
        type: Number,
        default: 0,
        min: [0, 'Shipping amount cannot be negative'],
      },
      method: {
        type: String,
        enum: ['standard', 'express', 'overnight', 'pickup'],
        default: 'standard',
      },
      trackingNumber: String,
      carrier: String,
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR', 'GBP'],
    },
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded',
        'failed'
      ],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: [
        'pending',
        'paid',
        'failed',
        'refunded',
        'partially_refunded',
        'cancelled'
      ],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'cash', 'bank_transfer', 'cheque', 'other'],
      default: 'razorpay',
    },
    razorpay: {
      orderId: String,
      paymentId: String,
      signature: String,
      receipt: String,
    },
    invoice: {
      url: String,
      fileName: String,
      generatedAt: Date,
    },
    billingAddress: {
      name: String,
      email: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },
    shippingAddress: {
      name: String,
      email: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },
    notes: {
      customer: String,
      admin: String,
    },
    scheduledDate: Date,
    completedDate: Date,
    cancelledDate: Date,
    cancellationReason: String,
    refund: {
      amount: Number,
      reason: String,
      processedAt: Date,
      processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Indexes for better performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'razorpay.orderId': 1 });
orderSchema.index({ 'razorpay.paymentId': 1 });

// Virtual for order status display
orderSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
    failed: 'Failed',
  };
  return statusMap[this.status] || this.status;
});

// Virtual for payment status display
orderSchema.virtual('paymentStatusDisplay').get(function() {
  const statusMap = {
    pending: 'Pending',
    paid: 'Paid',
    failed: 'Failed',
    refunded: 'Refunded',
    partially_refunded: 'Partially Refunded',
    cancelled: 'Cancelled',
  };
  return statusMap[this.paymentStatus] || this.paymentStatus;
});

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `WF${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Pre-save middleware to calculate totals
orderSchema.pre('save', function(next) {
  if (this.isModified('items') || this.isModified('tax') || this.isModified('discount') || this.isModified('shipping')) {
    // Calculate subtotal
    this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
    
    // Calculate total
    this.total = this.subtotal + this.tax.amount + this.shipping.amount - this.discount.amount;
    
    // Ensure total is not negative
    if (this.total < 0) {
      this.total = 0;
    }
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);