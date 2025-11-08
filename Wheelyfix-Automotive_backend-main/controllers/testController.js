const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

// @desc    Test connection endpoint
// @route   GET /api/users/test-connection
// @access  Public
const testConnection = asyncHandler(async (req, res) => {
  const dbState = mongoose.connection.readyState; // 0=disconnected,1=connected,2=connecting,3=disconnecting
  const ok = dbState === 1;
  const stats = ok
    ? {
        users: await mongoose.connection.db.collection('users').countDocuments().catch(() => 0),
        bookings: await mongoose.connection.db.collection('bookings').countDocuments().catch(() => 0),
        payments: await mongoose.connection.db.collection('payments').countDocuments().catch(() => 0),
      }
    : {};
  res.status(ok ? 200 : 503).json({
    success: ok,
    message: ok ? 'Backend and DB connected' : 'Backend up, DB not connected',
    dbState,
    stats,
    timestamp: new Date().toISOString()
  });
});

module.exports = { testConnection };