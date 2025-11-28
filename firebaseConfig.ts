
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAc1uOy06Jq4h6xeNA8tIr6iYg6GydNF58",
  authDomain: "bd-prediction-foot-africa.firebaseapp.com",
  projectId: "bd-prediction-foot-africa",
  storageBucket: "bd-prediction-foot-africa.firebasestorage.app",
  messagingSenderId: "184093778456",
  appId: "1:184093778456:web:3a573b65d5a44bedcc996d",
  measurementId: "G-JV5DVM6DF5"
};

// Initialize Firebase (Modular)
const app = initializeApp(firebaseConfig);

// Export Modular instances
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable Offline Persistence
if (typeof window !== 'undefined') {
    enableIndexedDbPersistence(db).catch((err) => {
        if (err.code == 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled in one tab at a a time.
            console.warn("Firestore persistence failed: Multiple tabs open.");
        } else if (err.code == 'unimplemented') {
            // The current browser does not support all of the features required to enable persistence
            console.warn("Firestore persistence not supported by this browser.");
        }
    });
}
