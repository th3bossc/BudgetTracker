import { useCallback, useEffect, useState } from "react";
import { useFinanceConfig } from "./use-finance-config";
import { getBudgetsByMonth } from "@/services/category-budget-service";

export interface EditableBudgetRow {
  categoryId: string;
  categoryName: string;
  amount: string;
  budgetId?: string;
}

export const useBulkCategoryBudgets = (monthKey: string) => {
  const { categories } = useFinanceConfig();

  const [rows, setRows] = useState<EditableBudgetRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const budgets = await getBudgetsByMonth(monthKey);

      const mapped = categories.map(cat => {
        const existing = budgets.find(
          b => b.category.id === cat.id
        );

        return {
          categoryId: cat.id,
          categoryName: cat.name,
          amount: existing ? String(existing.amount) : "",
          budgetId: existing?.id,
        };
      });
      setRows(mapped);
      setLoading(false);
    };

    if (categories.length > 0) load();
  }, [categories, monthKey]);

  const updateAmount = useCallback((categoryId: string, value: string) => {
    setRows(prev =>
      prev.map(row =>
        row.categoryId === categoryId
          ? { ...row, amount: value }
          : row
      )
    );
  }, [rows]);

  return {
    rows,
    updateAmount,
    loading,
  };
};