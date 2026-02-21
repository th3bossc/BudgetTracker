import { FieldValue, Timestamp } from "firebase/firestore";
import { ExpenseBase, ExpenseCategoryBase, IncomeBase, IncomeSourceBase, InvestmentBase, InvestmentTypeBase } from "./schema";

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