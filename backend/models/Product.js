// backend/models/Product.js
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, default: '' },
  description: { type: String, default: '' },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: false },
  price: { type: Number, default: 0 },
  stock: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
