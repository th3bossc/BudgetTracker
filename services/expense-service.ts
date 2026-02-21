import type { Expense } from "@/types/schema";
import type { ExpenseCreateInput, ExpenseUpdateInput } from "@/types/create";
import type { ExpenseDB } from "@/types/firebase";
import {
    collection,
    getDocs,
    addDoc,
    serverTimestamp,
    FirestoreDataConverter,
    QueryDocumentSnapshot,
    SnapshotOptions,
    Timestamp,
    updateDoc,
    doc,
    deleteDoc,
} from 'firebase/firestore';
import { db } from "./firebase";
import { getCurrentUserId } from "./firestore-helpers";

const expenseConverter: FirestoreDataConverter<Expense> = {
    toFirestore(expense: Expense): ExpenseDB {
        return {
            amount: expense.amount,
            category: expense.category,
            paymentMethod: expense.paymentMethod,
            description: expense.description,
            date: Timestamp.fromDate(expense.date),
            monthKey: expense.monthKey,
            createdAt: serverTimestamp(),
        }
    },
    fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
    ): Expense {
        const data = snapshot.data(options) as ExpenseDB;

        return {
            id: snapshot.id,
            amount: data.amount,
            paymentMethod: data.paymentMethod,
            category: data.category,
            description: data.description,
            monthKey: data.monthKey,
            date: data.date.toDate(),
            createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
        }
    }
}

const TABLE_NAME = "expenses"

export const getExpenses = async (): Promise<Expense[]> => {
    const uid = getCurrentUserId();

    const snapshot = await getDocs(
        collection(db, 'users', uid, TABLE_NAME).withConverter(expenseConverter)
    );

    return snapshot.docs.map(doc => doc.data());
}

export const addExpense = async (
    input: ExpenseCreateInput
) => {
    const uid = getCurrentUserId();

    await addDoc(collection(db, 'users', uid, TABLE_NAME).withConverter(expenseConverter), {
        ...input,
        id: '',
        createdAt: new Date()
    });
}

export const updateExpense = async (
    expenseId: string,
    updates: ExpenseUpdateInput,
) => {
    const uid = getCurrentUserId();

    const payload: any = { ...updates };

    if (updates.date)
        payload.date = Timestamp.fromDate(updates.date);

    await updateDoc(
        doc(db, 'users', uid, TABLE_NAME, expenseId),
        payload,
    )
}

export const deleteExpense = async (
    expenseId: string,
) => {
    const uid = getCurrentUserId();

    await deleteDoc(
        doc(db, 'users', uid, TABLE_NAME, expenseId),
    );
}