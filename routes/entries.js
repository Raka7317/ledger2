const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Every entries route requires a logged-in user (admin or viewer).
router.use(verifyToken);

// GET /api/entries  -> all entries, newest first (any logged-in user)
router.get('/', async (req, res) => {
  try {
    const entries = await Entry.find().sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/entries -> create new entry (admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { type, date, party, address, item, remark, amount } = req.body;

    if (!type || !date || !party || amount === undefined || amount === null) {
      return res.status(400).json({ error: 'type, date, party and amount are required' });
    }
    if (isNaN(amount)) {
      return res.status(400).json({ error: 'amount must be a number' });
    }

    const entry = new Entry({ type, date, party, address, item, remark, amount: Number(amount) });
    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/entries/:id -> remove one entry (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deleted = await Entry.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Entry not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
