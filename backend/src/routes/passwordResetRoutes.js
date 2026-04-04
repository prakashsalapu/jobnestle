const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');
const validateEmail = require('../utils/validateEmail');

const router = express.Router();

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.json({
        message: 'If an account exists with this email, a password reset OTP has been sent.',
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const now = new Date();

    await Otp.findOneAndUpdate(
      { email: email.toLowerCase() },
      { otp, expiresAt, attempts: 0, lastSentAt: now },
      { upsert: true, new: true }
    );

    try {
      const { sendOtpEmail } = require('../utils/emailService');
      await sendOtpEmail(email, otp);
    } catch (emailError) {
      console.error('⚠️ Email service error:', emailError.message);
    }

    res.json({
      message: 'If an account exists with this email, a password reset OTP has been sent.',
    });
  } catch (err) {
    console.error('❌ Forgot password error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

router.post('/verify-reset-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const otpRecord = await Otp.findOne({ email: email.toLowerCase() });

    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP not found or expired' });
    }

    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteOne({ email: email.toLowerCase() });
      return res.status(400).json({ message: 'OTP has expired' });
    }

    if (otpRecord.attempts >= 5) {
      await Otp.deleteOne({ email: email.toLowerCase() });
      return res.status(400).json({
        message: 'Maximum OTP attempts exceeded. Request a new OTP.',
      });
    }

    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({
        message: `Invalid OTP. ${5 - otpRecord.attempts} attempts remaining.`,
      });
    }

    const resetToken = jwt.sign(
      { email: email.toLowerCase(), type: 'reset' },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    await Otp.deleteOne({ email: email.toLowerCase() });

    res.json({
      message: 'OTP verified successfully',
      resetToken,
    });
  } catch (err) {
    console.error('❌ Verify reset OTP error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword, resetToken } = req.body;

    if (!email || !newPassword || !resetToken) {
      return res.status(400).json({
        message: 'Email, new password, and reset token are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    if (decoded.type !== 'reset' || decoded.email !== email.toLowerCase()) {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('❌ Reset password error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

module.exports = router;
