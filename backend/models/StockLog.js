// backend/models/StockLog.js
const mongoose = require('mongoose');

const StockLogSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  change: { type: Number, required: true },
  before: { type: Number, required: true },
  after: { type: Number, required: true },
  reason: { type: String, default: '' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('StockLog', StockLogSchema);
