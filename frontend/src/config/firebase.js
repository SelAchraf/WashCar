import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyABdMrOGMcISg-df1ITrgDUH1c2x1pBzoQ",
  authDomain: "washcar-55422.firebaseapp.com",
  projectId: "washcar-55422",
  storageBucket: "washcar-55422.firebasestorage.app",
  messagingSenderId: "331183098541",
  appId: "1:331183098541:web:da89f4c58aca83cc265424",
  measurementId: "G-SB9HD3PCNJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;

