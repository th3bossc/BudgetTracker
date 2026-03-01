import type { IouCreateInput, IouUpdateInput } from "@/types/create";
import type { IouDB } from "@/types/firebase";
import type { Iou } from "@/types/schema";
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
    where,
    limit,
} from "firebase/firestore";
import { db } from "./firebase";
import { getCurrentUserId } from "./firestore-helpers";

const TABLE_NAME = "ious";

const iouConverter: FirestoreDataConverter<Iou> = {
    toFirestore(iou: Iou): IouDB {
        return {
            expense: iou.expense,
            paymentMethod: iou.paymentMethod,
            amountLeft: iou.amountLeft,
            monthKey: iou.monthKey,
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

        return {
            id: snapshot.id,
            expense: data.expense,
            paymentMethod: data.paymentMethod,
            amountLeft: data.amountLeft,
            monthKey: data.monthKey,
            isPaid: data.isPaid ?? false,
            paidAt: data.paidAt?.toDate?.(),
            createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
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

    const duplicateSnapshot = await getDocs(
        query(
            collection(db, "users", uid, TABLE_NAME).withConverter(iouConverter),
            where("expense.id", "==", input.expense.id),
            limit(1),
        )
    );

    if (!duplicateSnapshot.empty) {
        throw new Error("IOU already exists for this expense");
    }

    await addDoc(
        collection(db, "users", uid, TABLE_NAME).withConverter(iouConverter),
        {
            ...input,
            id: "",
            paidAt: input.paidAt,
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

    await updateDoc(
        doc(db, "users", uid, TABLE_NAME, iouId),
        payload,
    );
};

export const markIouPaid = async (iouId: string) => {
    const uid = getCurrentUserId();

    await updateDoc(
        doc(db, "users", uid, TABLE_NAME, iouId),
        {
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
