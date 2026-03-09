import { useCallback, useEffect, useState } from "react";
import { useFinanceConfig } from "./use-finance-config";
import { subscribeToMonthlyPaymentChannelBudgets } from "@/services/payment-channel-budget-service";
import { PaymentChannelBudget } from "@/types/schema";

export interface EditablePaymentChannelBudgetRow {
  paymentMethodId: string;
  paymentMethodName: string;
  amount: string;
  budgetId?: string;
}

export const useBulkPaymentChannelBudgets = (monthKey: string) => {
  const { loading: configLoading, paymentMethods } = useFinanceConfig();

  const [rows, setRows] = useState<EditablePaymentChannelBudgetRow[]>([]);
  const [computationLoading, setComputationLoading] = useState(true);
  const [noPaymentMethods, setNoPaymentMethods] = useState<boolean>(true);
  const [budgets, setBudgets] = useState<PaymentChannelBudget[]>([]);

  useEffect(() => {
    return subscribeToMonthlyPaymentChannelBudgets(monthKey, setBudgets);
  }, [monthKey]);

  useEffect(() => {
    if (configLoading)
      return;

    if (paymentMethods.length === 0) {
      setNoPaymentMethods(true);
      setComputationLoading(false);
      return;
    }

    setComputationLoading(true);
    const mapped = paymentMethods.map(method => {
      const existing = budgets.find(
        b => b.paymentMethod.id === method.id
      );

      return {
        paymentMethodId: method.id,
        paymentMethodName: method.name,
        amount: existing ? String(existing.amount) : "",
        budgetId: existing?.id,
      };
    });

    setRows(mapped);
    setNoPaymentMethods(false);
    setComputationLoading(false);
  }, [configLoading, paymentMethods, budgets]);

  const updateAmount = useCallback((paymentMethodId: string, value: string) => {
    setRows(prev =>
      prev.map(row =>
        row.paymentMethodId === paymentMethodId
          ? { ...row, amount: value }
          : row
      )
    );
  }, []);

  return {
    rows,
    updateAmount,
    loading: computationLoading || configLoading,
    noPaymentMethods,
  };
};
