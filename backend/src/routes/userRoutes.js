const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'resume') {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
    }
  } else if (file.fieldname === 'avatar') {
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG and GIF images are allowed.'));
    }
  } else {
    cb(new Error('Unknown file field'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'No token' });
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const updates = { ...req.body };
    let nameVal = updates.name;
    if (updates.fullName !== undefined && updates.fullName !== '') {
      nameVal = updates.fullName;
    }
    delete updates.name;
    delete updates.fullName;

    if (updates.education) {
      updates.education = updates.education.filter(
        (edu) =>
          edu.school?.trim() || edu.degree?.trim() || edu.from?.trim() || edu.to?.trim()
      );
    }

    const setDoc = { profile: updates };
    if (nameVal !== undefined && String(nameVal).trim()) {
      setDoc.name = String(nameVal).trim();
    }

    const user = await User.findByIdAndUpdate(req.user.id, { $set: setDoc }, { new: true, runValidators: true }).select(
      '-password'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({
      message: 'Failed to update profile',
      error: process.env.NODE_ENV !== 'production' ? err.message : undefined,
    });
  }
});

router.post('/upload-resume', auth, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const filePath = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { 'profile.resume': filePath } },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user, filePath });
  } catch (err) {
    console.error('Resume upload error:', err);
    res.status(500).json({ message: err.message || 'Failed to upload resume' });
  }
});

router.post('/upload-avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { 'profile.avatar': filePath } },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user, filePath });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ message: err.message || 'Failed to upload avatar' });
  }
});

module.exports = router;
