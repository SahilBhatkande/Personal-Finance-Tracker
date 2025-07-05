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

const BudgetForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    month: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category || !formData.amount || !formData.month) {
      setError('All fields are required');
      return;
    }

    try {
      await axios.post('https://personal-finance-tracker-3-o03m.onrender.com/api/budgets', formData);
      setFormData({ category: '', amount: '', month: '' });
      setError('');
      setSuccess('Budget set successfully!');
      onSubmit();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      setError('Failed to add budget');
      setSuccess('');
    }
  };

  return (
    <div className="glass p-8 rounded-2xl card-hover">
      <h2 className="text-2xl font-bold mb-6 gradient-text">Set Budget</h2>
      {error && <p className="text-red-400 mb-4 bg-red-900/20 p-3 rounded-lg">{error}</p>}
      {success && <p className="text-green-400 mb-4 bg-green-900/20 p-3 rounded-lg">{success}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
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
                  <Select.Group>
                    {categories.map((cat) => (
                      <Select.Item
                        key={cat}
                        value={cat}
                        className="p-4 text-white hover:bg-white/10 cursor-pointer transition-colors"
                      >
                        <Select.ItemText>{cat}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Group>
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>
        
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
          <Label className="text-white font-medium mb-2 block">Month</Label>
          <input
            type="month"
            value={formData.month}
            onChange={(e) => setFormData({ ...formData, month: e.target.value })}
            className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
        
        <Button 
          type="submit"
          className="w-full p-4 text-lg font-semibold"
        >
          Set Budget
        </Button>
      </form>
    </div>
  );
};

export default BudgetForm;