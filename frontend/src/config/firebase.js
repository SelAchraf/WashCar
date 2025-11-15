import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

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

// Note: Firestore access is handled server-side by the backend now.
// The frontend keeps Firebase Authentication for sign-in and ID tokens.
export default app;

// Initialize Firebase Authentication and export auth (kept for client-side signin)
export const auth = getAuth(app);