import { useState } from 'react';
import Dashboard from './Components/Dashboard';
import TransactionForm from './Components/TransactionForm';
import TransactionList from './Components/TransactionList';
import MonthlyChart from './Components/MonthlyChart';
import CategoryChart from './Components/CategoryChart';
import BudgetForm from './Components/BudgetForm';
import BudgetChart from './Components/BudgetChart';
import DebtList from './Components/DebtList';

function App() {
  const [refresh, setRefresh] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] p-6">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold mb-8 text-center gradient-text">
          Personal Finance Visualizer
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="space-y-6">
            <TransactionForm onSubmit={() => setRefresh(!refresh)} />
            <BudgetForm onSubmit={() => setRefresh(!refresh)} />
          </div>
          <Dashboard refresh={refresh} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MonthlyChart refresh={refresh} />
          <CategoryChart refresh={refresh} />
          <BudgetChart refresh={refresh} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <TransactionList refresh={refresh} onUpdate={() => setRefresh(!refresh)} />
          <DebtList refresh={refresh} onUpdate={() => setRefresh(!refresh)} />
        </div>
      </div>
    </div>
  );
}

export default App;