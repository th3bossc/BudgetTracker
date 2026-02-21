import { useEffect, useState } from "react";
import { getExpenseCategories } from "@/services/expense-category-service";
import { getIncomeSources } from "@/services/income-source-service";
import { getInvestmentTypes } from "@/services/investment-type-service";
import { CategoryBudget, ExpenseCategory, IncomeSource, InvestmentType } from "@/types/schema";
import { getBudgets } from "@/services/category-budget-service";
import { getMonthKey } from "@/utils/date";

export interface FinanceFilterData {
  loading: boolean;
  categories: ExpenseCategory[];
  incomeSources: IncomeSource[];
  investmentTypes: InvestmentType[];
  categoryBudgets: CategoryBudget[];
}

export const useFinanceConfig = (): FinanceFilterData => {
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [investmentTypes, setInvestmentTypes] = useState<InvestmentType[]>([]);
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>([]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const currentMonth = getMonthKey(new Date());
        const [cats, sources, types, budgets] = await Promise.all([
          getExpenseCategories(),
          getIncomeSources(),
          getInvestmentTypes(),
          getBudgets(),
        ]);

        setCategories(cats.filter(c => !c.isArchived));
        setIncomeSources(sources.filter(s => !s.isArchived));
        setInvestmentTypes(types.filter(t => !t.isArchived));
        setCategoryBudgets(budgets.filter(budget => budget.monthKey == currentMonth));
      } catch (err) {
        console.error("Config fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return {
    loading,
    categories,
    incomeSources,
    investmentTypes,
    categoryBudgets,
  };
};