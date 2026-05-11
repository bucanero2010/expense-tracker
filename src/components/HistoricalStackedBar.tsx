'use client';

import { useState } from 'react';
import { Expense } from '@/lib/types';
import { CATEGORIES, getCategoryColor } from '@/lib/categories';
import { format, parseISO, startOfWeek, getISOWeek, getYear } from 'date-fns';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

type Granularity = 'week' | 'month' | 'quarter' | 'year';

interface HistoricalStackedBarProps {
  expenses: Expense[];
}

export function HistoricalStackedBar({ expenses }: HistoricalStackedBarProps) {
  const [granularity, setGranularity] = useState<Granularity>('month');

  const granularities: { value: Granularity; label: string }[] = [
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'quarter', label: 'Quarter' },
    { value: 'year', label: 'Year' },
  ];

  // Group by period and category
  const periodData: Record<string, Record<string, number>> = {};

  expenses.forEach((e) => {
    const date = parseISO(e.date);
    const periodKey = getPeriodKey(date, granularity);
    if (!periodData[periodKey]) periodData[periodKey] = {};
    periodData[periodKey][e.category] =
      (periodData[periodKey][e.category] ?? 0) + e.amount;
  });

  const periods = Object.keys(periodData).sort();
  const data = periods.map((period) => ({
    period: formatPeriodLabel(period, granularity),
    ...periodData[period],
  }));

  // Only show categories that have data
  const activeCategories = new Set<string>();
  expenses.forEach((e) => activeCategories.add(e.category));

  return (
    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-[var(--muted)]">Historical</h2>
        <div className="flex gap-1 bg-[var(--background)] rounded-lg p-0.5">
          {granularities.map((g) => (
            <button
              key={g.value}
              onClick={() => setGranularity(g.value)}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                granularity === g.value
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--muted)]'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="period"
              tick={{ fontSize: 9, fill: 'var(--muted)' }}
              axisLine={false}
              tickLine={false}
              interval={granularity === 'week' ? 3 : 0}
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
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function getPeriodKey(date: Date, granularity: Granularity): string {
  switch (granularity) {
    case 'week': {
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      return format(weekStart, 'yyyy-MM-dd');
    }
    case 'month':
      return format(date, 'yyyy-MM');
    case 'quarter': {
      const q = Math.ceil((date.getMonth() + 1) / 3);
      return `${getYear(date)}-Q${q}`;
    }
    case 'year':
      return format(date, 'yyyy');
  }
}

function formatPeriodLabel(key: string, granularity: Granularity): string {
  switch (granularity) {
    case 'week': {
      const date = parseISO(key);
      return `W${getISOWeek(date)}`;
    }
    case 'month':
      return format(parseISO(`${key}-01`), 'MMM yy');
    case 'quarter':
      return key.replace(/^\d{4}-/, '');
    case 'year':
      return key;
  }
}
