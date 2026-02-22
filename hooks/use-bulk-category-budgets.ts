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
  const { loading: fetchCategoriesLoadingStatus, categories } = useFinanceConfig();

  const [rows, setRows] = useState<EditableBudgetRow[]>([]);
  const [computationLoadingStatus, setComputationLoadingStatus] = useState(true);
  const [noCategories, setNoCategories] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      setComputationLoadingStatus(true);
      const budgets = await getBudgetsByMonth(monthKey);
      console.log(categories, budgets);
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
      setComputationLoadingStatus(false);
    };

    const handleNoCategories = () => {
      setNoCategories(true);
      setComputationLoadingStatus(false);
    }

    if (fetchCategoriesLoadingStatus)
      return;

    if (categories.length > 0) 
      load();
    else
      handleNoCategories()
  }, [fetchCategoriesLoadingStatus, monthKey]);

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
    loading: computationLoadingStatus || fetchCategoriesLoadingStatus,
    noCategories,
  };
};