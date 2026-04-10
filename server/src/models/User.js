const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ProfileSchema = new mongoose.Schema({
  avatar: { type: String },
  contact: { type: String },
  address: { type: String },
  education: [{ school: String, degree: String, from: String, to: String }],
  resume: { type: String },
});

const UserSchema = new mongoose.Schema(
  {
    name: { type: String },
    fullName: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    provider: { type: String, enum: ['local', 'google'], default: 'local' },
    providerId: { type: String },
    isVerified: { type: Boolean, default: false },
    profile: ProfileSchema,
  },
  { timestamps: true }
);

UserSchema.pre('validate', function (next) {
  if ((!this.name || !String(this.name).trim()) && this.fullName) {
    this.name = this.fullName;
  }
  next();
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', UserSchema);
