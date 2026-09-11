const express = require('express');
const crypto = require('crypto');
const ApiKey = require('../models/ApiKey');
const ActivityLog = require('../models/ActivityLog');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

/* ── Create API Key ──────────────────────────────────────── */

router.post('/', async (req, res) => {
  try {
    const { name, permissions = ['read'] } = req.body;

    if (!name || name.trim().length < 1) {
      return res.status(400).json({ success: false, message: 'API key name is required.' });
    }

    const keyCount = await ApiKey.countDocuments({ userId: req.userId, isActive: true });
    if (keyCount >= 10) {
      return res.status(400).json({ success: false, message: 'Maximum 10 active API keys allowed.' });
    }

    // Generate key: sx_live_ + 40 random hex chars
    const rawKey = `sx_live_${crypto.randomBytes(20).toString('hex')}`;
    const prefix = rawKey.substring(0, 16);
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    const apiKey = await ApiKey.create({
      name: name.trim(),
      prefix,
      keyHash,
      userId: req.userId,
      permissions: permissions.filter(p => ['read', 'write', 'admin'].includes(p))
    });

    await ActivityLog.create({
      userId: req.userId,
      action: 'api_key_created',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { keyName: name, keyId: apiKey._id }
    });

    // Return full key ONLY on creation — never stored or shown again
    res.status(201).json({
      success: true,
      message: 'API key created. Copy it now — it won\'t be shown again.',
      key: {
        id: apiKey._id,
        name: apiKey.name,
        fullKey: rawKey,
        prefix: apiKey.prefix,
        permissions: apiKey.permissions,
        createdAt: apiKey.createdAt
      }
    });
  } catch (err) {
    console.error('Create API key error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/* ── List API Keys ───────────────────────────────────────── */

router.get('/', async (req, res) => {
  try {
    const keys = await ApiKey.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select('-keyHash')
      .lean();

    res.json({
      success: true,
      keys: keys.map(k => ({
        id: k._id,
        name: k.name,
        prefix: k.prefix + '••••••••',
        permissions: k.permissions,
        isActive: k.isActive,
        lastUsedAt: k.lastUsedAt,
        usageCount: k.usageCount,
        createdAt: k.createdAt
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/* ── Revoke API Key ──────────────────────────────────────── */

router.delete('/:id', async (req, res) => {
  try {
    const key = await ApiKey.findOne({ _id: req.params.id, userId: req.userId });
    if (!key) {
      return res.status(404).json({ success: false, message: 'API key not found.' });
    }

    key.isActive = false;
    await key.save();

    await ActivityLog.create({
      userId: req.userId,
      action: 'api_key_revoked',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { keyName: key.name, keyId: key._id }
    });

    res.json({ success: true, message: 'API key revoked.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
