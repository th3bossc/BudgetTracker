import type { AccountTransferCreateInput, AccountTransferUpdateInput } from "@/types/create";
import type { AccountTransferDB } from "@/types/firebase";
import type { AccountTransfer } from "@/types/schema";
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

const accountTransferConverter: FirestoreDataConverter<AccountTransfer> = {
    toFirestore(transfer: AccountTransfer): AccountTransferDB {
        return {
            fromBankAccount: transfer.fromBankAccount,
            toBankAccount: transfer.toBankAccount,
            amount: transfer.amount,
            description: transfer.description,
            date: Timestamp.fromDate(transfer.date),
            monthKey: transfer.monthKey,
            createdAt: serverTimestamp(),
        };
    },
    fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
    ): AccountTransfer {
        const data = snapshot.data(options) as AccountTransferDB & {
            fromPaymentMethod?: { id: string, name?: string };
            toPaymentMethod?: { id: string, name?: string };
        };
        const fromBankAccount = data.fromBankAccount ?? data.fromPaymentMethod;
        const toBankAccount = data.toBankAccount ?? data.toPaymentMethod;

        return {
            id: snapshot.id,
            fromBankAccount: fromBankAccount ?? { id: "" },
            toBankAccount: toBankAccount ?? { id: "" },
            amount: data.amount,
            description: data.description,
            date: data.date.toDate(),
            monthKey: data.monthKey,
            createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
        };
    },
};

const TABLE_NAME = "accountTransfers";

export const getAccountTransfers = async (): Promise<AccountTransfer[]> => {
    const uid = getCurrentUserId();

    const snapshot = await getDocs(
        collection(db, "users", uid, TABLE_NAME).withConverter(accountTransferConverter)
    );

    return snapshot.docs.map(docItem => docItem.data());
};

export const addAccountTransfer = async (input: AccountTransferCreateInput) => {
    const uid = getCurrentUserId();

    await addDoc(
        collection(db, "users", uid, TABLE_NAME).withConverter(accountTransferConverter),
        {
            ...input,
            id: "",
            createdAt: new Date(),
        }
    );
};

export const updateAccountTransfer = async (
    transferId: string,
    updates: AccountTransferUpdateInput
) => {
    const uid = getCurrentUserId();
    const payload: any = { ...updates };

    if (updates.date) {
        payload.date = Timestamp.fromDate(updates.date);
    }

    await updateDoc(
        doc(db, "users", uid, TABLE_NAME, transferId),
        payload
    );
};

export const deleteAccountTransfer = async (transferId: string) => {
    const uid = getCurrentUserId();

    await deleteDoc(
        doc(db, "users", uid, TABLE_NAME, transferId)
    );
};

export const subscribeToAccountTransfers = (
    callback: (transfers: AccountTransfer[]) => void
) => {
    const uid = getCurrentUserId();

    const q = query(
        collection(db, "users", uid, TABLE_NAME).withConverter(accountTransferConverter),
        orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const transfers = snapshot.docs.map(docItem => docItem.data());
        callback(transfers);
    });

    return unsubscribe;
};
