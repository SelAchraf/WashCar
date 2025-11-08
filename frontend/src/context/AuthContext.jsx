import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          } else {
            // Create user profile if it doesn't exist
            const defaultProfile = {
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              email: firebaseUser.email,
              phone: '',
              address: '',
              createdAt: new Date().toISOString(),
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), defaultProfile);
            setUserProfile(defaultProfile);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update display name
      await updateProfile(firebaseUser, { displayName: name });
      
      // Create user profile in Firestore
      const userProfile = {
        name,
        email,
        phone: '',
        address: '',
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);
      
      return { success: true };
    } catch (error) {
      console.error('Sign up error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Provide more detailed error information
      let errorMessage = error.message;
      if (error.code === 'auth/operation-not-allowed') {
        errorMessage = `L'authentification Email/Password n'est pas activée. Veuillez:
1. Aller dans Firebase Console (https://console.firebase.google.com/)
2. Sélectionner le projet washcar-55422
3. Aller dans Authentication > Sign-in method
4. Activer Email/Password
5. Attendre 2-3 minutes et réessayer`;
      }
      
      return { success: false, error: errorMessage, code: error.code };
    }
  };

  const signIn = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Provide more detailed error information
      let errorMessage = error.message;
      if (error.code === 'auth/operation-not-allowed') {
        errorMessage = `L'authentification Email/Password n'est pas activée. Veuillez:
1. Aller dans Firebase Console (https://console.firebase.google.com/)
2. Sélectionner le projet washcar-55422
3. Aller dans Authentication > Sign-in method
4. Activer Email/Password
5. Attendre 2-3 minutes et réessayer`;
      }
      
      return { success: false, error: errorMessage, code: error.code };
    }
  };

  const logout = async () => {
    try {
      console.log('AuthContext: Starting logout...');
      
      // Sign out from Firebase Auth
      // This will trigger onAuthStateChanged which will set user to null
      // The BookingContext will automatically clean up Firestore listeners
      await signOut(auth);
      
      console.log('AuthContext: Logout successful');
      return { success: true };
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  const updateUserProfile = async (profileData) => {
    if (!user) return { success: false, error: 'No user logged in' };
    
    try {
      await setDoc(doc(db, 'users', user.uid), profileData, { merge: true });
      setUserProfile(profileData);
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

