import type { Income } from "@/types/schema";
import type { IncomeCreateInput, IncomeUpdateInput } from "@/types/create";
import type { IncomeDB } from "@/types/firebase";
import {
    collection,
    getDocs,
    addDoc,
    serverTimestamp,
    FirestoreDataConverter,
    Timestamp,
    QueryDocumentSnapshot,
    SnapshotOptions,
    updateDoc,
    doc,
    deleteDoc,
} from 'firebase/firestore';
import { db } from "./firebase";
import { getCurrentUserId } from "./firestore-helpers";

const incomeConverter: FirestoreDataConverter<Income> = {
    toFirestore(income: Income): IncomeDB {
        return {
            amount: income.amount,
            source: income.source,
            date: Timestamp.fromDate(income.date),
            monthKey: income.monthKey,
            createdAt: serverTimestamp(),
        }
    },
    fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
    ): Income {
        const data = snapshot.data(options) as IncomeDB;

        return {
            id: snapshot.id,
            amount: data.amount,
            source: data.source,
            date: data.date.toDate(),
            monthKey: data.monthKey,
            createdAt: (data?.createdAt as Timestamp)?.toDate?.() ?? new Date()
        }
    }
}

const TABLE_NAME = "incomes"

export const getIncomes = async (): Promise<Income[]> => {
    const uid = getCurrentUserId();

    const snapshot = await getDocs(
        collection(db, 'users', uid, TABLE_NAME).withConverter(incomeConverter)
    );

    return snapshot.docs.map(doc => doc.data());
}

export const addIncome = async (
    input: IncomeCreateInput
) => {
    const uid = getCurrentUserId();

    await addDoc(collection(db, 'users', uid, TABLE_NAME).withConverter(incomeConverter), {
        ...input,
        id: '',
        createdAt: new Date()
    })
}

export const updateIncome = async (
    incomeId: string,
    updates: IncomeUpdateInput,
) => {
    const uid = getCurrentUserId();

    const payload: any = { ...updates };

    if (updates.date)
        payload.date = Timestamp.fromDate(updates.date);

    await updateDoc(
        doc(db, 'users', uid, TABLE_NAME, incomeId),
        payload,
    )
}

export const deleteInvestment = async (
    incomeId: string,
) => {
    const uid = getCurrentUserId();

    await deleteDoc(
        doc(db, 'users', uid, TABLE_NAME, incomeId),
    );
}