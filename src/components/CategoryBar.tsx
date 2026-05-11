'use client';

import { Expense } from '@/lib/types';
import { getCategoryColor } from '@/lib/categories';
import { formatCurrency } from '@/lib/utils';
import { startOfMonth, parseISO } from 'date-fns';
import { Metric } from './Dashboard';

interface CategoryBarProps {
  expenses: Expense[];
  referenceDate: Date;
  metric: Metric;
}

export function CategoryBar({ expenses, referenceDate, metric }: CategoryBarProps) {
  const monthStart = startOfMonth(referenceDate);
  const mtdExpenses = expenses.filter((e) => {
    const d = parseISO(e.date);
    return d >= monthStart && d <= referenceDate;
  });

  // Group by category
  const byCategory: Record<string, { amount: number; count: number }> = {};
  mtdExpenses.forEach((e) => {
    if (!byCategory[e.category]) byCategory[e.category] = { amount: 0, count: 0 };
    byCategory[e.category].amount += e.amount;
    byCategory[e.category].count += 1;
  });

  // Sort by selected metric descending
  const sorted = Object.entries(byCategory)
    .map(([cat, data]) => ({
      category: cat,
      value: metric === 'spent' ? data.amount : data.count,
    }))
    .sort((a, b) => b.value - a.value)
    .filter(({ value }) => value > 0);

  if (sorted.length === 0) return null;

  const maxValue = sorted[0].value;

  return (
    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4">
      <h2 className="text-sm font-medium text-[var(--muted)] mb-3">
        By Category ({metric === 'spent' ? '€' : 'txns'})
      </h2>
      <div className="space-y-2.5">
        {sorted.map(({ category, value }) => (
          <div key={category} className="flex items-center gap-3">
            <div className="w-24 text-xs text-[var(--foreground)] truncate">{category}</div>
            <div className="flex-1 h-5 bg-[var(--background)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(value / maxValue) * 100}%`,
                  backgroundColor: getCategoryColor(category),
                }}
              />
            </div>
            <div className="w-16 text-xs text-right font-medium">
              {metric === 'spent' ? formatCurrency(value) : value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
