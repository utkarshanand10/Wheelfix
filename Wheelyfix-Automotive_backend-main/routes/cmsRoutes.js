const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const CmsContent = require('../models/cmsContentModel');

// Get value by key
router.get('/:key', async (req, res) => {
  const item = await CmsContent.findOne({ key: req.params.key });
  res.json(item ? item.value : null);
});

// Set value by key
router.put('/:key', protect, admin, async (req, res) => {
  const value = req.body?.value;
  const updated = await CmsContent.findOneAndUpdate(
    { key: req.params.key },
    { key: req.params.key, value },
    { new: true, upsert: true }
  );
  res.json(updated.value);
});

module.exports = router;


