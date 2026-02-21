import type { CategoryBudget } from "@/types/schema";
import type { CategoryBudgetDB } from "@/types/firebase";

import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
  doc,
  updateDoc,
  where,
  query,
} from "firebase/firestore";

import { db } from "./firebase";
import { getCurrentUserId } from "./firestore-helpers";

const budgetConverter: FirestoreDataConverter<CategoryBudget> = {
  toFirestore(budget: CategoryBudget): CategoryBudgetDB {
    return {
      category: budget.category,
      monthKey: budget.monthKey,
      amount: budget.amount,
      createdAt: serverTimestamp(),
    };
  },

  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): CategoryBudget {
    const data = snapshot.data(options) as CategoryBudgetDB;

    return {
      id: snapshot.id,
      category: data.category,
      monthKey: data.monthKey,
      amount: data.amount,
      createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
    };
  },
};

const TABLE_NAME = "budgets"

export const getBudgets = async (): Promise<CategoryBudget[]> => {
  const uid = getCurrentUserId();

  const snapshot = await getDocs(
    collection(db, "users", uid, TABLE_NAME).withConverter(budgetConverter)
  );

  return snapshot.docs.map(doc => doc.data());
};

export const getBudgetsByMonth = async (monthKey: string): Promise<CategoryBudget[]> => {
  const uid = getCurrentUserId();

  const snapshot = await getDocs(
    query(
      collection(db, 'users', uid, TABLE_NAME).withConverter(budgetConverter),
      where('monthKey', '==', monthKey)
    )
  );

  return snapshot.docs.map(doc => doc.data());
}

export const upsertBudget = async (
  categoryId: string,
  monthKey: string,
  amount: number
) => {
  const uid = getCurrentUserId();

  // naive upsert for now (can optimize later)
  const budgets = await getBudgets();
  const existing = budgets.find(
    b => b.category.id === categoryId && b.monthKey === monthKey
  );
  if (existing) {
    await updateDoc(
      doc(db, "users", uid, TABLE_NAME, existing.id),
      { amount }
    );
  } else {
    await addDoc(
      collection(db, "users", uid, TABLE_NAME),
      {
        category: { id: categoryId },
        monthKey,
        amount,
        createdAt: serverTimestamp(),
      }
    );
  }
};