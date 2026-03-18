import type {
    CreditCardPaymentCreateInput,
    CreditCardPaymentUpdateInput,
} from "@/types/create";
import type { CreditCardPaymentDB } from "@/types/firebase";
import type { CreditCardPayment } from "@/types/schema";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    FirestoreDataConverter,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    QueryDocumentSnapshot,
    serverTimestamp,
    SnapshotOptions,
    Timestamp,
    updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { getCurrentUserId } from "./firestore-helpers";

const creditCardPaymentConverter: FirestoreDataConverter<CreditCardPayment> = {
    toFirestore(payment: CreditCardPayment): CreditCardPaymentDB {
        return {
            paymentMethod: payment.paymentMethod,
            bankAccount: payment.bankAccount,
            amount: payment.amount,
            description: payment.description,
            date: Timestamp.fromDate(payment.date),
            monthKey: payment.monthKey,
            createdAt: serverTimestamp(),
        };
    },
    fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
    ): CreditCardPayment {
        const data = snapshot.data(options) as CreditCardPaymentDB;

        return {
            id: snapshot.id,
            paymentMethod: data.paymentMethod,
            bankAccount: data.bankAccount,
            amount: data.amount,
            description: data.description,
            date: data.date.toDate(),
            monthKey: data.monthKey,
            createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
        };
    },
};

const TABLE_NAME = "creditCardPayments";

export const getCreditCardPayments = async (): Promise<CreditCardPayment[]> => {
    const uid = getCurrentUserId();

    const snapshot = await getDocs(
        collection(db, "users", uid, TABLE_NAME).withConverter(creditCardPaymentConverter)
    );

    return snapshot.docs.map(docItem => docItem.data());
};

export const addCreditCardPayment = async (input: CreditCardPaymentCreateInput) => {
    const uid = getCurrentUserId();

    await addDoc(
        collection(db, "users", uid, TABLE_NAME).withConverter(creditCardPaymentConverter),
        {
            ...input,
            id: "",
            createdAt: new Date(),
        }
    );
};

export const updateCreditCardPayment = async (
    paymentId: string,
    updates: CreditCardPaymentUpdateInput
) => {
    const uid = getCurrentUserId();
    const payload: any = { ...updates };

    if (updates.date) {
        payload.date = Timestamp.fromDate(updates.date);
    }

    await updateDoc(
        doc(db, "users", uid, TABLE_NAME, paymentId),
        payload
    );
};

export const deleteCreditCardPayment = async (paymentId: string) => {
    const uid = getCurrentUserId();

    await deleteDoc(
        doc(db, "users", uid, TABLE_NAME, paymentId)
    );
};

export const subscribeToCreditCardPayments = (
    callback: (payments: CreditCardPayment[]) => void
) => {
    const uid = getCurrentUserId();

    const q = query(
        collection(db, "users", uid, TABLE_NAME).withConverter(creditCardPaymentConverter),
        orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const payments = snapshot.docs.map(docItem => docItem.data());
        callback(payments);
    });

    return unsubscribe;
};
