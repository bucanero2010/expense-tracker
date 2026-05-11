import { Expense, MonthlyKPIs } from './types';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, parseISO, getDate } from 'date-fns';

export function calculateMTDKPIs(
  expenses: Expense[],
  referenceDate: Date
): MonthlyKPIs {
  const today = getDate(referenceDate);
  const monthStart = startOfMonth(referenceDate);

  // Filter to MTD (day 1 through current day of month)
  const mtdExpenses = expenses.filter((e) => {
    const d = parseISO(e.date);
    return d >= monthStart && d <= referenceDate;
  });

  const totalSpent = mtdExpenses.reduce((sum, e) => sum + e.amount, 0);
  const transactionCount = mtdExpenses.length;

  // Median ticket
  const amounts = mtdExpenses.map((e) => e.amount).sort((a, b) => a - b);
  const medianTicket =
    amounts.length === 0
      ? 0
      : amounts.length % 2 === 0
        ? (amounts[amounts.length / 2 - 1] + amounts[amounts.length / 2]) / 2
        : amounts[Math.floor(amounts.length / 2)];

  // No-spend days
  const daysInRange = eachDayOfInterval({ start: monthStart, end: referenceDate });
  const daysWithExpenses = new Set(mtdExpenses.map((e) => e.date));
  const noSpendDays = daysInRange.filter(
    (d) => !daysWithExpenses.has(format(d, 'yyyy-MM-dd'))
  ).length;

  // Max category delta — placeholder, needs comparison data
  const maxCategoryDelta = { category: '-', delta: 0 };

  return { totalSpent, transactionCount, medianTicket, noSpendDays, maxCategoryDelta };
}

export function calculateMaxCategoryDelta(
  currentExpenses: Expense[],
  lastMonthExpenses: Expense[],
  currentDate: Date
): { category: string; delta: number } {
  const dayOfMonth = getDate(currentDate);

  const currentByCategory = groupByCategory(currentExpenses, currentDate);
  const lastMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, dayOfMonth);
  const lastByCategory = groupByCategory(lastMonthExpenses, lastMonthDate);

  const allCategories = new Set([
    ...Object.keys(currentByCategory),
    ...Object.keys(lastByCategory),
  ]);

  let maxDelta = 0;
  let maxCategory = '-';

  allCategories.forEach((cat) => {
    const current = currentByCategory[cat] ?? 0;
    const last = lastByCategory[cat] ?? 0;
    const delta = current - last;
    if (Math.abs(delta) > Math.abs(maxDelta)) {
      maxDelta = delta;
      maxCategory = cat;
    }
  });

  return { category: maxCategory, delta: maxDelta };
}

function groupByCategory(expenses: Expense[], upToDate: Date): Record<string, number> {
  const monthStart = startOfMonth(upToDate);
  const filtered = expenses.filter((e) => {
    const d = parseISO(e.date);
    return d >= monthStart && d <= upToDate;
  });

  const result: Record<string, number> = {};
  filtered.forEach((e) => {
    result[e.category] = (result[e.category] ?? 0) + e.amount;
  });
  return result;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCompact(amount: number): string {
  if (Math.abs(amount) >= 1000) {
    return `${(amount / 1000).toFixed(1)}k`;
  }
  return amount.toFixed(1);
}
