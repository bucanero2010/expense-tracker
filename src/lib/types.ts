export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  category: string;
  subcategory: string;
  amount: number;
  note: string | null;
  created_at: string;
}

export interface CategoryConfig {
  name: string;
  subcategories: string[];
  color: string;
}

export interface MonthlyKPIs {
  totalSpent: number;
  transactionCount: number;
  medianTicket: number;
  noSpendDays: number;
  maxCategoryDelta: { category: string; delta: number };
}
