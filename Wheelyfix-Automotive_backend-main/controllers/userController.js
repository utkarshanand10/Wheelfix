const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database is not connected. Please try again shortly.' });
    }
    const { email, password } = req.body || {};
    
    // Validate required fields to avoid internal errors when comparing passwords
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    let user = null;
    try {
      user = await User.findOne({ email: String(email).toLowerCase() });
    } catch (err) {
      // Database not reachable or query error → surface a clear 503 instead of a generic 500
      return res.status(503).json({ message: 'Service temporarily unavailable. Please try again shortly.' });
    }

    let isMatch = false;
    if (user) {
      try {
        isMatch = await user.matchPassword(password);
      } catch (e) {
        // Avoid leaking internals; normalize compare errors to 401
        isMatch = false;
      }
    }

    if (user && isMatch) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    }

    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (e) {
    // Guard against unexpected exceptions leaking as 500s
    return res.status(503).json({ message: 'Service temporarily unavailable. Please try again.' });
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phoneNumber, address, vehicles, isAdmin, adminSecret } = req.body || {};

  // Check if trying to create admin user
  if (isAdmin) {
    // Require admin secret for admin user creation
    const requiredAdminSecret = process.env.ADMIN_SECRET || 'wheelyfix-admin-2024';
    if (adminSecret !== requiredAdminSecret) {
      res.status(403);
      throw new Error('Invalid admin secret key');
    }
  }

  // Basic validation - check if required fields exist
  if (!name || !email || !password || !phoneNumber) {
    res.status(400);
    throw new Error('Please fill in all required fields');
  }

  // Lightweight diagnostics to surface root-cause for 500s during development
  if (process.env.NODE_ENV !== 'production') {
    try {
      console.log('[register] incoming', {
        hasName: Boolean(name),
        hasEmail: Boolean(email),
        hasPassword: Boolean(password),
        hasPhoneNumber: Boolean(phoneNumber),
        hasAddressObject: typeof address === 'object' && address !== null,
        dbState: mongoose.connection.readyState,
      });
    } catch (_) {}
  }

  const trimmedName = String(name || '').trim();
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedPhone = String(phoneNumber || '').trim();

  // Validate input fields
  if (!trimmedName || !normalizedEmail || !password || !normalizedPhone) {
    res.status(400);
    throw new Error('Please fill in all required fields');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    res.status(400);
    throw new Error('Please enter a valid email address');
  }

  // Phone number validation
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(normalizedPhone)) {
    res.status(400);
    throw new Error('Please enter a valid 10-digit phone number');
  }

  // Validate password strength
  if (String(password).length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters long');
  }

  // If DB is not connected, short-circuit with a clear 503 so the UI doesn't see a generic 500
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database is not connected. Please try again shortly.' });
  }

  // Check if user already exists
  const userExists = await User.findOne({ 
    $or: [
      { email: normalizedEmail },
      { phoneNumber: normalizedPhone }
    ]
  }).catch((err) => {
    // If DB is temporarily unavailable, return a 503 rather than throwing an unhandled error
    res.status(503);
    throw new Error('Database unavailable. Please try again shortly.');
  });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email or phone number');
  }

  try {
    // Create user
    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password,
      phoneNumber: normalizedPhone,
      address: address && typeof address === 'object' ? address : {},
      vehicles: Array.isArray(vehicles) ? vehicles : [],
      isAdmin: req.body.isAdmin || false, // Allow setting admin status during registration
    });

    if (user) {
      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        vehicles: user.vehicles,
        avatarUrl: user.avatarUrl,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[register] error', {
        name: err?.name,
        code: err?.code,
        message: err?.message,
        errors: err?.errors ? Object.keys(err.errors) : undefined,
      });
    }
    // Duplicate key error
    if (err && err.code === 11000) {
      res.status(400);
      const field = Object.keys(err.keyValue || {})[0] || 'field';
      throw new Error(`An account with this ${field} already exists`);
    }
    // Validation errors
    if (err && err.name === 'ValidationError') {
      res.status(400);
      const messages = Object.values(err.errors || {}).map((e) => e.message);
      throw new Error(messages.join(', '));
    }
    // Fallback: service error
    return res.status(503).json({ message: 'Service temporarily unavailable. Please try again shortly.' });
  }

  res.status(400);
  throw new Error('Invalid user data');
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      address: user.address,
      vehicles: user.vehicles,
      avatarUrl: user.avatarUrl,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  // In a real implementation with server-side sessions, you would invalidate the session here
  // Since we're using JWT tokens stored in localStorage on the client side,
  // the actual logout happens on the client by removing the token
  
  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = { authUser, registerUser, getUserProfile, logoutUser };
 
// @desc    Update user profile (name, phone, address)
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { name, phoneNumber, address } = req.body || {};
  if (name !== undefined) user.name = String(name);
  if (phoneNumber !== undefined) user.phoneNumber = String(phoneNumber);
  if (address !== undefined) {
    // Accept both string and object; if string, store under street for simple UI
    if (typeof address === 'string') {
      user.address = { ...(user.address || {}), street: address };
    } else if (typeof address === 'object' && address !== null) {
      user.address = address;
    }
  }

  const saved = await user.save();
  res.json({
    _id: saved._id,
    name: saved.name,
    email: saved.email,
    phoneNumber: saved.phoneNumber,
    address: saved.address,
    vehicles: saved.vehicles,
    avatarUrl: saved.avatarUrl,
    isAdmin: saved.isAdmin,
  });
});

// @desc    Upload avatar image
// @route   POST /api/users/avatar
// @access  Private
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const ext = path.extname(req.file.filename || req.file.originalname || '.jpg');
  const fileName = `avatar_${user._id}${ext}`;
  const destPath = path.join(uploadsDir, fileName);

  // If multer already wrote to uploads with a temp/random name, move/rename to our deterministic name
  if (req.file.path && req.file.path !== destPath) {
    try {
      fs.renameSync(req.file.path, destPath);
    } catch (e) {
      // fallback: copy
      fs.copyFileSync(req.file.path, destPath);
    }
  }

  user.avatarUrl = `/uploads/${fileName}`;
  await user.save();
  res.json({ avatarUrl: user.avatarUrl });
});

module.exports.updateUserProfile = updateUserProfile;
module.exports.uploadAvatar = uploadAvatar;

// @desc    Update user role (admin only)
// @route   PUT /api/users/:id/role
// @access  Private/Admin
module.exports.updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isAdmin } = req.body || {};
  if (typeof isAdmin !== 'boolean') {
    res.status(400);
    throw new Error('isAdmin boolean is required');
  }
  const user = await User.findByIdAndUpdate(id, { isAdmin }, { new: true }).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json(user);
});
