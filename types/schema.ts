/* Base interfaces */

export interface BaseDoc {
    id: string;
    createdAt: Date;
}

export interface TimestampedInput {
    createdAt?: Date;
}

export enum InvestmentRiskLevel {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high'
}

/* base types */
export interface ExpenseCategoryBase {
    name: string;
    color: string;
    icon?: string;
    isArchived?: boolean;
}

export interface IncomeSourceBase {
    name: string;
    color: string;
    icon?: string;
    isArchived?: boolean;
}

export interface InvestmentTypeBase {
    name: string;
    icon?: string;
    riskLevel?: InvestmentRiskLevel;
    isArchived?: boolean;
}

export interface PaymentMethodBase {
    name: string;
    color: string;
    icon?: string;
    isArchived?: boolean;
    bankAccount?: { id: string, name?: string };
    isCreditCard?: boolean;
    creditLimit?: number;
    statementClosingDay?: number;
    billingDueDay?: number;
}

export interface ExpenseBase {
    amount: number;
    category: { id: string, name?: string };
    paymentMethod: { id: string, name?: string };
    description?: string;
    monthKey: string;
}

export interface IncomeBase {
    amount: number;
    source: { id: string, name?: string };
    bankAccount?: { id: string, name?: string };
    description?: string;
    monthKey: string;
}

export interface InvestmentBase {
    name: string;
    type: { id: string, name?: string };
    description?: string;
    amount: number;
    monthKey: string;
}

export interface CategoryBudgetBase {
    category: { id: string, name?: string };
    monthKey: string;
    amount: number;
}

export interface PaymentChannelBudgetBase {
    paymentMethod: { id: string, name?: string };
    monthKey: string;
    amount: number;
}

export interface IouBase {
    expense: { id: string };
    paymentMethod: { id: string, name?: string };
    initialAmount: number;
    amountLeft: number;
    expenseMonthKey: string;
    createdMonthKey: string;
    isPaid: boolean;
    paidAt?: Date;
}

export interface AccountTransferBase {
    fromBankAccount: { id: string, name?: string };
    toBankAccount: { id: string, name?: string };
    amount: number;
    description?: string;
    monthKey: string;
}

export interface BankAccountBase {
    name: string;
    openingBalance: number;
    minimumBalance?: number;
    isArchived?: boolean;
}

export interface BankAccountBalanceAdjustmentBase {
    bankAccount: { id: string, name?: string };
    amount: number;
    note?: string;
    monthKey: string;
}

/* main tables */ 
export interface ExpenseCategory extends BaseDoc, ExpenseCategoryBase {};

export interface IncomeSource extends BaseDoc, IncomeSourceBase {};

export interface InvestmentType extends BaseDoc, InvestmentTypeBase {};

export interface PaymentMethod extends BaseDoc, PaymentMethodBase {};

export interface Expense extends BaseDoc, ExpenseBase {
    date: Date;
}

export interface Income extends BaseDoc, IncomeBase {
    date: Date;
}

export interface Investment extends BaseDoc, InvestmentBase {
    date: Date;
}

export interface CategoryBudget extends BaseDoc, CategoryBudgetBase {};

export interface PaymentChannelBudget extends BaseDoc, PaymentChannelBudgetBase {};

export interface Iou extends BaseDoc, IouBase {};

export interface AccountTransfer extends BaseDoc, AccountTransferBase {
    date: Date;
};

export interface BankAccount extends BaseDoc, BankAccountBase {};

export interface BankAccountBalanceAdjustment extends BaseDoc, BankAccountBalanceAdjustmentBase {
    date: Date;
};
