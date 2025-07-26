import { useState } from 'react';
import axios from 'axios';
import { Button } from '@radix-ui/themes';
import { Label } from '@radix-ui/react-label';
import * as Select from '@radix-ui/react-select';
import { ChevronDownIcon } from '@radix-ui/react-icons';

const categories = [
  'Food',
  'Transportation',
  'Housing',
  'Entertainment',
  'Utilities',
  'Other',
];

function TransactionForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    amount: '',
    date: '',
    description: '',
    category: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.date || !formData.description || !formData.category) {
      setError('All fields are required');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/transactions', formData);
      console.log('Transaction added successfully:', response.data);
      setFormData({ amount: '', date: '', description: '', category: '' });
      setError('');
      setSuccess('Transaction added successfully!');
      onSubmit();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Error adding transaction:', err);
      setError('Failed to add transaction');
      setSuccess('');
    }
  };

  return (
    <div className="glass p-8 rounded-2xl card-hover">
      <h2 className="text-2xl font-bold mb-6 gradient-text">Add Transaction</h2>
      {error && <p className="text-red-400 mb-4 bg-red-900/20 p-3 rounded-lg">{error}</p>}
      {success && <p className="text-green-400 mb-4 bg-green-900/20 p-3 rounded-lg">{success}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label className="text-white font-medium mb-2 block">Amount</Label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            placeholder="Enter amount"
          />
        </div>
        
        <div>
          <Label className="text-white font-medium mb-2 block">Date</Label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
        
        <div>
          <Label className="text-white font-medium mb-2 block">Description</Label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            placeholder="Enter description"
          />
        </div>
        
        <div>
          <Label className="text-white font-medium mb-2 block">Category</Label>
          <Select.Root
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <Select.Trigger
              className="w-full p-4 bg-white/10 border border-white/20 rounded-xl flex justify-between items-center text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              aria-label="Category"
            >
              <Select.Value placeholder="Select category" className="text-gray-400" />
              <Select.Icon>
                <ChevronDownIcon className="text-gray-400" />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="glass border border-white/20 rounded-xl shadow-2xl">
                <Select.Viewport>
                  {categories.map((cat) => (
                    <Select.Item
                      key={cat}
                      value={cat}
                      className="p-4 hover:bg-white/10 cursor-pointer text-white transition-colors"
                    >
                      <Select.ItemText>{cat}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>
        
        <Button 
          type="submit"
          className="w-full p-4 text-lg font-semibold"
        >
          Add Transaction
        </Button>
      </form>
    </div>
  );
}

export default TransactionForm;