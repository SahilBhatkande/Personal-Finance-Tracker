const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  month: { type: String, required: true }, // Format: YYYY-MM
}, { timestamps: true });

module.exports = mongoose.model('Budget', budgetSchema);