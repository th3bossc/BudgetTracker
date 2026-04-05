import type { Investment } from "@/types/schema";
import type { InvestmentCreateInput, InvestmentUpdateInput } from "@/types/create";
import type { InvestmentDB } from "@/types/firebase";
import {
    collection,
    getDocs,
    addDoc,
    deleteField,
    serverTimestamp,
    FirestoreDataConverter,
    QueryDocumentSnapshot,
    SnapshotOptions,
    Timestamp,
    updateDoc,
    doc,
    deleteDoc,
    query,
    orderBy,
    onSnapshot,
} from 'firebase/firestore';
import { db } from "./firebase";
import { getCurrentUserId } from "./firestore-helpers";

const investmentConverter: FirestoreDataConverter<Investment> = {
    toFirestore(investment: Investment): InvestmentDB {
        const payload: InvestmentDB = {
            name: investment.name,
            amount: investment.amount,
            description: investment.description,
            type: investment.type,
            date: Timestamp.fromDate(investment.date),
            monthKey: investment.monthKey,
            createdAt: serverTimestamp(),
        };

        if (investment.paymentMethod) {
            payload.paymentMethod = investment.paymentMethod;
        }

        return payload;
    },
    fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions,
    ): Investment {
        const data = snapshot.data(options) as InvestmentDB;

        return {
            id: snapshot.id,
            name: data.name,
            amount: data.amount,
            description: data.description,
            type: data.type,
            paymentMethod: data.paymentMethod,
            date: data.date.toDate(),
            monthKey: data.monthKey,
            createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
        }
    }
}

const TABLE_NAME = "investments";

export const getInvestments = async (): Promise<Investment[]> => {
    const uid = getCurrentUserId();

    const snapshot = await getDocs(
        collection(db, 'users', uid, TABLE_NAME).withConverter(investmentConverter)
    );

    return snapshot.docs.map(doc => doc.data());
}

export const addInvestment = async (
    input: InvestmentCreateInput
) => {
    const uid = getCurrentUserId();

    await addDoc(collection(db, 'users', uid, TABLE_NAME).withConverter(investmentConverter), {
        ...input,
        id: '',
        createdAt: new Date(),
    })
}

export const updateInvestment = async (
    investmentId: string,
    updates: InvestmentUpdateInput,
) => {
    const uid = getCurrentUserId();

    const payload: any = Object.fromEntries(
        Object.entries(updates).filter(([key, value]) => key === "paymentMethod" || value !== undefined)
    );

    if (updates.date)
        payload.date = Timestamp.fromDate(updates.date);

    if (Object.prototype.hasOwnProperty.call(updates, "paymentMethod")) {
        payload.paymentMethod = updates.paymentMethod ?? deleteField();
    }

    await updateDoc(
        doc(db, 'users', uid, TABLE_NAME, investmentId),
        payload,
    )
}

export const deleteInvestment = async (
    investmentId: string,
) => {
    const uid = getCurrentUserId();

    await deleteDoc(
        doc(db, 'users', uid, TABLE_NAME, investmentId),
    );
}

export const subscribeToInvestments = (
    callback: (expenses: Investment[]) => void
) => {
    const uid = getCurrentUserId();

    const q = query(
        collection(db, "users", uid, TABLE_NAME)
            .withConverter(investmentConverter),
        orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const investments = snapshot.docs.map(doc => doc.data());
        callback(investments);
    });

    return unsubscribe;
};
