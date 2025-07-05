const express = require('express')
const router = express.Router();
const Transaction = require('../models/Transaction')
const Budget = require('../models/Budget')

router.get('/transactions' , async (req , res) => {

    try {
        const transactions = await Transaction.find().sort({date : -1})
        res.json(transactions);
    } catch (error) {

        res.status(500).json({error : 'Server error'});
        
    }


})

router.post('/transactions' , async (req, res) => {
    try {
        const transaction = new Transaction(req.body);
        await transaction.save();
        res.status(201).json(transaction)
    } catch (error) {
        res.status(400).json({ error: 'Invalid data' });
    }
})


router.put('/transactions/:id' , async (req , res) => {
    try {
        const transaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new:true}
        )
        
        if(!transaction)
        {
            return res.status(404).json({error: 'Transaction not found'})
        }

        res.json(transaction)

    } catch (error) {

        res.status(400).json({error : 'Invalid data'})
        
    }
})

router.delete('/transactions/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


// Budget Routes
router.get('/budgets', async (req, res) => {
  try {
    const budgets = await Budget.find();
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/budgets', async (req, res) => {
  try {
    const budget = new Budget(req.body);
    await budget.save();
    res.status(201).json(budget);
  } catch (error) {
    res.status(400).json({ error: 'Invalid data' });
  }
});

module.exports = router;