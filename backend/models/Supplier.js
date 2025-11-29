// backend/models/Supplier.js
const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactEmail: { type: String },
  phone: { type: String },
  address: { type: String },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Supplier', SupplierSchema);
