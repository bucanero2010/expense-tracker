'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Expense } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { getCategoryColor, CATEGORIES } from '@/lib/categories';
import { format, parseISO, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { Calendar } from 'lucide-react';

export function DeepDive() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(
    format(startOfMonth(new Date()), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  async function fetchData() {
    setLoading(true);
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    setExpenses(data ?? []);
    setLoading(false);
  }

  // Quick date presets
  const presets = [
    { label: 'This Month', start: format(startOfMonth(new Date()), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') },
    { label: 'Last Month', start: format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'), end: format(endOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd') },
    { label: '3 Months', start: format(startOfMonth(subMonths(new Date(), 2)), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') },
    { label: 'YTD', start: format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') },
  ];

  // Category grid data
  const byCategory: Record<string, number> = {};
  const byCategoryCount: Record<string, number> = {};
  expenses.forEach((e) => {
    byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount;
    byCategoryCount[e.category] = (byCategoryCount[e.category] ?? 0) + 1;
  });

  const filteredExpenses = selectedCategory
    ? expenses.filter((e) => e.category === selectedCategory)
    : expenses;

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const totalTransactions = expenses.length;

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <h1 className="text-xl font-semibold">Deep Dive</h1>

      {/* Date range */}
      <div className="space-y-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => { setStartDate(p.start); setEndDate(p.end); setSelectedCategory(null); }}
              className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors ${
                startDate === p.start && endDate === p.end
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--card)] border border-[var(--card-border)] text-[var(--foreground)]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-[var(--muted)]" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-[var(--card)] border border-[var(--card-border)] rounded-lg px-2 py-1.5 text-xs focus:outline-none flex-1"
          />
          <span className="text-xs text-[var(--muted)]">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-[var(--card)] border border-[var(--card-border)] rounded-lg px-2 py-1.5 text-xs focus:outline-none flex-1"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="flex gap-3">
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-3 flex-1">
          <div className="text-xs text-[var(--muted)]">Total Spent</div>
          <div className="text-lg font-semibold">{formatCurrency(totalSpent)}</div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-3 flex-1">
          <div className="text-xs text-[var(--muted)]">Transactions</div>
          <div className="text-lg font-semibold">{totalTransactions}</div>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-[var(--muted)] py-8">Loading...</div>
      ) : (
        <>
          {/* Category grid */}
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4">
            <h2 className="text-sm font-medium text-[var(--muted)] mb-3">Categories</h2>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(byCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, amount]) => (
                  <button
                    key={cat}
                    onClick={() =>
                      setSelectedCategory(selectedCategory === cat ? null : cat)
                    }
                    className={`p-3 rounded-lg text-left transition-all ${
                      selectedCategory === cat
                        ? 'ring-2 ring-[var(--accent)] bg-[var(--accent)]/10'
                        : 'bg-[var(--background)]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: getCategoryColor(cat) }}
                      />
                      <span className="text-xs font-medium truncate">{cat}</span>
                    </div>
                    <div className="text-sm font-semibold">{formatCurrency(amount)}</div>
                    <div className="text-xs text-[var(--muted)]">
                      {byCategoryCount[cat]} txns
                    </div>
                  </button>
                ))}
            </div>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="mt-3 text-xs text-[var(--accent)] underline"
              >
                Clear filter
              </button>
            )}
          </div>

          {/* Transaction list */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-[var(--muted)]">
              {selectedCategory ? `${selectedCategory} transactions` : 'All transactions'}
              <span className="ml-2 text-xs">({filteredExpenses.length})</span>
            </h2>
            {filteredExpenses.slice(0, 100).map((expense) => (
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
                    {format(parseISO(expense.date), 'MMM d')} · {expense.category}
                    {expense.note && ` · ${expense.note}`}
                  </div>
                </div>
                <div className="text-sm font-semibold">
                  {formatCurrency(expense.amount)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
