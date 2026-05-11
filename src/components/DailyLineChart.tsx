'use client';

import { Expense } from '@/lib/types';
import { startOfMonth, eachDayOfInterval, format, parseISO, getDate } from 'date-fns';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface DailyLineChartProps {
  expenses: Expense[];
  referenceDate: Date;
}

export function DailyLineChart({ expenses, referenceDate }: DailyLineChartProps) {
  const monthStart = startOfMonth(referenceDate);
  const days = eachDayOfInterval({ start: monthStart, end: referenceDate });

  let cumulative = 0;
  const data = days.map((day) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayExpenses = expenses.filter((e) => e.date === dayStr);
    const dayTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
    cumulative += dayTotal;
    return {
      day: getDate(day),
      daily: Math.round(dayTotal * 100) / 100,
      cumulative: Math.round(cumulative * 100) / 100,
    };
  });

  return (
    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4">
      <h2 className="text-sm font-medium text-[var(--muted)] mb-3">Cumulative Spend</h2>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: 'var(--muted)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--muted)' }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--card-border)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelFormatter={(label) => `Day ${label}`}
              formatter={(value) => [`€${Number(value).toFixed(2)}`, 'Cumulative']}
            />
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke="var(--accent)"
              strokeWidth={2}
              fill="url(#colorCumulative)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
