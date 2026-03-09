import { useEffect, useState } from "react";
import { subscribeToExpenseCategories } from "@/services/expense-category-service";
import { subscribeToIncomeSources } from "@/services/income-source-service";
import { subscribeToInvestmentTypes } from "@/services/investment-type-service";
import { BankAccount, ExpenseCategory, IncomeSource, InvestmentType, PaymentMethod } from "@/types/schema";
import { subscribeToPaymentMethods } from "@/services/payment-method-service";
import { subscribeToBankAccounts } from "@/services/bank-account-service";

export interface FinanceFilterData {
    loading: boolean;
    categories: ExpenseCategory[];
    incomeSources: IncomeSource[];
    investmentTypes: InvestmentType[];
    paymentMethods: PaymentMethod[];
    bankAccounts: BankAccount[];
}

export const useFinanceConfig = (): FinanceFilterData => {
    const [loading, setLoading] = useState(true);

    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
    const [investmentTypes, setInvestmentTypes] = useState<InvestmentType[]>([]);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);



    useEffect(() => {
        const categoriesUnsub = subscribeToExpenseCategories(setCategories);
        const paymentMethodsUnsub = subscribeToPaymentMethods(setPaymentMethods);
        const incomeSourcesUnsub = subscribeToIncomeSources(setIncomeSources);
        const investmentTypesUnsub = subscribeToInvestmentTypes(setInvestmentTypes);
        const bankAccountsUnsub = subscribeToBankAccounts(setBankAccounts);
        setLoading(false);

        return () => {
            categoriesUnsub();
            paymentMethodsUnsub();
            incomeSourcesUnsub();
            investmentTypesUnsub();
            bankAccountsUnsub();
        }
    }, []);

    return {
        loading,
        categories: [...categories].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
        incomeSources: [...incomeSources].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
        investmentTypes: [...investmentTypes].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
        paymentMethods: [...paymentMethods].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
        bankAccounts: [...bankAccounts].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    };
};
