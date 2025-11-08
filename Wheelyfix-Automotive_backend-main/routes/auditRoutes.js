const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const AuditLog = require('../models/auditLogModel');

// GET /api/audit?entity=&actor=&action=&page=&limit=&from=&to=
router.get('/', protect, admin, async (req, res) => {
  const { entity, actor, action, page, limit, from, to } = req.query || {};
  const hasPaging = page !== undefined || limit !== undefined;

  const filter = {};
  if (entity) filter.entity = String(entity);
  if (action) filter.action = String(action);
  if (actor) filter.$or = [
    { actorEmail: { $regex: String(actor), $options: 'i' } },
    { actorId: String(actor) }
  ];
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(String(from));
    if (to) filter.createdAt.$lte = new Date(String(to));
  }

  const sort = { createdAt: -1 };

  if (!hasPaging) {
    const items = await AuditLog.find(filter).sort(sort).limit(500);
    return res.json(items);
  }

  const pageNum = Math.max(parseInt(String(page) || '1', 10), 1);
  const pageSize = Math.min(Math.max(parseInt(String(limit) || '20', 10), 1), 200);

  const [total, items] = await Promise.all([
    AuditLog.countDocuments(filter),
    AuditLog.find(filter).sort(sort).skip((pageNum - 1) * pageSize).limit(pageSize),
  ]);

  res.json({ items, total, page: pageNum, limit: pageSize });
});

module.exports = router;


