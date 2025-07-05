import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function BudgetChart({ refresh }) {
  const [data, setData] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transactionsRes, budgetsRes] = await Promise.all([
          axios.get('https://personal-finance-tracker-3-o03m.onrender.com/api/transactions'),
          axios.get('https://personal-finance-tracker-3-o03m.onrender.com/api/budgets'),
        ]);

        const transactions = transactionsRes.data;
        const budgets = budgetsRes.data;

        const currentMonth = new Date().toISOString().slice(0, 7);
        const monthlyBudgets = budgets.filter((b) => b.month === currentMonth);
        const monthlyTransactions = transactions.filter(
          (t) => new Date(t.date).toISOString().slice(0, 7) === currentMonth
        );

        const budgetData = monthlyBudgets.map((budget) => {
          const spent = monthlyTransactions
            .filter((t) => t.category === budget.category)
            .reduce((sum, t) => sum + t.amount, 0);
          return {
            category: budget.category,
            budget: budget.amount,
            spent,
            overspent: spent > budget.amount ? spent - budget.amount : 0,
          };
        });

        setData(budgetData);
        setError('');
      } catch (err) {
        setError('Failed to fetch budget data');
      }
    };
    fetchData();
  }, [refresh]);

  return (
    <div className="glass p-6 rounded-2xl card-hover">
      <h2 className="text-xl font-semibold mb-4 gradient-text">Budget vs Actual</h2>
      {error && <p className="text-red-400 mb-4 bg-red-900/20 p-3 rounded-lg">{error}</p>}
      {data.length === 0 && !error && (
        <p className="text-gray-400 mb-4">No budget data available for this month.</p>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis 
            dataKey="category" 
            tick={{ fill: '#ffffff' }}
            axisLine={{ stroke: '#ffffff40' }}
            tickLine={{ stroke: '#ffffff40' }}
          />
          <YAxis 
            tick={{ fill: '#ffffff' }}
            axisLine={{ stroke: '#ffffff40' }}
            tickLine={{ stroke: '#ffffff40' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 15, 35, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              color: '#ffffff'
            }}
          />
          <Legend 
            wrapperStyle={{ color: '#ffffff' }}
            iconType="circle"
          />
          <Bar 
            dataKey="budget" 
            fill="url(#budgetGradient)" 
            radius={[4, 4, 0, 0]}
            name="Budget" 
          />
          <Bar 
            dataKey="spent" 
            fill="url(#spentGradient)" 
            radius={[4, 4, 0, 0]}
            name="Actual" 
          />
          <Bar 
            dataKey="overspent" 
            fill="url(#overspentGradient)" 
            radius={[4, 4, 0, 0]}
            name="Overspent" 
          />
          <defs>
            <linearGradient id="budgetGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="spentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="overspentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
      {data.some((d) => d.overspent > 0) && (
        <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 font-medium">
            ⚠️ Warning: Overspending detected in some categories!
          </p>
        </div>
      )}
    </div>
  );
}

export default BudgetChart;