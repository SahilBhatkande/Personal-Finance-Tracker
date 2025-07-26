import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BankLink = () => {
  const [linkToken, setLinkToken] = useState(null);
  const [isLinked, setIsLinked] = useState(false);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load Plaid Link script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
    script.onload = () => {
      console.log('Plaid Link script loaded');
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Create link token
  const createLinkToken = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('https://personal-finance-tracker-1-cbkb.onrender.com');
      setLinkToken(response.data.link_token);
    } catch (err) {
      setError('Failed to create link token. Please check your Plaid configuration.');
      console.error('Error creating link token:', err);
    } finally {
      setLoading(false);
    }
  };

  // Open Plaid Link
  const openPlaidLink = () => {
    if (!linkToken) {
      setError('No link token available');
      return;
    }

    const handler = window.Plaid.create({
      token: linkToken,
      onSuccess: async (public_token, metadata) => {
        try {
          const response = await axios.post('https://personal-finance-tracker-1-cbkb.onrender.com', {
            public_token: public_token
          });
          
          setIsLinked(true);
          setError(null);
          console.log('Bank account linked successfully!');
          
          // Store item_id for future use
          localStorage.setItem('plaid_item_id', response.data.item_id);
          
          // Fetch initial balance
          fetchBalance(response.data.item_id);
        } catch (err) {
          setError('Failed to link bank account');
          console.error('Error exchanging token:', err);
        }
      },
      onExit: (err, metadata) => {
        if (err) {
          setError('Bank linking was cancelled or failed');
          console.error('Plaid Link exit:', err);
        }
      },
      onEvent: (eventName, metadata) => {
        console.log('Plaid Link event:', eventName, metadata);
      },
    });

    handler.open();
  };

  // Fetch account balance
  const fetchBalance = async (itemId) => {
    try {
      const response = await axios.get(`http://localhost:5000/plaid/balance?item_id=${itemId}`);
      setBalance(response.data);
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  // Sync transactions
  const syncTransactions = async () => {
    try {
      setLoading(true);
      const itemId = localStorage.getItem('plaid_item_id');
      if (!itemId) {
        setError('No linked account found');
        return;
      }

      const response = await axios.get(`https://personal-finance-tracker-1-cbkb.onrender.com/plaid/transactions?item_id=${itemId}`);
      console.log('Synced transactions:', response.data);
      setError(null);
      
      // Refresh the page to show new transactions
      window.location.reload();
    } catch (err) {
      setError('Failed to sync transactions');
      console.error('Error syncing transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Unlink account
  const unlinkAccount = async () => {
    try {
      const itemId = localStorage.getItem('plaid_item_id');
      await axios.delete('https://personal-finance-tracker-1-cbkb.onrender.com/plaid/unlink', {
        data: { item_id: itemId }
      });
      
      localStorage.removeItem('plaid_item_id');
      setIsLinked(false);
      setBalance(null);
      setError(null);
    } catch (err) {
      setError('Failed to unlink account');
      console.error('Error unlinking account:', err);
    }
  };

  // Check if account is already linked
  useEffect(() => {
    const itemId = localStorage.getItem('plaid_item_id');
    if (itemId) {
      setIsLinked(true);
      fetchBalance(itemId);
    }
  }, []);

  return (
    <div className="bank-link-container">
      <h3>Connect Your Bank Account</h3>
      
      {error && (
        <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>
          {error}
        </div>
      )}

      {!isLinked ? (
        <div>
          <p>Link your SBI account to automatically sync transactions and track your balance.</p>
          <button 
            onClick={createLinkToken}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginRight: '10px'
            }}
          >
            {loading ? 'Creating Link...' : 'Link Bank Account'}
          </button>
          
          {linkToken && (
            <button 
              onClick={openPlaidLink}
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Open Plaid Link
            </button>
          )}
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h4>Linked Account</h4>
            {balance && (
              <div>
                <p><strong>Total Balance:</strong> ₹{balance.total_balance?.toFixed(2) || '0.00'}</p>
                {balance.accounts?.map((account, index) => (
                  <div key={index} style={{ marginBottom: '10px' }}>
                    <p><strong>{account.name}:</strong> ₹{account.balances.current?.toFixed(2) || '0.00'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <button 
              onClick={syncTransactions}
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginRight: '10px'
              }}
            >
              {loading ? 'Syncing...' : 'Sync Transactions'}
            </button>
            
            <button 
              onClick={unlinkAccount}
              style={{
                padding: '10px 20px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Unlink Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankLink; 