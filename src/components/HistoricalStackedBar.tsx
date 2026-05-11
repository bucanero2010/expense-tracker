'use client';

import { Expense } from '@/lib/types';
import { CATEGORIES, getCategoryColor } from '@/lib/categories';
import { format, parseISO } from 'date-fns';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

interface HistoricalStackedBarProps {
  expenses: Expense[];
}

export function HistoricalStackedBar({ expenses }: HistoricalStackedBarProps) {
  // Group by month and category
  const monthlyData: Record<string, Record<string, number>> = {};

  expenses.forEach((e) => {
    const month = format(parseISO(e.date), 'yyyy-MM');
    if (!monthlyData[month]) monthlyData[month] = {};
    monthlyData[month][e.category] = (monthlyData[month][e.category] ?? 0) + e.amount;
  });

  const months = Object.keys(monthlyData).sort();
  const data = months.map((month) => ({
    month: format(parseISO(`${month}-01`), 'MMM yy'),
    ...monthlyData[month],
  }));

  // Only show categories that have data
  const activeCategories = new Set<string>();
  expenses.forEach((e) => activeCategories.add(e.category));

  return (
    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4">
      <h2 className="text-sm font-medium text-[var(--muted)] mb-3">Historical</h2>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="month"
              tick={{ fontSize: 9, fill: 'var(--muted)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--muted)' }}
              axisLine={false}
              tickLine={false}
              width={35}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--card-border)',
                borderRadius: '8px',
                fontSize: '11px',
              }}
              formatter={(value) => [`€${Number(value).toFixed(0)}`, '']}
            />
            {CATEGORIES.filter((c) => activeCategories.has(c.name)).map((cat) => (
              <Bar
                key={cat.name}
                dataKey={cat.name}
                stackId="a"
                fill={cat.color}
                radius={[0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
