const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, unique: true, index: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    attempts: { type: Number, default: 0 },
    lastSentAt: { type: Date },
  },
  { timestamps: true }
);

// TTL index: automatically delete OTP documents after expiry
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Ensure indexes are created
OtpSchema.pre('save', async function(next) {
  try {
    await this.collection.createIndexes();
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Otp', OtpSchema);
