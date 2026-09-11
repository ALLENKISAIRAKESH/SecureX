const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  prefix: {
    type: String,
    required: true
  },
  keyHash: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  permissions: [{
    type: String,
    enum: ['read', 'write', 'admin'],
    default: 'read'
  }],
  lastUsedAt: { type: Date, default: null },
  usageCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date, default: null }
}, { timestamps: true });

apiKeySchema.index({ userId: 1 });
apiKeySchema.index({ keyHash: 1 });

module.exports = mongoose.model('ApiKey', apiKeySchema);
