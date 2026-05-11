'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Expense } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { getCategoryColor } from '@/lib/categories';
import { format, parseISO, subMonths } from 'date-fns';
import { Trash2 } from 'lucide-react';

export function TransactionList() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'month'>('month');

  useEffect(() => {
    fetchExpenses();
  }, [filter]);

  async function fetchExpenses() {
    setLoading(true);
    let query = supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (filter === 'month') {
      const monthStart = format(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        'yyyy-MM-dd'
      );
      query = query.gte('date', monthStart);
    } else {
      // Last 3 months
      const start = format(subMonths(new Date(), 3), 'yyyy-MM-dd');
      query = query.gte('date', start);
    }

    const { data } = await query.limit(200);
    setExpenses(data ?? []);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this expense?')) return;
    await supabase.from('expenses').delete().eq('id', id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }

  // Group by date
  const grouped: Record<string, Expense[]> = {};
  expenses.forEach((e) => {
    if (!grouped[e.date]) grouped[e.date] = [];
    grouped[e.date].push(e);
  });

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Transactions</h1>
        <div className="flex gap-1 bg-[var(--card)] border border-[var(--card-border)] rounded-lg p-0.5">
          <button
            onClick={() => setFilter('month')}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
              filter === 'month'
                ? 'bg-[var(--accent)] text-white'
                : 'text-[var(--muted)]'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-[var(--accent)] text-white'
                : 'text-[var(--muted)]'
            }`}
          >
            3 Months
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-[var(--muted)] py-8">Loading...</div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([date, items]) => {
            const dayTotal = items.reduce((sum, e) => sum + e.amount, 0);
            return (
              <div key={date}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[var(--muted)]">
                    {format(parseISO(date), 'EEE, MMM d')}
                  </span>
                  <span className="text-xs font-medium text-[var(--muted)]">
                    {formatCurrency(dayTotal)}
                  </span>
                </div>
                <div className="space-y-1">
                  {items.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center gap-3 bg-[var(--card)] border border-[var(--card-border)] rounded-lg px-3 py-2.5"
                    >
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getCategoryColor(expense.category) }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {expense.subcategory}
                        </div>
                        <div className="text-xs text-[var(--muted)]">
                          {expense.category}
                          {expense.note && ` · ${expense.note}`}
                        </div>
                      </div>
                      <div className="text-sm font-semibold">
                        {formatCurrency(expense.amount)}
                      </div>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="text-[var(--muted)] hover:text-[var(--accent-red)] transition-colors p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
