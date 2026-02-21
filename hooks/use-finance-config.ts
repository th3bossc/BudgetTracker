import { useEffect, useState } from "react";
import { getExpenseCategories } from "@/services/expense-category-service";
import { getIncomeSources } from "@/services/income-source-service";
import { getInvestmentTypes } from "@/services/investment-type-service";
import { ExpenseCategory, IncomeSource, InvestmentType, PaymentMethod } from "@/types/schema";
import { getPaymentMethods } from "@/services/payment-method-service";

export interface FinanceFilterData {
  loading: boolean;
  categories: ExpenseCategory[];
  incomeSources: IncomeSource[];
  investmentTypes: InvestmentType[];
  paymentMethods: PaymentMethod[];
}

export const useFinanceConfig = (): FinanceFilterData => {
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [investmentTypes, setInvestmentTypes] = useState<InvestmentType[]>([]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const [cats, sources, types, paymentMethods] = await Promise.all([
          getExpenseCategories(),
          getIncomeSources(),
          getInvestmentTypes(),
          getPaymentMethods(),
        ]);

        setCategories(cats.filter(c => !c.isArchived));
        setIncomeSources(sources.filter(s => !s.isArchived));
        setInvestmentTypes(types.filter(t => !t.isArchived));
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
    paymentMethods,
  };
};