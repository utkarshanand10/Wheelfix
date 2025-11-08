const express = require('express');
const router = express.Router();
const { adminLogin, refreshToken, adminLogout, getProfile, updateProfile, changePassword } = require('../controllers/adminAuthController');
const { verifyToken } = require('../middleware/adminAuth');
const { schemas } = require('../middleware/validateAdmin');

// Public routes
router.post('/login', 
  ...schemas.login,
  adminLogin
);

router.post('/refresh-token', 
  ...schemas.refreshToken,
  refreshToken
);

// Protected routes
router.use(verifyToken);

router.post('/logout', adminLogout);
router.get('/profile', getProfile);
router.put('/profile', 
  ...schemas.updateProfile,
  updateProfile
);
router.put('/change-password', 
  ...schemas.changePassword,
  changePassword
);

module.exports = router;
