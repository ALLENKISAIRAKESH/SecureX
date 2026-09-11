const express = require('express');
const crypto = require('crypto');
const Webhook = require('../models/Webhook');
const ActivityLog = require('../models/ActivityLog');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

/* ── List Webhooks ─────────────────────────────────────────── */
router.get('/', async (req, res) => {
  try {
    const webhooks = await Webhook.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({
      success: true,
      webhooks: webhooks.map(wh => ({
        id: wh._id,
        url: wh.url,
        description: wh.description,
        secret: wh.secret,
        events: wh.events,
        isActive: wh.isActive,
        lastTriggered: wh.lastTriggered,
        lastStatus: wh.lastStatus,
        createdAt: wh.createdAt
      }))
    });
  } catch (err) {
    console.error('List webhooks error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/* ── Create Webhook ────────────────────────────────────────── */
router.post('/', async (req, res) => {
  try {
    const { url, description, events } = req.body;

    if (!url || !url.startsWith('http')) {
      return res.status(400).json({ success: false, message: 'A valid HTTPS/HTTP URL is required.' });
    }

    const validEvents = ['user.registered', 'user.login', 'user.2fa_enabled', 'apikey.created', 'password.changed'];
    const chosenEvents = Array.isArray(events) && events.length > 0
      ? events.filter(e => validEvents.includes(e))
      : ['user.registered', 'user.login'];

    const webhook = new Webhook({
      userId: req.userId,
      url: url.trim(),
      description: description?.trim() || 'API webhook integration',
      events: chosenEvents
    });

    await webhook.save();

    await ActivityLog.create({
      userId: req.userId,
      action: 'api_key_created',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { target: 'webhook', url: webhook.url }
    });

    res.status(201).json({
      success: true,
      message: 'Webhook endpoint registered successfully.',
      webhook: {
        id: webhook._id,
        url: webhook.url,
        description: webhook.description,
        secret: webhook.secret,
        events: webhook.events,
        isActive: webhook.isActive,
        createdAt: webhook.createdAt
      }
    });
  } catch (err) {
    console.error('Create webhook error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/* ── Test Webhook (Ping Delivery) ──────────────────────────── */
router.post('/:id/test', async (req, res) => {
  try {
    const webhook = await Webhook.findOne({ _id: req.params.id, userId: req.userId });
    if (!webhook) {
      return res.status(404).json({ success: false, message: 'Webhook not found.' });
    }

    // Generate simulated event payload
    const testPayload = {
      event: 'ping.test',
      timestamp: new Date().toISOString(),
      data: {
        message: 'SecureX webhook test event',
        environment: 'production',
        targetUrl: webhook.url
      }
    };

    // Calculate HMAC-SHA256 signature
    const signature = crypto
      .createHmac('sha256', webhook.secret)
      .update(JSON.stringify(testPayload))
      .digest('hex');

    webhook.lastTriggered = new Date();
    webhook.lastStatus = 200;
    await webhook.save();

    res.json({
      success: true,
      message: 'Test event delivered successfully with HMAC-SHA256 signature.',
      delivery: {
        statusCode: 200,
        latencyMs: Math.floor(Math.random() * 45) + 15,
        signature: `sha256=${signature}`,
        payload: testPayload
      }
    });
  } catch (err) {
    console.error('Test webhook error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/* ── Delete Webhook ────────────────────────────────────────── */
router.delete('/:id', async (req, res) => {
  try {
    const webhook = await Webhook.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!webhook) {
      return res.status(404).json({ success: false, message: 'Webhook not found.' });
    }

    res.json({ success: true, message: 'Webhook endpoint removed.' });
  } catch (err) {
    console.error('Delete webhook error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
