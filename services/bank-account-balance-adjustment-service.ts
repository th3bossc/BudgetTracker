import type {
    BankAccountBalanceAdjustmentCreateInput,
    BankAccountBalanceAdjustmentUpdateInput,
} from "@/types/create";
import type { BankAccountBalanceAdjustmentDB } from "@/types/firebase";
import type { BankAccountBalanceAdjustment } from "@/types/schema";
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

const adjustmentConverter: FirestoreDataConverter<BankAccountBalanceAdjustment> = {
    toFirestore(adjustment: BankAccountBalanceAdjustment): BankAccountBalanceAdjustmentDB {
        return {
            bankAccount: adjustment.bankAccount,
            amount: adjustment.amount,
            note: adjustment.note,
            monthKey: adjustment.monthKey,
            date: Timestamp.fromDate(adjustment.date),
            createdAt: serverTimestamp(),
        };
    },
    fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
    ): BankAccountBalanceAdjustment {
        const data = snapshot.data(options) as BankAccountBalanceAdjustmentDB;

        return {
            id: snapshot.id,
            bankAccount: data.bankAccount,
            amount: data.amount,
            note: data.note,
            monthKey: data.monthKey,
            date: data.date.toDate(),
            createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
        };
    },
};

const TABLE_NAME = "bankAccountBalanceAdjustments";

export const getBankAccountBalanceAdjustments = async (): Promise<BankAccountBalanceAdjustment[]> => {
    const uid = getCurrentUserId();

    const snapshot = await getDocs(
        collection(db, "users", uid, TABLE_NAME).withConverter(adjustmentConverter)
    );

    return snapshot.docs.map(docItem => docItem.data());
};

export const addBankAccountBalanceAdjustment = async (
    input: BankAccountBalanceAdjustmentCreateInput
) => {
    const uid = getCurrentUserId();

    await addDoc(
        collection(db, "users", uid, TABLE_NAME).withConverter(adjustmentConverter),
        {
            ...input,
            id: "",
            createdAt: new Date(),
        }
    );
};

export const updateBankAccountBalanceAdjustment = async (
    adjustmentId: string,
    updates: BankAccountBalanceAdjustmentUpdateInput
) => {
    const uid = getCurrentUserId();
    const payload: any = { ...updates };

    if (updates.date) {
        payload.date = Timestamp.fromDate(updates.date);
    }

    await updateDoc(
        doc(db, "users", uid, TABLE_NAME, adjustmentId),
        payload
    );
};

export const deleteBankAccountBalanceAdjustment = async (adjustmentId: string) => {
    const uid = getCurrentUserId();

    await deleteDoc(
        doc(db, "users", uid, TABLE_NAME, adjustmentId)
    );
};

export const subscribeToBankAccountBalanceAdjustments = (
    callback: (adjustments: BankAccountBalanceAdjustment[]) => void
) => {
    const uid = getCurrentUserId();

    const q = query(
        collection(db, "users", uid, TABLE_NAME).withConverter(adjustmentConverter),
        orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const adjustments = snapshot.docs.map(docItem => docItem.data());
        callback(adjustments);
    });

    return unsubscribe;
};
