const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const Brand = require('../models/brandModel');

// List brands with optional type + pagination/sort/search
router.get('/', async (req, res) => {
  const { type, search, page, limit, sortBy, order } = req.query || {};
  const hasPaging = page !== undefined || limit !== undefined;

  const filter = {};
  if (type) filter.type = String(type);
  if (search) {
    const term = String(search).trim();
    filter.$or = [
      { name: { $regex: term, $options: 'i' } },
      { slug: { $regex: term, $options: 'i' } },
      { 'models.name': { $regex: term, $options: 'i' } },
    ];
  }

  const sortField = ['name', 'createdAt', 'updatedAt'].includes(String(sortBy)) ? String(sortBy) : 'name';
  const sortDir = String(order).toLowerCase() === 'desc' ? -1 : 1;
  const sort = { [sortField]: sortDir };

  if (!hasPaging) {
    const items = await Brand.find(filter).sort(sort);
    return res.json(items);
  }

  const pageNum = Math.max(parseInt(String(page) || '1', 10), 1);
  const pageSize = Math.min(Math.max(parseInt(String(limit) || '20', 10), 1), 200);
  const [total, items] = await Promise.all([
    Brand.countDocuments(filter),
    Brand.find(filter).sort(sort).skip((pageNum - 1) * pageSize).limit(pageSize),
  ]);
  res.json({ items, total, page: pageNum, limit: pageSize, sortBy: sortField, order: sortDir === 1 ? 'asc' : 'desc' });
});

// Create brand
router.post('/', protect, admin, async (req, res) => {
  const { type, name, slug, logo, models } = req.body || {};
  if (!type || !name || !slug) {
    res.status(400);
    throw new Error('type, name, slug are required');
  }
  const created = await Brand.create({ type, name, slug: String(slug).toLowerCase(), logo, models: models || [] });
  res.status(201).json(created);
});

// Update brand
router.put('/:id', protect, admin, async (req, res) => {
  const { id } = req.params;
  const payload = req.body || {};
  if (payload.slug) payload.slug = String(payload.slug).toLowerCase();
  const updated = await Brand.findByIdAndUpdate(id, payload, { new: true });
  if (!updated) { res.status(404); throw new Error('Brand not found'); }
  res.json(updated);
});

// Delete brand
router.delete('/:id', protect, admin, async (req, res) => {
  const { id } = req.params;
  const deleted = await Brand.findByIdAndDelete(id);
  if (!deleted) { res.status(404); throw new Error('Brand not found'); }
  res.json({ success: true });
});

module.exports = router;


