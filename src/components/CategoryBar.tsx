'use client';

import { Expense } from '@/lib/types';
import { getCategoryColor, CATEGORIES } from '@/lib/categories';
import { formatCurrency } from '@/lib/utils';
import { startOfMonth, parseISO } from 'date-fns';

interface CategoryBarProps {
  expenses: Expense[];
  referenceDate: Date;
}

export function CategoryBar({ expenses, referenceDate }: CategoryBarProps) {
  const monthStart = startOfMonth(referenceDate);
  const mtdExpenses = expenses.filter((e) => {
    const d = parseISO(e.date);
    return d >= monthStart && d <= referenceDate;
  });

  // Group by category
  const byCategory: Record<string, number> = {};
  mtdExpenses.forEach((e) => {
    byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount;
  });

  // Sort by amount descending
  const sorted = Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a)
    .filter(([, amount]) => amount > 0);

  if (sorted.length === 0) return null;

  const maxAmount = sorted[0][1];

  return (
    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4">
      <h2 className="text-sm font-medium text-[var(--muted)] mb-3">By Category</h2>
      <div className="space-y-2.5">
        {sorted.map(([category, amount]) => (
          <div key={category} className="flex items-center gap-3">
            <div className="w-24 text-xs text-[var(--foreground)] truncate">{category}</div>
            <div className="flex-1 h-5 bg-[var(--background)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(amount / maxAmount) * 100}%`,
                  backgroundColor: getCategoryColor(category),
                }}
              />
            </div>
            <div className="w-16 text-xs text-right font-medium">
              {formatCurrency(amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
