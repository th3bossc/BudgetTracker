import type { ExpenseCategory } from "@/types/schema";
import type { ExpenseCategoryDB } from "@/types/firebase";

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
    query,
    onSnapshot,
} from "firebase/firestore";

import { db } from "./firebase";
import { getCurrentUserId } from "./firestore-helpers";
import { ExpenseCategoryCreateInput, ExpenseCategoryUpdateInput } from "@/types/create";

const categoryConverter: FirestoreDataConverter<ExpenseCategory> = {
    toFirestore(category: ExpenseCategory): ExpenseCategoryDB {
        return {
            name: category.name,
            color: category.color,
            isArchived: category.isArchived ?? false,
            createdAt: serverTimestamp(),
        };
    },

    fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
    ): ExpenseCategory {
        const data = snapshot.data(options) as ExpenseCategoryDB;

        return {
            id: snapshot.id,
            name: data.name,
            color: data.color ?? "#4CAF50",
            isArchived: data.isArchived ?? false,
            createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
        };
    },
};

const TABLE_NAME = "expenseCategories"

export const getExpenseCategories = async (): Promise<ExpenseCategory[]> => {
    const uid = getCurrentUserId();

    const snapshot = await getDocs(
        collection(db, "users", uid, TABLE_NAME).withConverter(categoryConverter)
    );

    return snapshot.docs.map(doc => doc.data());
};

export const addExpenseCategory = async (input: ExpenseCategoryCreateInput) => {
    const uid = getCurrentUserId();

    await addDoc(
        collection(db, "users", uid, TABLE_NAME).withConverter(categoryConverter),
        {
            ...input,
            id: "",
            createdAt: new Date(),
        }
    );
};

export const updateExpenseCategory = async (
    categoryId: string,
    updates: ExpenseCategoryUpdateInput
) => {
    const uid = getCurrentUserId();

    await updateDoc(
        doc(db, "users", uid, TABLE_NAME, categoryId),
        updates
    );
};

export const deleteExpenseCategory = async (categoryId: string) => {
    const uid = getCurrentUserId();

    await deleteDoc(
        doc(db, "users", uid, TABLE_NAME, categoryId)
    );
};

export const subscribeToExpenseCategories = (
    callback: (categories: ExpenseCategory[]) => void
) => {
    const uid = getCurrentUserId();

    const q = query(
        collection(db, 'users', uid, TABLE_NAME)
        .withConverter(categoryConverter)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const categories = snapshot.docs.map(doc => doc.data());
        callback(categories);
    })

    return unsubscribe;
}