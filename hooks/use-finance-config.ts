import { useEffect, useState } from "react";
import { subscribeToExpenseCategories } from "@/services/expense-category-service";
import { subscribeToIncomeSources } from "@/services/income-source-service";
import { subscribeToInvestmentTypes } from "@/services/investment-type-service";
import { ExpenseCategory, IncomeSource, InvestmentType, PaymentMethod } from "@/types/schema";
import { subscribeToPaymentMethods } from "@/services/payment-method-service";

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
        const categoriesUnsub = subscribeToExpenseCategories(setCategories);
        const paymentMethodsUnsub = subscribeToPaymentMethods(setPaymentMethods);
        const incomeSourcesUnsub = subscribeToIncomeSources(setIncomeSources);
        const investmentTypesUnsub = subscribeToInvestmentTypes(setInvestmentTypes);
        setLoading(false);

        return () => {
            categoriesUnsub();
            paymentMethodsUnsub();
            incomeSourcesUnsub();
            investmentTypesUnsub();
        }
    }, []);

    return {
        loading,
        categories,
        incomeSources,
        investmentTypes,
        paymentMethods,
    };
};