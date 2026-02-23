import { useCallback, useEffect, useState } from "react";
import { useFinanceConfig } from "./use-finance-config";
import { subscribeToMonthlyBudgets } from "@/services/category-budget-service";
import { CategoryBudget } from "@/types/schema";

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
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);

  useEffect(() => {
    const unsub = subscribeToMonthlyBudgets(monthKey, setBudgets);

    return unsub;
  }, [monthKey]);

  useEffect(() => {
    const load = async () => {
      setComputationLoadingStatus(true);
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
  }, [fetchCategoriesLoadingStatus, budgets]);

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