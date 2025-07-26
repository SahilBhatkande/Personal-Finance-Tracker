const mongoose = require('mongoose');

const debtSchema = new mongoose.Schema({
  personName: { type: String, required: true },
  totalAmount: { type: Number, default: 0 }, // Positive = they owe you, Negative = you owe them
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Debt', debtSchema); 