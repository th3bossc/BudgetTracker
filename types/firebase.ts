import { FieldValue, Timestamp } from "firebase/firestore";
import { AccountTransferBase, BankAccountBalanceAdjustmentBase, BankAccountBase, CategoryBudgetBase, CreditCardPaymentBase, ExpenseBase, ExpenseCategoryBase, IncomeBase, IncomeSourceBase, IouBase, InvestmentBase, InvestmentTypeBase, PaymentChannelBudgetBase, PaymentMethodBase } from "./schema";

export interface ExpenseDB extends ExpenseBase {
    date: Timestamp;
    createdAt: Timestamp | FieldValue;
}

export interface IncomeDB extends IncomeBase {
    date: Timestamp;
    createdAt: Timestamp | FieldValue;
}

export interface InvestmentDB extends InvestmentBase {
    date: Timestamp;
    createdAt: Timestamp | FieldValue;
}

export interface ExpenseCategoryDB extends ExpenseCategoryBase {
    createdAt: Timestamp | FieldValue;
}

export interface IncomeSourceDB extends IncomeSourceBase {
    createdAt: Timestamp | FieldValue;
}

export interface InvestmentTypeDB extends InvestmentTypeBase {
    createdAt: Timestamp | FieldValue;
}

export interface CategoryBudgetDB extends CategoryBudgetBase {
    createdAt: Timestamp | FieldValue;
}

export interface PaymentMethodDB extends PaymentMethodBase {
    createdAt: Timestamp | FieldValue;
}

export interface CreditCardPaymentDB extends CreditCardPaymentBase {
    date: Timestamp;
    createdAt: Timestamp | FieldValue;
}

export interface PaymentChannelBudgetDB extends PaymentChannelBudgetBase {
    createdAt: Timestamp | FieldValue;
}

export interface IouDB {
    expense: IouBase["expense"];
    paymentMethod: IouBase["paymentMethod"];
    initialAmount: IouBase["initialAmount"];
    amountLeft: IouBase["amountLeft"];
    expenseMonthKey?: IouBase["expenseMonthKey"];
    createdMonthKey?: IouBase["createdMonthKey"];
    monthKey?: string;
    isPaid: IouBase["isPaid"];
    paidAt: Timestamp | null;
    createdAt: Timestamp | FieldValue;
}

export interface AccountTransferDB extends AccountTransferBase {
    date: Timestamp;
    createdAt: Timestamp | FieldValue;
}

export interface BankAccountDB extends BankAccountBase {
    createdAt: Timestamp | FieldValue;
}

export interface BankAccountBalanceAdjustmentDB extends BankAccountBalanceAdjustmentBase {
    date: Timestamp;
    createdAt: Timestamp | FieldValue;
}
