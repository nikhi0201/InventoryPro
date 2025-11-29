// backend/routes/suppliers.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Supplier = require('../models/Supplier');

router.get('/', auth, async (req, res) => {
  try {
    const suppliers = await Supplier.find().lean();
    res.json(suppliers);
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const s = new Supplier(req.body);
    await s.save();
    res.json(s);
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const s = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(s);
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Deleted' });
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

module.exports = router;
