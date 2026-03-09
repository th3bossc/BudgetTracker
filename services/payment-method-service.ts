import type { PaymentMethod } from "@/types/schema";
import type { PaymentMethodDB } from "@/types/firebase";

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
import { PaymentMethodCreateInput, PaymentMethodUpdateInput } from "@/types/create";

const paymentMethodConverter: FirestoreDataConverter<PaymentMethod> = {
    toFirestore(source: PaymentMethod): PaymentMethodDB {
        const payload: PaymentMethodDB = {
            name: source.name,
            color: source.color,
            isArchived: source.isArchived ?? false,
            isCreditCard: source.isCreditCard ?? false,
            createdAt: serverTimestamp(),
        };

        if (source.icon) {
            payload.icon = source.icon;
        }

        if (source.bankAccount) {
            payload.bankAccount = source.bankAccount;
        }

        if (typeof source.creditLimit === "number") {
            payload.creditLimit = source.creditLimit;
        }

        if (typeof source.statementClosingDay === "number") {
            payload.statementClosingDay = source.statementClosingDay;
        }

        if (typeof source.billingDueDay === "number") {
            payload.billingDueDay = source.billingDueDay;
        }

        return payload;
    },

    fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
    ): PaymentMethod {
        const data = snapshot.data(options) as PaymentMethodDB;

        return {
            id: snapshot.id,
            name: data.name,
            color: data.color ?? "#2E7D32",
            icon: data.icon,
            isArchived: data.isArchived ?? false,
            bankAccount: data.bankAccount,
            isCreditCard: data.isCreditCard ?? false,
            creditLimit: data.creditLimit,
            statementClosingDay: data.statementClosingDay,
            billingDueDay: data.billingDueDay,
            createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
        };
    },
};

const TABLE_NAME = "paymentMethods";

export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
    const uid = getCurrentUserId();

    const snapshot = await getDocs(
        collection(db, "users", uid, TABLE_NAME).withConverter(paymentMethodConverter)
    );

    return snapshot.docs.map(doc => doc.data());
};

export const addPaymentMethod = async (input: PaymentMethodCreateInput) => {
    const uid = getCurrentUserId();

    await addDoc(
        collection(db, "users", uid, TABLE_NAME).withConverter(paymentMethodConverter),
        {
            ...input,
            id: "",
            createdAt: new Date(),
        }
    );
};

export const updatePaymentMethod = async (
    paymentMethodId: string,
    updates: PaymentMethodUpdateInput
) => {
    const uid = getCurrentUserId();
    const payload = Object.fromEntries(
        Object.entries(updates).filter(([, value]) => value !== undefined)
    );

    await updateDoc(
        doc(db, "users", uid, TABLE_NAME, paymentMethodId),
        payload
    );
};

export const deletePaymentMethod = async (paymentMethodId: string) => {
    const uid = getCurrentUserId();

    await deleteDoc(
        doc(db, "users", uid, TABLE_NAME, paymentMethodId)
    );
};

export const subscribeToPaymentMethods = (
    callback: (expenses: PaymentMethod[]) => void
) => {
    const uid = getCurrentUserId();

    const q = query(
        collection(db, "users", uid, TABLE_NAME)
            .withConverter(paymentMethodConverter),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const expenses = snapshot.docs.map(doc => doc.data());
        callback(expenses);
    });

    return unsubscribe;
};
