const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String },
    description: { type: String },
    location: { type: String },
    job_type: { type: String },
    salary: { type: String },
    requirements: [String],
    skills_required: [String],
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    is_active: { type: Boolean, default: true },
    status: { type: String, enum: ['open', 'closed', 'draft'], default: 'open' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', JobSchema);
