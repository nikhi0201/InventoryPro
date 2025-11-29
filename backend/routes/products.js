// backend/routes/products.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');

router.get('/', auth, async (req, res) => {
  try {
    const q = req.query.q || '';
    const filter = q ? { name: { $regex: q, $options: 'i' } } : {};
    const products = await Product.find(filter).populate('supplier').lean();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const p = await Product.findById(req.params.id).populate('supplier').lean();
    if (!p) return res.status(404).json({ msg: 'Not found' });
    res.json(p);
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, sku, description, supplier, price, stock } = req.body;
    const product = new Product({ name, sku, description, supplier, price, stock });
    await product.save();
    res.json(product);
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Server error' }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const data = req.body;
    const p = await Product.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(p);
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Server error' }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Deleted' });
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Server error' }); }
});

module.exports = router;
