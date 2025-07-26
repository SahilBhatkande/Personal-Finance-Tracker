const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  source: { type: String, default: 'Manual' }, // Manual, Plaid, SMS, etc.
  type: { type: String, enum: ['income', 'expense'], default: 'expense' },
  account_id: { type: String }, // Plaid account ID
  transaction_id: { type: String, unique: true, sparse: true }, // Plaid transaction ID
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);