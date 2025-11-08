const express = require('express');
const router = express.Router();
const {
  authUser,
  registerUser,
  getUserProfile,
  logoutUser,
  updateUserProfile,
  uploadAvatar,
  updateUserRole,
} = require('../controllers/userController');
const { testConnection } = require('../controllers/testController');
const { protect, admin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists before handling multipart
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Simple disk storage for avatars
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${req.user._id}${ext}`);
  },
});
const upload = multer({ storage });

router.route('/').post(registerUser);
router.post('/admin-signup', registerUser); // Admin signup route
router.post('/login', authUser);
router.post('/logout', protect, logoutUser);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.route('/test-connection').get(testConnection);

// Admin: list users with pagination/sort/search
router.get('/', protect, admin, async (req, res) => {
  const User = require('../models/userModel');
  const { search, page, limit, sortBy, order } = req.query || {};
  const hasPaging = page !== undefined || limit !== undefined;

  const filter = {};
  if (search) {
    const term = String(search).trim();
    filter.$or = [
      { name: { $regex: term, $options: 'i' } },
      { email: { $regex: term, $options: 'i' } },
    ];
  }

  const sortField = ['name', 'email', 'createdAt', 'updatedAt', 'isAdmin'].includes(String(sortBy)) ? String(sortBy) : 'createdAt';
  const sortDir = String(order).toLowerCase() === 'asc' ? 1 : -1;
  const sort = { [sortField]: sortDir };

  if (!hasPaging) {
    const users = await User.find(filter).select('-password').sort(sort);
    return res.json(users);
  }

  const pageNum = Math.max(parseInt(String(page) || '1', 10), 1);
  const pageSize = Math.min(Math.max(parseInt(String(limit) || '20', 10), 1), 200);
  const [total, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter).select('-password').sort(sort).skip((pageNum - 1) * pageSize).limit(pageSize),
  ]);

  res.json({ items: users, total, page: pageNum, limit: pageSize, sortBy: sortField, order: sortDir === 1 ? 'asc' : 'desc' });
});

// Admin: update role
router.put('/:id/role', protect, admin, updateUserRole);

module.exports = router;
