const asyncHandler = require('express-async-handler');
const Service = require('../models/serviceModel');
const { logAudit } = require('../utils/auditLogger');

// Create
exports.createService = asyncHandler(async (req, res) => {
  const { name, description, icon, price, durationMinutes, isActive, category } = req.body || {};
  if (!name) {
    res.status(400);
    throw new Error('Name is required');
  }
  const created = await Service.create({ name, description, icon, price, durationMinutes, isActive, category });
  logAudit({ req, action: 'create', entity: 'Service', entityId: created._id, metadata: { name: created.name } });
  res.status(201).json(created);
});

// List (supports optional server-side pagination/sort/filter)
// Backward compatible: if no pagination params provided, returns an array
exports.listServices = asyncHandler(async (req, res) => {
  const {
    page,
    limit,
    search,
    status,
    category,
    sortBy,
    order,
    from,
    to,
  } = req.query || {};

  const hasPaging = page !== undefined || limit !== undefined;

  // Build filter
  const filter = {};
  if (search) {
    const term = String(search).trim();
    filter.$or = [
      { name: { $regex: term, $options: 'i' } },
      { description: { $regex: term, $options: 'i' } },
      { category: { $regex: term, $options: 'i' } },
    ];
  }
  if (category) {
    filter.category = String(category);
  }
  if (status === 'active') filter.isActive = true;
  if (status === 'inactive') filter.isActive = false;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(String(from));
    if (to) filter.createdAt.$lte = new Date(String(to));
  }

  // Build sort
  const sortField = ['name', 'price', 'durationMinutes', 'createdAt', 'updatedAt', 'category', 'isActive'].includes(String(sortBy))
    ? String(sortBy)
    : 'createdAt';
  const sortDir = String(order).toLowerCase() === 'asc' ? 1 : -1;
  const sort = { [sortField]: sortDir };

  if (!hasPaging) {
    const items = await Service.find(filter).sort(sort);
    return res.json(items);
  }

  const pageNum = Math.max(parseInt(String(page) || '1', 10), 1);
  const pageSize = Math.min(Math.max(parseInt(String(limit) || '10', 10), 1), 200);

  const [total, items] = await Promise.all([
    Service.countDocuments(filter),
    Service.find(filter)
      .sort(sort)
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize),
  ]);

  res.json({
    items,
    total,
    page: pageNum,
    limit: pageSize,
    sortBy: sortField,
    order: sortDir === 1 ? 'asc' : 'desc',
  });
});

// Update
exports.updateService = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body || {};
  const item = await Service.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!item) {
    res.status(404);
    throw new Error('Service not found');
  }
  logAudit({ req, action: 'update', entity: 'Service', entityId: id, metadata: { updates } });
  res.json(item);
});

// Delete
exports.deleteService = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const item = await Service.findByIdAndDelete(id);
  if (!item) {
    res.status(404);
    throw new Error('Service not found');
  }
  logAudit({ req, action: 'delete', entity: 'Service', entityId: id, metadata: { name: item.name } });
  res.json({ success: true });
});


