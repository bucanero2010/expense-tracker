'use client';

import { useState } from 'react';
import { Expense } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { startOfMonth, parseISO, getDate } from 'date-fns';
import { getCategoryColor } from '@/lib/categories';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface CategoryTableProps {
  currentExpenses: Expense[];
  lastMonthExpenses: Expense[];
  referenceDate: Date;
}

interface SubRow {
  subcategory: string;
  current: number;
  lastMonth: number;
  variation: number;
}

interface CategoryRow {
  category: string;
  current: number;
  lastMonth: number;
  variation: number;
  subs: SubRow[];
}

export function CategoryTable({
  currentExpenses,
  lastMonthExpenses,
  referenceDate,
}: CategoryTableProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
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

  // Build category rows
  const allCategories = new Set([
    ...Object.keys(currentGrouped),
    ...Object.keys(lastGrouped),
  ]);

  const rows: CategoryRow[] = Array.from(allCategories)
    .map((cat) => {
      const currentSubs = currentGrouped[cat] ?? {};
      const lastSubs = lastGrouped[cat] ?? {};
      const allSubs = new Set([...Object.keys(currentSubs), ...Object.keys(lastSubs)]);

      let catCurrent = 0;
      let catLast = 0;
      const subs: SubRow[] = [];

      allSubs.forEach((sub) => {
        const curr = currentSubs[sub] ?? 0;
        const last = lastSubs[sub] ?? 0;
        catCurrent += curr;
        catLast += last;
        if (curr !== 0 || last !== 0) {
          subs.push({ subcategory: sub, current: curr, lastMonth: last, variation: curr - last });
        }
      });

      subs.sort((a, b) => b.current - a.current);

      return {
        category: cat,
        current: catCurrent,
        lastMonth: catLast,
        variation: catCurrent - catLast,
        subs,
      };
    })
    .sort((a, b) => b.current - a.current);

  const grandCurrent = rows.reduce((s, r) => s + r.current, 0);
  const grandLast = rows.reduce((s, r) => s + r.lastMonth, 0);

  function toggleCategory(cat: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  return (
    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4 overflow-x-auto">
      <h2 className="text-sm font-medium text-[var(--muted)] mb-3">
        Category Breakdown (MTD vs Last Month MTD)
      </h2>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-[var(--muted)] border-b border-[var(--card-border)]">
            <th className="text-left py-2 pr-2">Category</th>
            <th className="text-right py-2 pr-2">Current</th>
            <th className="text-right py-2 pr-2">Last Mo.</th>
            <th className="text-right py-2">Δ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isExpanded = expanded.has(row.category);
            return (
              <CategorySection
                key={row.category}
                row={row}
                isExpanded={isExpanded}
                onToggle={() => toggleCategory(row.category)}
              />
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-[var(--card-border)] font-semibold">
            <td className="py-2">Grand Total</td>
            <td className="text-right py-2 pr-2">{formatCurrency(grandCurrent)}</td>
            <td className="text-right py-2 pr-2">{formatCurrency(grandLast)}</td>
            <td className="text-right py-2">
              <VariationCell value={grandCurrent - grandLast} />
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function CategorySection({
  row,
  isExpanded,
  onToggle,
}: {
  row: CategoryRow;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        className="border-b border-[var(--card-border)] cursor-pointer active:bg-white/5"
        onClick={onToggle}
      >
        <td className="py-2 pr-2">
          <div className="flex items-center gap-1.5">
            {isExpanded ? (
              <ChevronDown size={12} className="text-[var(--muted)]" />
            ) : (
              <ChevronRight size={12} className="text-[var(--muted)]" />
            )}
            <span
              className="font-medium"
              style={{ color: getCategoryColor(row.category) }}
            >
              {row.category}
            </span>
          </div>
        </td>
        <td className="text-right py-2 pr-2 font-medium">
          {formatCurrency(row.current)}
        </td>
        <td className="text-right py-2 pr-2 font-medium">
          {formatCurrency(row.lastMonth)}
        </td>
        <td className="text-right py-2 font-medium">
          <VariationCell value={row.variation} />
        </td>
      </tr>
      {isExpanded &&
        row.subs.map((sub) => (
          <tr
            key={`${row.category}-${sub.subcategory}`}
            className="border-b border-[var(--card-border)]/30"
          >
            <td className="py-1.5 pr-2 pl-6 text-[var(--muted)]">
              {sub.subcategory}
            </td>
            <td className="text-right py-1.5 pr-2">{formatCurrency(sub.current)}</td>
            <td className="text-right py-1.5 pr-2">{formatCurrency(sub.lastMonth)}</td>
            <td className="text-right py-1.5">
              <VariationCell value={sub.variation} />
            </td>
          </tr>
        ))}
    </>
  );
}

function VariationCell({ value }: { value: number }) {
  if (Math.abs(value) < 0.01) return <span className="text-[var(--muted)]">—</span>;
  const color = value > 0 ? 'text-[var(--accent-red)]' : 'text-[var(--accent-green)]';
  return <span className={color}>{formatCurrency(value)}</span>;
}
