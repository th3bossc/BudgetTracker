import { useEffect, useState } from "react";
import { getExpenseCategories } from "@/services/expense-category-service";
import { getIncomeSources } from "@/services/income-source-service";
import { getInvestmentTypes } from "@/services/investment-type-service";
import { ExpenseCategory, IncomeSource, InvestmentType } from "@/types/schema";

export const useFinanceConfig = () => {
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [investmentTypes, setInvestmentTypes] = useState<InvestmentType[]>([]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);

        const [cats, sources, types] = await Promise.all([
          getExpenseCategories(),
          getIncomeSources(),
          getInvestmentTypes(),
        ]);

        setCategories(cats.filter(c => !c.isArchived));
        setIncomeSources(sources.filter(s => !s.isArchived));
        setInvestmentTypes(types.filter(t => !t.isArchived));
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
  };
};