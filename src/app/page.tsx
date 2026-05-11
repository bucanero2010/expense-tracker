'use client';

import { useState } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { AddExpense } from '@/components/AddExpense';
import { TransactionList } from '@/components/TransactionList';
import { BarChart3, PlusCircle, List } from 'lucide-react';

type Tab = 'dashboard' | 'add' | 'transactions';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleExpenseAdded = () => {
    setRefreshKey((k) => k + 1);
    setActiveTab('dashboard');
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {activeTab === 'dashboard' && <Dashboard key={refreshKey} />}
        {activeTab === 'add' && <AddExpense onSuccess={handleExpenseAdded} />}
        {activeTab === 'transactions' && <TransactionList key={refreshKey} />}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[var(--card)] border-t border-[var(--card-border)] flex justify-around items-center h-16 safe-bottom z-50">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 px-4 py-2 ${
            activeTab === 'dashboard' ? 'text-[var(--accent)]' : 'text-[var(--muted)]'
          }`}
        >
          <BarChart3 size={22} />
          <span className="text-xs">Dashboard</span>
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`flex flex-col items-center gap-1 px-4 py-2 ${
            activeTab === 'add' ? 'text-[var(--accent)]' : 'text-[var(--muted)]'
          }`}
        >
          <PlusCircle size={22} />
          <span className="text-xs">Add</span>
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center gap-1 px-4 py-2 ${
            activeTab === 'transactions' ? 'text-[var(--accent)]' : 'text-[var(--muted)]'
          }`}
        >
          <List size={22} />
          <span className="text-xs">History</span>
        </button>
      </nav>
    </div>
  );
}
