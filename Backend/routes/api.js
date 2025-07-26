const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Debt = require('../models/Debt');
const DebtTransaction = require('../models/DebtTransaction');

// Existing routes (unchanged)
router.get('/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

router.post('/transactions', async (req, res) => {
  try {
    const transaction = new Transaction(req.body);
    await transaction.save();
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save transaction' });
  }
});

router.put('/transactions/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

router.delete('/transactions/:id', async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

router.get('/budgets', async (req, res) => {
  try {
    const budgets = await Budget.find();
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

router.post('/budgets', async (req, res) => {
  try {
    const budget = new Budget(req.body);
    await budget.save();
    res.json(budget);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save budget' });
  }
});

// New: Parse SMS submitted via web form
router.post('/sms-transactions', async (req, res) => {
  try {
    const { smsText } = req.body;
    const transaction = parseSMS(smsText);
    await Transaction.findOneAndUpdate(
      { description: transaction.description, date: transaction.date, amount: transaction.amount },
      transaction,
      { upsert: true }
    );
    res.json({ message: 'SMS transaction saved', transaction });
  } catch (err) {
    console.error('SMS transaction error:', err);
    res.status(500).json({ error: 'Failed to save SMS transaction' });
  }
});

// New: Twilio webhook for automatic SMS parsing
router.post('/sms-webhook', async (req, res) => {
  try {
    const smsText = req.body.Body; // Twilio sends SMS body
    const transaction = parseSMS(smsText);
    await Transaction.findOneAndUpdate(
      { description: transaction.description, date: transaction.date, amount: transaction.amount },
      transaction,
      { upsert: true }
    );
    res.json({ message: 'SMS webhook processed', transaction });
  } catch (err) {
    console.error('SMS webhook error:', err);
    res.status(500).json({ error: 'Failed to process SMS webhook' });
  }
});

// Helper function to parse SBI SMS
function parseSMS(sms) {
  // Example: "Rs.500 credited to A/c XXXX1234 on 11-07-2025 by UPI/GPAY*REFUND."
  // Example: "Rs.500 debited from A/c XXXX1234 on 10-07-2025 to UPI/PHONEPE*MERCHANT."
  const amountMatch = sms.match(/(?:Rs\.|Credit of Rs\.)(\d+\.?\d*)/);
  const dateMatch = sms.match(/on (\d{2}-\d{2}-\d{4})/);
  const descriptionMatch = sms.match(/(?:to|by) ([^.]+\.|\w+@\w+)/);

  let source = 'Manual';
  if (sms.toLowerCase().match(/phonepe|phone pay/gi)) source = 'PhonePe';
  else if (sms.toLowerCase().match(/paytm/gi)) source = 'Paytm';
  else if (sms.toLowerCase().match(/google pay|gpay/gi)) source = 'Google Pay';

  const isCredit = sms.toLowerCase().includes('credited') || sms.toLowerCase().includes('credit of');
  const amount = amountMatch ? parseFloat(amountMatch[1]) * (isCredit ? -1 : 1) : 0;

  return {
    amount,
    date: dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0],
    description: descriptionMatch ? descriptionMatch[1].replace('.', '') : 'Unknown',
    category: categorizeTransaction(descriptionMatch ? descriptionMatch[1] : ''),
    source,
  };
}

// Helper function to categorize transactions
function categorizeTransaction(description) {
  const desc = description.toLowerCase();
  if (desc.includes('food') || desc.includes('restaurant')) return 'Food';
  if (desc.includes('transport') || desc.includes('uber') || desc.includes('ola')) return 'Transportation';
  if (desc.includes('housing') || desc.includes('rent')) return 'Housing';
  if (desc.includes('entertainment') || desc.includes('movie')) return 'Entertainment';
  if (desc.includes('utility') || desc.includes('bill')) return 'Utilities';
  if (desc.includes('refund')) return 'Refund'; // Added for credits
  return 'Other';
}

// Debt Routes
router.get('/debts', async (req, res) => {
  try {
    const debts = await Debt.find().sort({ personName: 1 });
    res.json(debts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch debts' });
  }
});

router.post('/debts', async (req, res) => {
  try {
    const debt = new Debt(req.body);
    await debt.save();
    res.json(debt);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save debt' });
  }
});

router.put('/debts/:id', async (req, res) => {
  try {
    const debt = await Debt.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(debt);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update debt' });
  }
});

router.delete('/debts/:id', async (req, res) => {
  try {
    await DebtTransaction.deleteMany({ debtId: req.params.id });
    await Debt.findByIdAndDelete(req.params.id);
    res.json({ message: 'Debt and all transactions deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete debt' });
  }
});

// Debt Transaction Routes
router.get('/debts/:id/transactions', async (req, res) => {
  try {
    const transactions = await DebtTransaction.find({ debtId: req.params.id }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch debt transactions' });
  }
});

router.post('/debts/:id/transactions', async (req, res) => {
  try {
    const { amount, description, type } = req.body;
    const debtId = req.params.id;
    
    // Create the transaction
    const transaction = new DebtTransaction({
      debtId,
      amount,
      description,
      type
    });
    await transaction.save();
    
    // Update the total amount in the debt
    const debt = await Debt.findById(debtId);
    if (type === 'lent') {
      debt.totalAmount += amount;
    } else if (type === 'borrowed') {
      debt.totalAmount -= amount;
    } else if (type === 'paid') {
      // If amount is positive, they paid you back
      // If amount is negative, you paid them back
      debt.totalAmount -= amount;
    }
    await debt.save();
    
    res.json({ transaction, updatedDebt: debt });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save debt transaction' });
  }
});

router.delete('/debts/:id/transactions/:transactionId', async (req, res) => {
  try {
    const transaction = await DebtTransaction.findById(req.params.transactionId);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    // Update the total amount in the debt
    const debt = await Debt.findById(req.params.id);
    if (transaction.type === 'lent') {
      debt.totalAmount -= transaction.amount;
    } else if (transaction.type === 'borrowed') {
      debt.totalAmount += transaction.amount;
    } else if (transaction.type === 'paid') {
      debt.totalAmount += transaction.amount;
    }
    await debt.save();
    
    // Delete the transaction
    await DebtTransaction.findByIdAndDelete(req.params.transactionId);
    
    res.json({ message: 'Transaction deleted', updatedDebt: debt });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete debt transaction' });
  }
});

module.exports = router;