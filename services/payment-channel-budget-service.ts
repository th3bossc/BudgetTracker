import type { PaymentChannelBudget } from "@/types/schema";
import type { PaymentChannelBudgetDB } from "@/types/firebase";

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
    onSnapshot,
} from "firebase/firestore";

import { db } from "./firebase";
import { getCurrentUserId } from "./firestore-helpers";

const paymentChannelBudgetConverter: FirestoreDataConverter<PaymentChannelBudget> = {
    toFirestore(budget: PaymentChannelBudget): PaymentChannelBudgetDB {
        return {
            paymentMethod: budget.paymentMethod,
            monthKey: budget.monthKey,
            amount: budget.amount,
            createdAt: serverTimestamp(),
        };
    },

    fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
    ): PaymentChannelBudget {
        const data = snapshot.data(options) as PaymentChannelBudgetDB;

        return {
            id: snapshot.id,
            paymentMethod: data.paymentMethod,
            monthKey: data.monthKey,
            amount: data.amount,
            createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
        };
    },
};

const TABLE_NAME = "paymentChannelBudgets";

export const getPaymentChannelBudgets = async (): Promise<PaymentChannelBudget[]> => {
    const uid = getCurrentUserId();

    const snapshot = await getDocs(
        collection(db, "users", uid, TABLE_NAME).withConverter(paymentChannelBudgetConverter)
    );

    return snapshot.docs.map(doc => doc.data());
};

export const upsertPaymentChannelBudget = async (
    paymentMethodId: string,
    monthKey: string,
    amount: number
) => {
    const budgets = await getPaymentChannelBudgets();
    const existing = budgets.find(
        b => b.paymentMethod.id === paymentMethodId && b.monthKey === monthKey
    );

    const uid = getCurrentUserId();

    if (existing) {
        await updateDoc(
            doc(db, "users", uid, TABLE_NAME, existing.id),
            { amount }
        );

        return;
    }

    await addDoc(
        collection(db, "users", uid, TABLE_NAME),
        {
            paymentMethod: { id: paymentMethodId },
            monthKey,
            amount,
            createdAt: serverTimestamp(),
        }
    );
};

export const subscribeToMonthlyPaymentChannelBudgets = (
    monthKey: string,
    callback: (budgets: PaymentChannelBudget[]) => void
) => {
    const uid = getCurrentUserId();

    const q = query(
        collection(db, "users", uid, TABLE_NAME).withConverter(paymentChannelBudgetConverter),
        where("monthKey", "==", monthKey)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map(doc => doc.data()));
    });

    return unsubscribe;
};
