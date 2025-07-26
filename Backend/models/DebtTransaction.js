const mongoose = require('mongoose');

const debtTransactionSchema = new mongoose.Schema({
  debtId: { type: mongoose.Schema.Types.ObjectId, ref: 'Debt', required: true },
  amount: { type: Number, required: true }, // Positive = they owe you, Negative = you owe them
  description: { type: String, required: true },
  date: { type: Date, default: Date.now },
  type: { type: String, enum: ['lent', 'borrowed', 'paid'], required: true }, // lent = you lent them money, borrowed = you borrowed from them, paid = payment made
}, { timestamps: true });

module.exports = mongoose.model('DebtTransaction', debtTransactionSchema); 