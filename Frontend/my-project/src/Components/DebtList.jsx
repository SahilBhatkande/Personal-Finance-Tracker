import { useState, useEffect } from 'react';

const DebtList = ({ refresh, onUpdate }) => {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDebt, setNewDebt] = useState({ personName: '', notes: '' });

  useEffect(() => {
    fetchDebts();
  }, [refresh]);

  const fetchDebts = async () => {
    try {
      const response = await fetch('https://personal-finance-tracker-1-cbkb.onrender.com/api/debts');
      const data = await response.json();
      setDebts(data);
    } catch (error) {
      console.error('Error fetching debts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDebt = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://personal-finance-tracker-1-cbkb.onrender.com/api/debts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDebt),
      });
      if (response.ok) {
        setNewDebt({ personName: '', notes: '' });
        setShowAddForm(false);
        fetchDebts();
        onUpdate();
      }
    } catch (error) {
      console.error('Error adding debt:', error);
    }
  };

  const handleDeleteDebt = async (id) => {
    if (window.confirm('Are you sure you want to delete this debt and all its transactions?')) {
      try {
        const response = await fetch(`https://personal-finance-tracker-1-cbkb.onrender.com/api/debts/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchDebts();
          onUpdate();
          if (selectedDebt?._id === id) {
            setSelectedDebt(null);
          }
        }
      } catch (error) {
        console.error('Error deleting debt:', error);
      }
    }
  };

  const getDebtStatus = (amount) => {
    if (amount > 0) return { text: 'They owe you', color: 'text-green-500' };
    if (amount < 0) return { text: 'You owe them', color: 'text-red-500' };
    return { text: 'Settled up', color: 'text-gray-500' };
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            <div className="h-4 bg-gray-300 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Debt Tracker</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {showAddForm ? 'Cancel' : 'Add Person'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddDebt} className="mb-6 p-4 bg-white/5 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Person Name
              </label>
              <input
                type="text"
                value={newDebt.personName}
                onChange={(e) => setNewDebt({ ...newDebt, personName: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter person's name"
                required
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Notes
              </label>
              <input
                type="text"
                value={newDebt.notes}
                onChange={(e) => setNewDebt({ ...newDebt, notes: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional notes"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Add Person
          </button>
        </form>
      )}

      <div className="space-y-4">
        {debts.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No debt relationships found. Add someone to get started!</p>
        ) : (
          debts.map((debt) => {
            const status = getDebtStatus(debt.totalAmount);
            return (
              <div
                key={debt._id}
                className={`p-4 rounded-lg border transition-all cursor-pointer hover:scale-105 ${
                  selectedDebt?._id === debt._id
                    ? 'bg-blue-600/20 border-blue-500'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
                onClick={() => setSelectedDebt(selectedDebt?._id === debt._id ? null : debt)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{debt.personName}</h3>
                    <p className={`text-sm ${status.color}`}>{status.text}</p>
                    {debt.notes && <p className="text-gray-400 text-sm mt-1">{debt.notes}</p>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-lg font-bold ${status.color}`}>
                      ₹{Math.abs(debt.totalAmount).toFixed(2)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDebt(debt._id);
                      }}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Delete debt"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedDebt && (
        <DebtTransactionHistory
          debt={selectedDebt}
          onClose={() => setSelectedDebt(null)}
          onUpdate={() => {
            fetchDebts();
            onUpdate();
          }}
        />
      )}
    </div>
  );
};

const DebtTransactionHistory = ({ debt, onClose, onUpdate }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    description: '',
    type: 'lent'
  });

  useEffect(() => {
    fetchTransactions();
  }, [debt._id]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/debts/${debt._id}/transactions`);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/debts/${debt._id}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTransaction,
          amount: parseFloat(newTransaction.amount)
        }),
      });
      if (response.ok) {
        setNewTransaction({ amount: '', description: '', type: 'lent' });
        setShowAddForm(false);
        fetchTransactions();
        onUpdate();
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/debts/${debt._id}/transactions/${transactionId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchTransactions();
          onUpdate();
        }
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  const getTransactionTypeLabel = (type) => {
    switch (type) {
      case 'lent': return 'You lent';
      case 'borrowed': return 'You borrowed';
      case 'paid': return 'Payment';
      default: return type;
    }
  };

  const getTransactionColor = (type, amount) => {
    if (type === 'paid') return 'text-green-500';
    if (type === 'lent') return 'text-blue-500';
    return 'text-orange-500';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Transaction History - {debt.personName}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {showAddForm ? 'Cancel' : 'Add Transaction'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddTransaction} className="mb-6 p-4 bg-white/5 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Type
                </label>
                <select
                  value={newTransaction.type}
                  onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
className="w-full px-3 py-2 bg-white/10 text-black border text-white/30 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="lent">You lent them money</option>
                  <option value="borrowed">You borrowed from them</option>
                  <option value="paid">Payment made</option>
                </select>
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What was this for?"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Add Transaction
            </button>
          </form>
        )}

        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-300 rounded"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No transactions found. Add a transaction to get started!</p>
            ) : (
              transactions.map((transaction) => (
                <div key={transaction._id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${getTransactionColor(transaction.type, transaction.amount)}`}>
                          {getTransactionTypeLabel(transaction.type)}
                        </span>
                        <span className="text-gray-400 text-sm">
                          {new Date(transaction.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-white mt-1">{transaction.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-lg font-bold ${getTransactionColor(transaction.type, transaction.amount)}`}>
                        ₹{Math.abs(transaction.amount).toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleDeleteTransaction(transaction._id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Delete transaction"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DebtList; 