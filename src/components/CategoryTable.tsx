'use client';

import { Expense } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { startOfMonth, parseISO, getDate } from 'date-fns';
import { getCategoryColor } from '@/lib/categories';

interface CategoryTableProps {
  currentExpenses: Expense[];
  lastMonthExpenses: Expense[];
  referenceDate: Date;
}

interface RowData {
  category: string;
  subcategory: string;
  current: number;
  lastMonth: number;
  variation: number;
}

export function CategoryTable({
  currentExpenses,
  lastMonthExpenses,
  referenceDate,
}: CategoryTableProps) {
  const dayOfMonth = getDate(referenceDate);

  // Current MTD
  const currentMTD = currentExpenses.filter((e) => {
    const d = parseISO(e.date);
    return d >= startOfMonth(referenceDate) && d <= referenceDate;
  });

  // Last month MTD (same day range)
  const lastMonthStart = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth() - 1,
    1
  );
  const lastMonthSameDay = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth() - 1,
    dayOfMonth
  );
  const lastMTD = lastMonthExpenses.filter((e) => {
    const d = parseISO(e.date);
    return d >= lastMonthStart && d <= lastMonthSameDay;
  });

  // Build rows: category + subcategory breakdown
  const rows: RowData[] = [];
  const categoryTotals: Record<string, { current: number; lastMonth: number }> = {};

  // Group current by category+subcategory
  const currentGrouped: Record<string, Record<string, number>> = {};
  currentMTD.forEach((e) => {
    if (!currentGrouped[e.category]) currentGrouped[e.category] = {};
    currentGrouped[e.category][e.subcategory] =
      (currentGrouped[e.category][e.subcategory] ?? 0) + e.amount;
  });

  // Group last month by category+subcategory
  const lastGrouped: Record<string, Record<string, number>> = {};
  lastMTD.forEach((e) => {
    if (!lastGrouped[e.category]) lastGrouped[e.category] = {};
    lastGrouped[e.category][e.subcategory] =
      (lastGrouped[e.category][e.subcategory] ?? 0) + e.amount;
  });

  // Merge all categories
  const allCategories = new Set([
    ...Object.keys(currentGrouped),
    ...Object.keys(lastGrouped),
  ]);

  const sortedCategories = Array.from(allCategories).sort((a, b) => {
    const aTotal =
      Object.values(currentGrouped[a] ?? {}).reduce((s, v) => s + v, 0);
    const bTotal =
      Object.values(currentGrouped[b] ?? {}).reduce((s, v) => s + v, 0);
    return bTotal - aTotal;
  });

  sortedCategories.forEach((cat) => {
    const currentSubs = currentGrouped[cat] ?? {};
    const lastSubs = lastGrouped[cat] ?? {};
    const allSubs = new Set([...Object.keys(currentSubs), ...Object.keys(lastSubs)]);

    let catCurrent = 0;
    let catLast = 0;

    allSubs.forEach((sub) => {
      const curr = currentSubs[sub] ?? 0;
      const last = lastSubs[sub] ?? 0;
      catCurrent += curr;
      catLast += last;

      if (curr !== 0 || last !== 0) {
        rows.push({
          category: cat,
          subcategory: sub,
          current: curr,
          lastMonth: last,
          variation: curr - last,
        });
      }
    });

    categoryTotals[cat] = { current: catCurrent, lastMonth: catLast };
  });

  return (
    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4 overflow-x-auto">
      <h2 className="text-sm font-medium text-[var(--muted)] mb-3">
        Category Breakdown (MTD vs Last Month MTD)
      </h2>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-[var(--muted)] border-b border-[var(--card-border)]">
            <th className="text-left py-2 pr-2">Category</th>
            <th className="text-left py-2 pr-2">Subcategory</th>
            <th className="text-right py-2 pr-2">Current</th>
            <th className="text-right py-2 pr-2">Last Mo.</th>
            <th className="text-right py-2">Δ</th>
          </tr>
        </thead>
        <tbody>
          {sortedCategories.map((cat) => {
            const catRows = rows.filter((r) => r.category === cat);
            const totals = categoryTotals[cat];
            return (
              <CategorySection
                key={cat}
                category={cat}
                rows={catRows}
                totals={totals}
              />
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-[var(--card-border)] font-semibold">
            <td className="py-2" colSpan={2}>
              Grand Total
            </td>
            <td className="text-right py-2 pr-2">
              {formatCurrency(
                Object.values(categoryTotals).reduce((s, t) => s + t.current, 0)
              )}
            </td>
            <td className="text-right py-2 pr-2">
              {formatCurrency(
                Object.values(categoryTotals).reduce((s, t) => s + t.lastMonth, 0)
              )}
            </td>
            <td className="text-right py-2">
              <VariationCell
                value={
                  Object.values(categoryTotals).reduce((s, t) => s + t.current, 0) -
                  Object.values(categoryTotals).reduce((s, t) => s + t.lastMonth, 0)
                }
              />
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function CategorySection({
  category,
  rows,
  totals,
}: {
  category: string;
  rows: RowData[];
  totals: { current: number; lastMonth: number };
}) {
  return (
    <>
      {rows.map((row, i) => (
        <tr key={`${row.category}-${row.subcategory}`} className="border-b border-[var(--card-border)]/30">
          {i === 0 && (
            <td
              rowSpan={rows.length + 1}
              className="py-1.5 pr-2 align-top font-medium"
              style={{ color: getCategoryColor(category) }}
            >
              {category}
            </td>
          )}
          <td className="py-1.5 pr-2">{row.subcategory}</td>
          <td className="text-right py-1.5 pr-2">{formatCurrency(row.current)}</td>
          <td className="text-right py-1.5 pr-2">{formatCurrency(row.lastMonth)}</td>
          <td className="text-right py-1.5">
            <VariationCell value={row.variation} />
          </td>
        </tr>
      ))}
      {/* Category total row */}
      <tr className="border-b border-[var(--card-border)]">
        <td className="py-1.5 pr-2 font-medium text-[var(--muted)]">Total</td>
        <td className="text-right py-1.5 pr-2 font-medium">
          {formatCurrency(totals.current)}
        </td>
        <td className="text-right py-1.5 pr-2 font-medium">
          {formatCurrency(totals.lastMonth)}
        </td>
        <td className="text-right py-1.5 font-medium">
          <VariationCell value={totals.current - totals.lastMonth} />
        </td>
      </tr>
    </>
  );
}

function VariationCell({ value }: { value: number }) {
  if (Math.abs(value) < 0.01) return <span className="text-[var(--muted)]">—</span>;
  const color = value > 0 ? 'text-[var(--accent-red)]' : 'text-[var(--accent-green)]';
  return <span className={color}>{formatCurrency(value)}</span>;
}
