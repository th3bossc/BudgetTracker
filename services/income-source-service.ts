import type { IncomeSource } from "@/types/schema";
import type { IncomeSourceDB } from "@/types/firebase";

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
import { IncomeSourceCreateInput, IncomeSourceUpdateInput } from "@/types/create";

const incomeSourceConverter: FirestoreDataConverter<IncomeSource> = {
    toFirestore(source: IncomeSource): IncomeSourceDB {
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
    ): IncomeSource {
        const data = snapshot.data(options) as IncomeSourceDB;

        return {
            id: snapshot.id,
            name: data.name,
            color: data.color ?? "#2E7D32",
            isArchived: data.isArchived ?? false,
            createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
        };
    },
};

const TABLE_NAME = "incomeSources";

export const getIncomeSources = async (): Promise<IncomeSource[]> => {
    const uid = getCurrentUserId();

    const snapshot = await getDocs(
        collection(db, "users", uid, TABLE_NAME).withConverter(incomeSourceConverter)
    );

    return snapshot.docs.map(doc => doc.data());
};

export const addIncomeSource = async (input: IncomeSourceCreateInput) => {
    const uid = getCurrentUserId();

    await addDoc(
        collection(db, "users", uid, TABLE_NAME).withConverter(incomeSourceConverter),
        {
            ...input,
            id: "",
            createdAt: new Date(),
        }
    );
};

export const updateIncomeSource = async (
    sourceId: string,
    updates: IncomeSourceUpdateInput
) => {
    const uid = getCurrentUserId();

    await updateDoc(
        doc(db, "users", uid, TABLE_NAME, sourceId),
        updates
    );
};

export const deleteIncomeSource = async (sourceId: string) => {
    const uid = getCurrentUserId();

    await deleteDoc(
        doc(db, "users", uid, TABLE_NAME, sourceId)
    );
};

export const subscribeToIncomeSources = (
    callback: (incomeSources: IncomeSource[]) => void
) => {
    const uid = getCurrentUserId();

    const q = query(
        collection(db, 'users', uid, TABLE_NAME)
            .withConverter(incomeSourceConverter)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const incomesSources = snapshot.docs.map(doc => doc.data());
        callback(incomesSources);
    })

    return unsubscribe;
}