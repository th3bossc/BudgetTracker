import type { AccountTransfer, BankAccount, BankAccountBalanceAdjustment, CreditCardPayment, ExpenseCategory, Expense, Income, IncomeSource, Iou, Investment, InvestmentType, PaymentMethod } from "./schema";

export type OmittedKeys = 'id' | 'createdAt';

export type CreateInput<T> = Omit<T, OmittedKeys>;
export type UpdateInput<T> = Partial<Omit<T, OmittedKeys>>;

/* CREATE types */
export type ExpenseCategoryCreateInput = CreateInput<ExpenseCategory>;
export type IncomeSourceCreateInput = CreateInput<IncomeSource>;
export type InvestmentTypeCreateInput = CreateInput<InvestmentType>;
export type PaymentMethodCreateInput = CreateInput<PaymentMethod>;
export type CreditCardPaymentCreateInput = CreateInput<CreditCardPayment>;

export type ExpenseCreateInput = CreateInput<Expense>;
export type IncomeCreateInput = CreateInput<Income>;
export type InvestmentCreateInput = CreateInput<Investment>;
export type IouCreateInput = CreateInput<Iou>;
export type AccountTransferCreateInput = CreateInput<AccountTransfer>;
export type BankAccountCreateInput = CreateInput<BankAccount>;
export type BankAccountBalanceAdjustmentCreateInput = CreateInput<BankAccountBalanceAdjustment>;

/* UPDATE types */
export type ExpenseCategoryUpdateInput = UpdateInput<ExpenseCategory>;
export type IncomeSourceUpdateInput = UpdateInput<IncomeSource>;
export type InvestmentTypeUpdateInput = UpdateInput<InvestmentType>;
export type PaymentMethodUpdateInput = UpdateInput<PaymentMethod>;
export type CreditCardPaymentUpdateInput = UpdateInput<CreditCardPayment>;

export type ExpenseUpdateInput = UpdateInput<Expense>;
export type IncomeUpdateInput = UpdateInput<Income>;
export type InvestmentUpdateInput = UpdateInput<Investment>;
export type IouUpdateInput = UpdateInput<Iou>;
export type AccountTransferUpdateInput = UpdateInput<AccountTransfer>;
export type BankAccountUpdateInput = UpdateInput<BankAccount>;
export type BankAccountBalanceAdjustmentUpdateInput = UpdateInput<BankAccountBalanceAdjustment>;
