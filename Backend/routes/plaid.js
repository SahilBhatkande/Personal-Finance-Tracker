const express = require('express');
const router = express.Router();
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

// Initialize Plaid client
const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

// Store access tokens (in production, use a database)
const accessTokens = new Map();

// Create Link token for bank account linking
router.post('/create-link-token', async (req, res) => {
  try {
    // Debug: Check environment variables
    console.log('Plaid Environment Variables:');
    console.log('PLAID_CLIENT_ID:', process.env.PLAID_CLIENT_ID ? 'Set' : 'NOT SET');
    console.log('PLAID_SECRET:', process.env.PLAID_SECRET ? 'Set' : 'NOT SET');
    console.log('PLAID_ENV:', process.env.PLAID_ENV || 'sandbox');
    
    if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
      return res.status(500).json({ 
        error: 'Plaid credentials not configured. Please set PLAID_CLIENT_ID and PLAID_SECRET in your .env file.' 
      });
    }

    const request = {
      user: { client_user_id: 'user-id' },
      client_name: 'Personal Finance Tracker',
      products: ['transactions'],
      country_codes: ['IN'],
      language: 'en',
      account_filters: {
        depository: {
          account_subtypes: ['checking', 'savings'],
        },
      },
    };

    // Add webhook URL if available
    if (process.env.PLAID_WEBHOOK_URL) {
      request.webhook = process.env.PLAID_WEBHOOK_URL;
      console.log('Using webhook URL:', process.env.PLAID_WEBHOOK_URL);
    }

    console.log('Creating link token with request:', JSON.stringify(request, null, 2));
    const createTokenResponse = await plaidClient.linkTokenCreate(request);
    console.log('Link token created successfully');
    res.json({ link_token: createTokenResponse.data.link_token });
  } catch (error) {
    console.error('Error creating link token:', error);
    console.error('Error details:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to create link token',
      details: error.response?.data || error.message
    });
  }
});

// Exchange public token for access token
router.post('/exchange-token', async (req, res) => {
  try {
    const { public_token } = req.body;
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: public_token,
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;
    
    // Store access token (in production, save to database)
    accessTokens.set(itemId, accessToken);
    
    res.json({ 
      access_token: accessToken,
      item_id: itemId,
      message: 'Bank account linked successfully!' 
    });
  } catch (error) {
    console.error('Error exchanging token:', error);
    res.status(500).json({ error: 'Failed to exchange token' });
  }
});

// Get account balance
router.get('/balance', async (req, res) => {
  try {
    const { item_id } = req.query;
    const accessToken = accessTokens.get(item_id);
    
    if (!accessToken) {
      return res.status(400).json({ error: 'No access token found' });
    }

    const balanceResponse = await plaidClient.accountsBalanceGet({
      access_token: accessToken,
    });

    res.json({
      accounts: balanceResponse.data.accounts,
      total_balance: balanceResponse.data.accounts.reduce((sum, account) => 
        sum + (account.balances.current || 0), 0
      )
    });
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

// Get transactions
router.get('/transactions', async (req, res) => {
  try {
    const { item_id, start_date, end_date } = req.query;
    const accessToken = accessTokens.get(item_id);
    
    if (!accessToken) {
      return res.status(400).json({ error: 'No access token found' });
    }

    const transactionsResponse = await plaidClient.transactionsGet({
      access_token: accessToken,
      start_date: start_date || '2024-01-01',
      end_date: end_date || new Date().toISOString().split('T')[0],
    });

    // Process and save transactions to database
    const processedTransactions = transactionsResponse.data.transactions.map(tx => ({
      amount: tx.amount,
      description: tx.name,
      category: tx.category ? tx.category[0] : 'Other',
      date: tx.date,
      source: 'Plaid',
      type: tx.amount > 0 ? 'income' : 'expense',
      account_id: tx.account_id,
      transaction_id: tx.transaction_id,
    }));

    // Save to database (avoid duplicates)
    for (const tx of processedTransactions) {
      await Transaction.findOneAndUpdate(
        { transaction_id: tx.transaction_id },
        tx,
        { upsert: true, new: true }
      );
    }

    res.json({
      transactions: processedTransactions,
      total_count: transactionsResponse.data.total_transactions
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Sync transactions (webhook handler)
router.post('/webhook', async (req, res) => {
  try {
    const { webhook_type, webhook_code, item_id } = req.body;
    
    if (webhook_type === 'TRANSACTIONS' && webhook_code === 'DEFAULT_UPDATE') {
      // Fetch new transactions
      const accessToken = accessTokens.get(item_id);
      if (accessToken) {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const transactionsResponse = await plaidClient.transactionsGet({
          access_token: accessToken,
          start_date: startDate,
          end_date: endDate,
        });

        // Save new transactions
        for (const tx of transactionsResponse.data.transactions) {
          await Transaction.findOneAndUpdate(
            { transaction_id: tx.transaction_id },
            {
              amount: tx.amount,
              description: tx.name,
              category: tx.category ? tx.category[0] : 'Other',
              date: tx.date,
              source: 'Plaid',
              type: tx.amount > 0 ? 'income' : 'expense',
              account_id: tx.account_id,
              transaction_id: tx.transaction_id,
            },
            { upsert: true, new: true }
          );
        }
      }
    }
    
    res.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// Get linked accounts
router.get('/accounts', async (req, res) => {
  try {
    const { item_id } = req.query;
    const accessToken = accessTokens.get(item_id);
    
    if (!accessToken) {
      return res.status(400).json({ error: 'No access token found' });
    }

    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    res.json({ accounts: accountsResponse.data.accounts });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// Remove linked account
router.delete('/unlink', async (req, res) => {
  try {
    const { item_id } = req.body;
    accessTokens.delete(item_id);
    res.json({ message: 'Account unlinked successfully' });
  } catch (error) {
    console.error('Error unlinking account:', error);
    res.status(500).json({ error: 'Failed to unlink account' });
  }
});

// Legacy routes for backward compatibility
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

module.exports = router;