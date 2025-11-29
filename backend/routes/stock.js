// backend/routes/stock.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Product = require('../models/Product');
const StockLog = require('../models/StockLog');

router.post('/update', auth, async (req, res) => {
  const { productId, change, reason } = req.body;
  if (!productId || typeof change !== 'number') return res.status(400).json({ msg: 'Invalid request' });
  try {
    const prod = await Product.findById(productId);
    if (!prod) return res.status(404).json({ msg: 'Product not found' });
    const before = prod.stock || 0;
    const after = Math.max(0, before + change);
    prod.stock = after;
    await prod.save();
    const log = new StockLog({
      product: prod._id,
      change,
      before,
      after,
      reason: reason || '',
      user: req.user.id
    });
    await log.save();
    res.json({ product: prod, log });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/logs/:productId', auth, async (req, res) => {
  try {
    const logs = await StockLog.find({ product: req.params.productId }).sort({ createdAt: -1 }).populate('user', 'email name').lean();
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
