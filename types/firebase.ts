import { FieldValue, Timestamp } from "firebase/firestore";
import { CategoryBudgetBase, ExpenseBase, ExpenseCategoryBase, IncomeBase, IncomeSourceBase, IouBase, InvestmentBase, InvestmentTypeBase, PaymentMethodBase } from "./schema";

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

export interface IouDB {
    expense: IouBase["expense"];
    paymentMethod: IouBase["paymentMethod"];
    amountLeft: IouBase["amountLeft"];
    monthKey: IouBase["monthKey"];
    isPaid: IouBase["isPaid"];
    paidAt: Timestamp | null;
    createdAt: Timestamp | FieldValue;
}
