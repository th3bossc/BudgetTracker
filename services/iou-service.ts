import type { IouCreateInput, IouUpdateInput } from "@/types/create";
import type { IouDB } from "@/types/firebase";
import type { Iou } from "@/types/schema";
import { getMonthKey } from "@/utils/date";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    FirestoreDataConverter,
    onSnapshot,
    orderBy,
    QueryDocumentSnapshot,
    serverTimestamp,
    SnapshotOptions,
    Timestamp,
    updateDoc,
    getDocs,
    query,
    getDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { getCurrentUserId } from "./firestore-helpers";

const TABLE_NAME = "ious";

const iouConverter: FirestoreDataConverter<Iou> = {
    toFirestore(iou: Iou): IouDB {
        return {
            expense: iou.expense,
            paymentMethod: iou.paymentMethod,
            initialAmount: iou.initialAmount,
            amountLeft: iou.amountLeft,
            expenseMonthKey: iou.expenseMonthKey,
            createdMonthKey: iou.createdMonthKey,
            isPaid: iou.isPaid,
            paidAt: iou.paidAt ? Timestamp.fromDate(iou.paidAt) : null,
            createdAt: serverTimestamp(),
        };
    },

    fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
    ): Iou {
        const data = snapshot.data(options) as IouDB;
        const createdAt = (data.createdAt as Timestamp)?.toDate?.() ?? new Date();
        const fallbackMonthKey = data.monthKey ?? getMonthKey(createdAt);

        return {
            id: snapshot.id,
            expense: data.expense,
            paymentMethod: data.paymentMethod,
            initialAmount: data.initialAmount ?? data.amountLeft,
            amountLeft: data.amountLeft,
            expenseMonthKey: data.expenseMonthKey ?? fallbackMonthKey,
            createdMonthKey: data.createdMonthKey ?? fallbackMonthKey,
            isPaid: data.isPaid ?? false,
            paidAt: data.paidAt?.toDate?.(),
            createdAt,
        };
    },
};

export const getIous = async (): Promise<Iou[]> => {
    const uid = getCurrentUserId();

    const snapshot = await getDocs(
        collection(db, "users", uid, TABLE_NAME).withConverter(iouConverter)
    );

    return snapshot.docs.map(doc => doc.data());
};

export const addIou = async (input: IouCreateInput) => {
    const uid = getCurrentUserId();
    const nowMonthKey = getMonthKey(new Date());
    const normalizedInput = {
        ...input,
        expenseMonthKey: input.expenseMonthKey,
        createdMonthKey: input.createdMonthKey ?? nowMonthKey,
    };

    await addDoc(
        collection(db, "users", uid, TABLE_NAME).withConverter(iouConverter),
        {
            ...normalizedInput,
            id: "",
            paidAt: normalizedInput.paidAt,
            createdAt: new Date(),
        }
    );
};

export const updateIou = async (
    iouId: string,
    updates: IouUpdateInput,
) => {
    const uid = getCurrentUserId();

    const payload: any = { ...updates };

    if (updates.paidAt) {
        payload.paidAt = Timestamp.fromDate(updates.paidAt);
    }

    if (typeof updates.amountLeft === "number") {
        const isPaid = updates.amountLeft <= 0;
        payload.isPaid = isPaid;
        payload.paidAt = isPaid
            ? serverTimestamp()
            : null;
    }

    await updateDoc(
        doc(db, "users", uid, TABLE_NAME, iouId),
        payload,
    );
};

export const markIouPaid = async (iouId: string) => {
    const uid = getCurrentUserId();
    const ref = doc(db, "users", uid, TABLE_NAME, iouId).withConverter(iouConverter);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
        throw new Error("IOU not found");
    }

    const current = snapshot.data();
    const safeInitialAmount = current.initialAmount > 0
        ? current.initialAmount
        : current.amountLeft;

    await updateDoc(
        doc(db, "users", uid, TABLE_NAME, iouId),
        {
            initialAmount: safeInitialAmount,
            isPaid: true,
            amountLeft: 0,
            paidAt: serverTimestamp(),
        }
    );
};

export const deleteIou = async (iouId: string) => {
    const uid = getCurrentUserId();

    await deleteDoc(
        doc(db, "users", uid, TABLE_NAME, iouId),
    );
};

export const subscribeToIous = (
    callback: (ious: Iou[]) => void
) => {
    const uid = getCurrentUserId();

    const q = query(
        collection(db, "users", uid, TABLE_NAME)
            .withConverter(iouConverter),
        orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const ious = snapshot.docs.map(doc => doc.data());
        callback(ious);
    });

    return unsubscribe;
};
