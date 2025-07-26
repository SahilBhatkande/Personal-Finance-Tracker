import React,{useState , useEffect} from 'react'
import axios from 'axios'
import {BarChart , Bar , XAxis, YAxis, Tooltip, ResponsiveContainer} from 'recharts'

const MonthlyChart = ({refresh}) => {

    const [data , setData] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
           try {

            const res = await axios.get('http://localhost:5000/api/transactions')
            const transactions = res.data;

            const monthlyData = transactions.reduce((acc , t) => {
                const month = new Date(t.date).toLocaleString('default', { month: 'long', year: 'numeric' });
          acc[month] = (acc[month] || 0) + t.amount;
          return acc;

            }, {});

            const chartData = Object.entries(monthlyData).map(([month, amount]) => ({
                month,
                amount
            }))

            setData(chartData);
            setError('');

           } catch (error) {
            setError('Failed to fetch chart data');
           }
        }
        fetchData()
    },[refresh])

  return (
    <div className="glass p-6 rounded-2xl card-hover">
      <h2 className="text-xl font-semibold mb-4 gradient-text">Monthly Expenses</h2>
      {error && <p className="text-red-400 mb-4 bg-red-900/20 p-3 rounded-lg">{error}</p>}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis 
            dataKey="month" 
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
          <Bar 
            dataKey="amount" 
            fill="url(#gradient)"
            radius={[4, 4, 0, 0]}
          />
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default MonthlyChart