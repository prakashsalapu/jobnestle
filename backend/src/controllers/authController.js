const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validatePassword } = require('../utils/passwordValidator');
const validateEmail = require('../utils/validateEmail');
const { sendOtp, verifyOtp } = require('./otpController');

const userPayload = (user) => ({
  id: user._id,
  email: user.email,
  name: user.name,
});

const signToken = (user) =>
  jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

const signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    const name = (req.body.name ?? req.body.fullName ?? '').trim();

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      provider: 'local',
      isVerified: false,
    });
    await user.save();

    const otpResult = await sendOtp(email.toLowerCase());
    if (!otpResult.success) {
      return res.status(500).json({ message: 'Failed to send verification OTP' });
    }

    res.status(201).json({
      message: 'Account created. Please verify your email with the OTP sent to your email address.',
      email: email.toLowerCase(),
    });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

const resendVerificationOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !validateEmail(email)) {
      return res.status(400).json({ message: 'Valid email is required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.isVerified) {
      return res.json({ message: 'If the account exists and needs verification, an OTP has been sent.' });
    }
    const otpResult = await sendOtp(email.toLowerCase());
    if (!otpResult.success) {
      return res.status(400).json({ message: otpResult.message });
    }
    res.json({ message: 'OTP sent to your email' });
  } catch (err) {
    console.error('Resend verification OTP error:', err.message);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const otpResult = await verifyOtp(email.toLowerCase(), otp);
    if (!otpResult.success) {
      return res.status(400).json({ message: otpResult.message });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    user.isVerified = true;
    await user.save();

    res.json({ message: 'Email verified successfully. You can now login.' });
  } catch (err) {
    console.error('Email verification error:', err.message);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email first' });
    }

    if (user.provider !== 'local') {
      return res.status(403).json({ message: 'Use Google sign-in for this account' });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user);
    res.json({
      message: 'Login successful',
      token,
      user: userPayload(user),
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

const sendLoginOtp = async (req, res) => {
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
      return res.json({ message: 'If an account exists, OTP will be sent to the email address' });
    }

    if (!user.isVerified) {
      return res.json({ message: 'If an account exists, OTP will be sent to the email address' });
    }

    const otpResult = await sendOtp(email.toLowerCase());
    if (!otpResult.success) {
      return res.status(500).json({ message: 'Failed to send OTP' });
    }

    res.json({ message: 'OTP sent to your email' });
  } catch (err) {
    console.error('Login OTP Send error:', err.message);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const otpResult = await verifyOtp(email.toLowerCase(), otp);
    if (!otpResult.success) {
      return res.status(400).json({ message: otpResult.message });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email first' });
    }

    const token = signToken(user);
    res.json({
      message: 'Login successful',
      token,
      user: userPayload(user),
    });
  } catch (err) {
    console.error('Login OTP Verify error:', err.message);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

const googleAuthCallback = async (profile) => {
  const email = profile.emails[0].value.toLowerCase();
  const name = profile.displayName || 'User';
  const providerId = profile.id;

  let user = await User.findOne({ email });

  if (!user) {
    user = new User({
      name,
      email,
      provider: 'google',
      providerId,
      isVerified: true,
    });
    await user.save();
  } else {
    if (!user.providerId) {
      user.providerId = providerId;
      user.provider = 'google';
      user.isVerified = true;
      await user.save();
    }
  }

  return user;
};

const getCurrentUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error('Get Current User error:', err.message);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

module.exports = {
  signup,
  resendVerificationOtp,
  verifyEmailOtp,
  login,
  sendLoginOtp,
  verifyLoginOtp,
  googleAuthCallback,
  getCurrentUser,
};
