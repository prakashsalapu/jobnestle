const express = require('express');
const router = express.Router();
const {
  signup,
  resendVerificationOtp,
  verifyEmailOtp,
  login,
  sendLoginOtp,
  verifyLoginOtp,
  getCurrentUser,
} = require('../controllers/authController');

// ===================== SIGNUP =====================
router.post('/signup', signup);

// ===================== VERIFY EMAIL =====================
router.post('/resend-verification-otp', resendVerificationOtp);
router.post('/verify-email-otp', verifyEmailOtp);

// ===================== LOGIN =====================
router.post('/login', login);

// ===================== LOGIN OTP =====================
router.post('/login-otp/send', sendLoginOtp);
router.post('/login-otp/verify', verifyLoginOtp);

// ===================== GET CURRENT USER =====================
router.get('/me', getCurrentUser);

router.use(require('./passwordResetRoutes'));

module.exports = router;
