'use client';

import { MonthlyKPIs } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardsProps {
  current: MonthlyKPIs;
  previous: MonthlyKPIs;
  maxCategoryDelta: { category: string; delta: number };
}

export function KPICards({ current, previous, maxCategoryDelta }: KPICardsProps) {
  const kpis = [
    {
      label: 'Spent',
      value: formatCurrency(current.totalSpent),
      delta: current.totalSpent - previous.totalSpent,
      formatDelta: (d: number) => formatCurrency(d),
    },
    {
      label: 'Transactions',
      value: current.transactionCount.toString(),
      delta: current.transactionCount - previous.transactionCount,
      formatDelta: (d: number) => (d > 0 ? `+${d}` : `${d}`),
    },
    {
      label: 'Median',
      value: formatCurrency(current.medianTicket),
      delta: current.medianTicket - previous.medianTicket,
      formatDelta: (d: number) => formatCurrency(d),
    },
    {
      label: 'No-Spend Days',
      value: current.noSpendDays.toString(),
      delta: current.noSpendDays - previous.noSpendDays,
      formatDelta: (d: number) => (d > 0 ? `+${d}` : `${d}`),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-3"
          >
            <div className="text-xs text-[var(--muted)] mb-1">{kpi.label}</div>
            <div className="text-lg font-semibold">{kpi.value}</div>
            <DeltaIndicator delta={kpi.delta} format={kpi.formatDelta} />
          </div>
        ))}
      </div>

      {/* Max category delta */}
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-3 flex items-center justify-between">
        <div>
          <div className="text-xs text-[var(--muted)]">Max Category Delta</div>
          <div className="text-sm font-medium mt-0.5">{maxCategoryDelta.category}</div>
        </div>
        <DeltaIndicator
          delta={maxCategoryDelta.delta}
          format={(d) => formatCurrency(d)}
        />
      </div>
    </div>
  );
}

function DeltaIndicator({
  delta,
  format: formatFn,
}: {
  delta: number;
  format: (d: number) => string;
}) {
  if (Math.abs(delta) < 0.01) {
    return (
      <div className="flex items-center gap-1 text-xs text-[var(--muted)]">
        <Minus size={12} />
        <span>—</span>
      </div>
    );
  }

  // For expenses, spending more is "up" (red), spending less is "down" (green)
  const isIncrease = delta > 0;
  const color = isIncrease ? 'text-[var(--accent-red)]' : 'text-[var(--accent-green)]';
  const Icon = isIncrease ? TrendingUp : TrendingDown;

  return (
    <div className={`flex items-center gap-1 text-xs ${color}`}>
      <Icon size={12} />
      <span>{formatFn(delta)}</span>
    </div>
  );
}
