import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@radix-ui/themes';

function TransactionList({ refresh, onUpdate }) {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/transactions');
        setTransactions(res.data);
        setError('');
      } catch (err) {
        setError('Failed to fetch transactions');
      }
    };
    fetchTransactions();
  }, [refresh]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/transactions/${id}`);
      onUpdate();
    } catch (err) {
      setError('Failed to delete transaction');
    }
  };

  return (
    <div className="glass p-8 rounded-2xl card-hover">
      <h2 className="text-2xl font-bold mb-6 gradient-text">Transaction History</h2>
      {error && <p className="text-red-400 mb-4 bg-red-900/20 p-3 rounded-lg">{error}</p>}
      
      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No transactions found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-left text-white font-semibold">Date</th>
                <th className="p-4 text-left text-white font-semibold">Description</th>
                <th className="p-4 text-left text-white font-semibold">Category</th>
                <th className="p-4 text-left text-white font-semibold">Amount</th>
                <th className="p-4 text-left text-white font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, index) => (
                <tr 
                  key={t._id} 
                  className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                    index % 2 === 0 ? 'bg-white/5' : ''
                  }`}
                >
                  <td className="p-4 text-gray-300">
                    {new Date(t.date).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-white font-medium">{t.description}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm">
                      {t.category}
                    </span>
                  </td>
                  <td className="p-4 text-red-400 font-semibold">
                    -${t.amount.toFixed(2)}
                  </td>
                  <td className="p-4">
                    <Button
                      variant="outline"
                      onClick={() => handleDelete(t._id)}
                      className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/40 hover:text-red-300 transition-all"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TransactionList;