const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Application = require('../models/Application');
const Job = require('../models/Job');

const router = express.Router();

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

router.post('/apply', auth, async (req, res) => {
  try {
    const { jobId } = req.body;
    if (!jobId || !mongoose.isValidObjectId(jobId)) {
      return res.status(400).json({ message: 'Invalid job ID' });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.recruiter.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot apply to your own job' });
    }

    const existing = await Application.findOne({ job: jobId, user: req.user.id });
    if (existing) return res.status(400).json({ message: 'Already applied' });

    const app = new Application({ job: jobId, user: req.user.id });
    await app.save();
    res.json({ message: 'Applied', application: app });
  } catch (err) {
    console.error(err);
    if (process.env.NODE_ENV !== 'production') {
      return res.status(500).json({ message: 'Server error', error: err.message, stack: err.stack });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const apps = await Application.find({ user: req.user.id }).populate('job');
    res.json(apps);
  } catch (err) {
    console.error(err);
    if (process.env.NODE_ENV !== 'production') {
      return res.status(500).json({ message: 'Server error', error: err.message, stack: err.stack });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/received', auth, async (req, res) => {
  try {
    const jobIds = await Job.find({ recruiter: req.user.id }).select('_id').lean();
    const jobIdArray = jobIds.map((d) => d._id);

    const applications = await Application.find({ job: { $in: jobIdArray } })
      .populate('user', 'name email')
      .populate('job', 'title')
      .sort('-createdAt')
      .lean();

    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (
      !['pending', 'reviewing', 'shortlisted', 'rejected', 'accepted', 'Applied', 'Rejected', 'Accepted', 'Completed'].includes(
        status
      )
    ) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await Application.findById(id).populate('job', 'recruiter');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    application.status = status;
    await application.save();

    res.json(application);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
