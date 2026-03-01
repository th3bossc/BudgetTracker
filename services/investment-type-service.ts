import type { InvestmentType } from "@/types/schema";
import type { InvestmentTypeDB } from "@/types/firebase";

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
import { InvestmentTypeCreateInput, InvestmentTypeUpdateInput } from "@/types/create";

const TABLE_NAME = "investmentTypes"

const investmentTypeConverter: FirestoreDataConverter<InvestmentType> = {
    toFirestore(type: InvestmentType): InvestmentTypeDB {
        return {
            name: type.name,
            icon: type.icon,
            riskLevel: type.riskLevel,
            isArchived: type.isArchived ?? false,
            createdAt: serverTimestamp(),
        };
    },

    fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
    ): InvestmentType {
        const data = snapshot.data(options) as InvestmentTypeDB;

        return {
            id: snapshot.id,
            name: data.name,
            icon: data.icon,
            riskLevel: data.riskLevel,
            isArchived: data.isArchived ?? false,
            createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
        };
    },
};

export const getInvestmentTypes = async (): Promise<InvestmentType[]> => {
    const uid = getCurrentUserId();

    const snapshot = await getDocs(
        collection(db, "users", uid, TABLE_NAME).withConverter(investmentTypeConverter)
    );

    return snapshot.docs.map(doc => doc.data());
};

export const addInvestmentType = async (input: InvestmentTypeCreateInput) => {
    const uid = getCurrentUserId();

    await addDoc(
        collection(db, "users", uid, TABLE_NAME).withConverter(investmentTypeConverter),
        {
            ...input,
            id: "",
            createdAt: new Date(),
        }
    );
};

export const updateInvestmentType = async (
    typeId: string,
    updates: InvestmentTypeUpdateInput
) => {
    const uid = getCurrentUserId();

    await updateDoc(
        doc(db, "users", uid, TABLE_NAME, typeId),
        updates
    );
};

export const deleteInvestmentType = async (typeId: string) => {
    const uid = getCurrentUserId();

    await deleteDoc(
        doc(db, "users", uid, TABLE_NAME, typeId)
    );
};

export const subscribeToInvestmentTypes = (
    callback: (types: InvestmentType[]) => void
) => {
    const uid = getCurrentUserId();

    const q = query(
        collection(db, "users", uid, TABLE_NAME)
            .withConverter(investmentTypeConverter),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const types = snapshot.docs.map(doc => doc.data());
        callback(types);
    });

    return unsubscribe;
};
