import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  Auth,
  getAuth,
  initializeAuth,
} from 'firebase/auth';
import * as FirebaseAuth from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
}


const app =  initializeApp(firebaseConfig);
export const db = getFirestore(app);

let auth: Auth;
const getReactNativePersistence = (
    FirebaseAuth as unknown as {
        getReactNativePersistence?: (storage: typeof AsyncStorage) => unknown;
    }
).getReactNativePersistence;

if (Platform.OS === 'web') {
    auth = getAuth(app);
} else {
    try {
        if (getReactNativePersistence) {
            auth = initializeAuth(app, {
                persistence: getReactNativePersistence(AsyncStorage) as never,
            });
        } else {
            auth = getAuth(app);
        }
    } catch {
        // HMR or duplicate init path fallback.
        auth = getAuth(app);
    }
}

export { auth };
