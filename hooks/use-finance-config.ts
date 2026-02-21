import { useEffect, useState } from "react";
import { getExpenseCategories } from "@/services/expense-category-service";
import { getIncomeSources } from "@/services/income-source-service";
import { getInvestmentTypes } from "@/services/investment-type-service";
import { CategoryBudget, ExpenseCategory, IncomeSource, InvestmentType, PaymentMethod } from "@/types/schema";
import { getBudgets } from "@/services/category-budget-service";
import { getMonthKey } from "@/utils/date";
import { getPaymentMethods } from "@/services/payment-method-service";

export interface FinanceFilterData {
  loading: boolean;
  categories: ExpenseCategory[];
  incomeSources: IncomeSource[];
  investmentTypes: InvestmentType[];
  categoryBudgets: CategoryBudget[];
  paymentMethods: PaymentMethod[];
}

export const useFinanceConfig = (): FinanceFilterData => {
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [investmentTypes, setInvestmentTypes] = useState<InvestmentType[]>([]);
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>([]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const currentMonth = getMonthKey(new Date());
        const [cats, sources, types, budgets, paymentMethods] = await Promise.all([
          getExpenseCategories(),
          getIncomeSources(),
          getInvestmentTypes(),
          getBudgets(),
          getPaymentMethods(),
        ]);

        setCategories(cats.filter(c => !c.isArchived));
        setIncomeSources(sources.filter(s => !s.isArchived));
        setInvestmentTypes(types.filter(t => !t.isArchived));
        setCategoryBudgets(budgets.filter(budget => budget.monthKey == currentMonth));
        setPaymentMethods(paymentMethods.filter(p => !p.isArchived));
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
    paymentMethods,
  };
};