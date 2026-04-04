const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Job = require('../models/Job');
const Application = require('../models/Application');

const router = express.Router();

async function auth(req, res, next) {
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

router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find({ is_active: true }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error(err);
    if (process.env.NODE_ENV !== 'production') {
      return res.status(500).json({ message: 'Server error', error: err.message, stack: err.stack });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/mine', auth, async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user.id }).sort('-createdAt').lean();
    for (const job of jobs) {
      job.applicationCount = await Application.countDocuments({ job: job._id });
    }
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Job not found' });
    }
    const job = await Job.findById(req.params.id);
    if (!job || !job.is_active) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    console.error(err);
    if (process.env.NODE_ENV !== 'production') {
      return res.status(500).json({ message: 'Server error', error: err.message, stack: err.stack });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const job = new Job({
      ...req.body,
      recruiter: req.user.id,
      is_active: true,
      status: 'open',
    });
    await job.save();
    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.recruiter.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedJob);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.recruiter.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
