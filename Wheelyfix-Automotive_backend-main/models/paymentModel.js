const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: String, index: true },
    paymentId: { type: String },
    amount: { type: Number, required: true }, // in paise
    currency: { type: String, default: 'INR' },
    receipt: { type: String },
    status: { type: String, enum: ['created', 'paid', 'failed'], default: 'created' },
    error: { type: String },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);


