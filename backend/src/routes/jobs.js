const express = require('express');
const Job = require('../models/Job');
const jwt = require('jsonwebtoken');

const router = express.Router();

// public list
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find({ is_active: true }).sort({ createdAt: -1 }).lean();
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// middleware to extract user from token
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'No token' });
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

router.post('/', auth, async (req, res) => {
  try {
    const body = req.body;
    const job = new Job({ ...body, posted_by: req.userId });
    await job.save();
    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
