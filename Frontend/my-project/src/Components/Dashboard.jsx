import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '@radix-ui/themes';

function Dashboard({ refresh }) {
  const [summary, setSummary] = useState({
    totalExpenses: 0,
    categoryBreakdown: {},
    recentTransactions: [],
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/transactions');
        const transactions = res.data;

        const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);
        const categoryBreakdown = transactions.reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        }, {});
        const recentTransactions = transactions.slice(0, 5);

        setSummary({ totalExpenses, categoryBreakdown, recentTransactions });
        setError('');
      } catch (err) {
        setError('Failed to fetch summary');
      }
    };
    fetchSummary();
  }, [refresh]);

  return (
    <div className="glass p-8 rounded-2xl card-hover">
      <h2 className="text-2xl font-bold mb-6 gradient-text">Dashboard Overview</h2>
      {error && <p className="text-red-400 mb-4 bg-red-900/20 p-3 rounded-lg">{error}</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-xl card-hover">
          <h3 className="font-semibold text-lg mb-3 text-white">Total Expenses</h3>
          <p className="text-3xl font-bold success-gradient text-white">
            ${summary.totalExpenses.toFixed(2)}
          </p>
        </div>
        
        <div className="glass p-6 rounded-xl card-hover">
          <h3 className="font-semibold text-lg mb-3 text-white">Category Breakdown</h3>
          <ul className="space-y-2">
            {Object.entries(summary.categoryBreakdown).map(([cat, amount]) => (
              <li key={cat} className="flex justify-between items-center text-sm">
                <span className="text-gray-300">{cat}</span>
                <span className="font-semibold text-green-400">${amount.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="glass p-6 rounded-xl card-hover md:col-span-2">
          <h3 className="font-semibold text-lg mb-3 text-white">Recent Transactions</h3>
          <ul className="space-y-2">
            {summary.recentTransactions.map((t) => (
              <li key={t._id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <div>
                  <span className="text-white font-medium">{t.description}</span>
                  <span className="text-gray-400 text-sm ml-2">
                    {new Date(t.date).toLocaleDateString()}
                  </span>
                </div>
                <span className="font-semibold text-red-400">-${t.amount.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;