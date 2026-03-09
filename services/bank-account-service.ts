import type { BankAccountCreateInput, BankAccountUpdateInput } from "@/types/create";
import type { BankAccountDB } from "@/types/firebase";
import type { BankAccount } from "@/types/schema";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    FirestoreDataConverter,
    getDocs,
    onSnapshot,
    query,
    QueryDocumentSnapshot,
    serverTimestamp,
    SnapshotOptions,
    Timestamp,
    updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { getCurrentUserId } from "./firestore-helpers";

const bankAccountConverter: FirestoreDataConverter<BankAccount> = {
    toFirestore(account: BankAccount): BankAccountDB {
        return {
            name: account.name,
            openingBalance: account.openingBalance,
            minimumBalance: account.minimumBalance,
            isArchived: account.isArchived ?? false,
            createdAt: serverTimestamp(),
        };
    },
    fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
    ): BankAccount {
        const data = snapshot.data(options) as BankAccountDB;

        return {
            id: snapshot.id,
            name: data.name,
            openingBalance: data.openingBalance ?? 0,
            minimumBalance: data.minimumBalance,
            isArchived: data.isArchived ?? false,
            createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
        };
    },
};

const TABLE_NAME = "bankAccounts";

export const getBankAccounts = async (): Promise<BankAccount[]> => {
    const uid = getCurrentUserId();

    const snapshot = await getDocs(
        collection(db, "users", uid, TABLE_NAME).withConverter(bankAccountConverter)
    );

    return snapshot.docs.map(docItem => docItem.data());
};

export const addBankAccount = async (input: BankAccountCreateInput) => {
    const uid = getCurrentUserId();

    await addDoc(
        collection(db, "users", uid, TABLE_NAME).withConverter(bankAccountConverter),
        {
            ...input,
            id: "",
            createdAt: new Date(),
        }
    );
};

export const updateBankAccount = async (
    accountId: string,
    updates: BankAccountUpdateInput
) => {
    const uid = getCurrentUserId();

    await updateDoc(
        doc(db, "users", uid, TABLE_NAME, accountId),
        updates
    );
};

export const deleteBankAccount = async (accountId: string) => {
    const uid = getCurrentUserId();

    await deleteDoc(
        doc(db, "users", uid, TABLE_NAME, accountId)
    );
};

export const subscribeToBankAccounts = (
    callback: (accounts: BankAccount[]) => void
) => {
    const uid = getCurrentUserId();

    const q = query(
        collection(db, "users", uid, TABLE_NAME).withConverter(bankAccountConverter),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const accounts = snapshot.docs.map(docItem => docItem.data());
        callback(accounts);
    });

    return unsubscribe;
};
