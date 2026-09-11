const mongoose = require('mongoose');
const crypto = require('crypto');

const webhookSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: 'Production webhook endpoint',
    trim: true
  },
  secret: {
    type: String,
    default: () => 'whsec_' + crypto.randomBytes(24).toString('hex')
  },
  events: {
    type: [String],
    default: ['user.registered', 'user.login', 'user.2fa_enabled', 'apikey.created']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastTriggered: {
    type: Date,
    default: null
  },
  lastStatus: {
    type: Number,
    default: null
  }
}, { timestamps: true });

webhookSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Webhook', webhookSchema);
