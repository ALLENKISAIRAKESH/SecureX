const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 60
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: { type: String, required: true },
  salt: { type: String, required: true },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  twoFactorSecret: { type: String, default: null },
  twoFactorEnabled: { type: Boolean, default: false },
  backupCodes: [{ code: String, used: Boolean }],
  avatar: { type: String, default: null },
  lastLoginAt: { type: Date, default: null },
  lastLoginIp: { type: String, default: null },
  loginCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'github', 'magic_link'],
    default: 'local'
  },
  magicToken: { type: String, default: null },
  magicTokenExpires: { type: Date, default: null }
}, { timestamps: true });

userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
