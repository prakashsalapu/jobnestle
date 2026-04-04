const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, default: 'pending' },
    resume: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Application', ApplicationSchema);
