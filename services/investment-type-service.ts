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
} from "firebase/firestore";

import { db } from "./firebase";
import { getCurrentUserId } from "./firestore-helpers";

const investmentTypeConverter: FirestoreDataConverter<InvestmentType> = {
  toFirestore(type: InvestmentType): InvestmentTypeDB {
    return {
      name: type.name,
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
      riskLevel: data.riskLevel,
      isArchived: data.isArchived ?? false,
      createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
    };
  },
};

export const getInvestmentTypes = async (): Promise<InvestmentType[]> => {
  const uid = getCurrentUserId();

  const snapshot = await getDocs(
    collection(db, "users", uid, "investmentTypes").withConverter(investmentTypeConverter)
  );

  return snapshot.docs.map(doc => doc.data());
};

export const addInvestmentType = async (input: Omit<InvestmentType, "id" | "createdAt">) => {
  const uid = getCurrentUserId();

  await addDoc(
    collection(db, "users", uid, "investmentTypes").withConverter(investmentTypeConverter),
    {
      ...input,
      id: "",
      createdAt: new Date(),
    }
  );
};

export const updateInvestmentType = async (
  typeId: string,
  updates: Partial<Omit<InvestmentType, "id" | "createdAt">>
) => {
  const uid = getCurrentUserId();

  await updateDoc(
    doc(db, "users", uid, "investmentTypes", typeId),
    updates
  );
};

export const deleteInvestmentType = async (typeId: string) => {
  const uid = getCurrentUserId();

  await deleteDoc(
    doc(db, "users", uid, "investmentTypes", typeId)
  );
};