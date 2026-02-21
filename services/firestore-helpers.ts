import { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore';
import { auth } from './firebase';

export const getCurrentUserId = () => {
    const uid = auth.currentUser?.uid;
    if (!uid)
        throw new Error('User not authenticated');

    return uid;
}