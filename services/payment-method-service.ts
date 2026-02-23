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
        return {
            name: source.name,
            color: source.color,
            isArchived: source.isArchived ?? false,
            createdAt: serverTimestamp(),
        };
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
            isArchived: data.isArchived ?? false,
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

    await updateDoc(
        doc(db, "users", uid, TABLE_NAME, paymentMethodId),
        updates
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