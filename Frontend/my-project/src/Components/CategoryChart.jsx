import { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = [
  '#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444',
  '#ec4899', '#a855f7', '#3b82f6', '#84cc16', '#f97316', '#6b7280'
];

function CategoryChart({ refresh }) {
  const [data, setData] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('https://personal-finance-tracker-3-o03m.onrender.com/api/transactions');
        const transactions = res.data;

        const categoryData = transactions.reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        }, {});

        const chartData = Object.entries(categoryData).map(([category, amount]) => ({
          name: category,
          value: amount,
        }));

        setData(chartData);
        setError('');
      } catch (err) {
        setError('Failed to fetch chart data');
      }
    };
    fetchData();
  }, [refresh]);

  return (
    <div className="glass p-6 rounded-2xl card-hover">
      <h2 className="text-xl font-semibold mb-4 gradient-text">Category Breakdown</h2>
      {error && <p className="text-red-400 mb-4 bg-red-900/20 p-3 rounded-lg">{error}</p>}
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                stroke="rgba(15, 15, 35, 0.8)"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(15, 15, 35, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              color: '#ffffff'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CategoryChart;