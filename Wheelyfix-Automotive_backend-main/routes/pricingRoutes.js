const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const PricingRule = require('../models/pricingModel');

// List rules
router.get('/', protect, admin, async (_req, res) => {
  const rules = await PricingRule.find({}).sort({ createdAt: -1 });
  res.json(rules);
});

// Upsert rule
router.put('/', protect, admin, async (req, res) => {
  const { scope, refId, price, currency, metadata } = req.body || {};
  if (!scope || !refId || typeof price !== 'number') { res.status(400); throw new Error('scope, refId, price required'); }
  const updated = await PricingRule.findOneAndUpdate(
    { scope, refId },
    { scope, refId, price, currency: currency || 'INR', metadata: metadata || {} },
    { new: true, upsert: true }
  );
  res.json(updated);
});

// Delete rule
router.delete('/', protect, admin, async (req, res) => {
  const { scope, refId } = req.body || {};
  if (!scope || !refId) { res.status(400); throw new Error('scope, refId required'); }
  await PricingRule.deleteOne({ scope, refId });
  res.json({ success: true });
});

module.exports = router;


