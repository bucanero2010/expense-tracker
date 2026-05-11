'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Expense } from '@/lib/types';
import { calculateMTDKPIs, calculateMaxCategoryDelta, formatCurrency } from '@/lib/utils';
import { KPICards } from './KPICards';
import { CategoryBar } from './CategoryBar';
import { DailyLineChart } from './DailyLineChart';
import { HistoricalStackedBar } from './HistoricalStackedBar';
import { CategoryTable } from './CategoryTable';
import { startOfMonth, subMonths, endOfMonth, format, getDate } from 'date-fns';

export function Dashboard() {
  const [currentMonthExpenses, setCurrentMonthExpenses] = useState<Expense[]>([]);
  const [lastMonthExpenses, setLastMonthExpenses] = useState<Expense[]>([]);
  const [historicalExpenses, setHistoricalExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const now = new Date();
    const currentMonthStart = format(startOfMonth(now), 'yyyy-MM-dd');
    const lastMonth = subMonths(now, 1);
    const lastMonthStart = format(startOfMonth(lastMonth), 'yyyy-MM-dd');
    const lastMonthEnd = format(endOfMonth(lastMonth), 'yyyy-MM-dd');

    // Historical: last 12 months
    const historicalStart = format(startOfMonth(subMonths(now, 11)), 'yyyy-MM-dd');

    const [currentRes, lastRes, historicalRes] = await Promise.all([
      supabase
        .from('expenses')
        .select('*')
        .gte('date', currentMonthStart)
        .order('date', { ascending: true }),
      supabase
        .from('expenses')
        .select('*')
        .gte('date', lastMonthStart)
        .lte('date', lastMonthEnd)
        .order('date', { ascending: true }),
      supabase
        .from('expenses')
        .select('*')
        .gte('date', historicalStart)
        .order('date', { ascending: true }),
    ]);

    setCurrentMonthExpenses(currentRes.data ?? []);
    setLastMonthExpenses(lastRes.data ?? []);
    setHistoricalExpenses(historicalRes.data ?? []);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-[var(--muted)]">Loading...</div>
      </div>
    );
  }

  const now = new Date();
  const dayOfMonth = getDate(now);
  const currentKPIs = calculateMTDKPIs(currentMonthExpenses, now);

  // Last month MTD comparison (same day range)
  const lastMonth = subMonths(now, 1);
  const lastMonthSameDay = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), dayOfMonth);
  const lastMonthKPIs = calculateMTDKPIs(lastMonthExpenses, lastMonthSameDay);

  const maxCategoryDelta = calculateMaxCategoryDelta(
    currentMonthExpenses,
    lastMonthExpenses,
    now
  );

  return (
    <div className="p-4 max-w-lg mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          {format(now, 'MMMM yyyy')}
        </h1>
        <span className="text-sm text-[var(--muted)]">MTD (Day {dayOfMonth})</span>
      </header>

      <KPICards
        current={currentKPIs}
        previous={lastMonthKPIs}
        maxCategoryDelta={maxCategoryDelta}
      />

      <CategoryBar expenses={currentMonthExpenses} referenceDate={now} />

      <DailyLineChart expenses={currentMonthExpenses} referenceDate={now} />

      <HistoricalStackedBar expenses={historicalExpenses} />

      <CategoryTable
        currentExpenses={currentMonthExpenses}
        lastMonthExpenses={lastMonthExpenses}
        referenceDate={now}
      />
    </div>
  );
}
