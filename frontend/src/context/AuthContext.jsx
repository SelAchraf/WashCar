// Backend URL - can be overridden by setting global.BACKEND_URL in the app environment
import { BACKEND_URL } from '../config/api';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';


const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // If we already have a profile (from signup), skip fetching
        if (userProfile && userProfile.email === firebaseUser.email) {
          console.log('Using cached user profile from signup');
          setLoading(false);
          return;
        }
        
        // Fetch user profile from backend
        try {
          const token = await firebaseUser.getIdToken();
          const res = await fetch(`${BACKEND_URL}/api/users/${firebaseUser.uid}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const profile = await res.json();
            setUserProfile(profile);
          } else if (res.status === 404) {
            // create default profile via backend
            console.log('User profile not found, creating default profile...');
            const defaultProfile = {
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              email: firebaseUser.email,
              phone: '',
              address: '',
              role: 'client', // default role for existing users
              createdAt: new Date().toISOString(),
            };
            try {
              const createRes = await fetch(`${BACKEND_URL}/api/users/${firebaseUser.uid}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(defaultProfile),
              });
              if (createRes.ok) {
                console.log('Default profile created successfully');
                setUserProfile(defaultProfile);
              } else {
                console.error('Failed to create default profile:', await createRes.text());
                // Still set the profile locally so the app can function
                setUserProfile(defaultProfile);
              }
            } catch (createError) {
              console.error('Error creating default profile:', createError);
              // Still set the profile locally so the app can function
              setUserProfile(defaultProfile);
            }
          } else {
            console.error('Failed to fetch user profile from backend', await res.text());
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

  const signUp = async (email, password, name, role = 'client') => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update display name
      await updateProfile(firebaseUser, { displayName: name });
      
      // Create user profile in Firestore with role
      const userProfile = {
        name,
        email,
        phone: '',
        address: '',
        role: role, // 'client' or 'owner'
        createdAt: new Date().toISOString(),
      };

      try {
        const token = await firebaseUser.getIdToken();
        const createRes = await fetch(`${BACKEND_URL}/api/users/${firebaseUser.uid}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(userProfile),
        });
        
        if (createRes.ok) {
          console.log('User profile created successfully during signup');
          // Set the profile immediately to avoid fetch race condition
          setUserProfile(userProfile);
        } else {
          console.warn('Failed to create user profile during signup:', await createRes.text());
        }
      } catch (e) {
        console.warn('Failed to create user profile on backend:', e);
      }

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
      const token = await user.getIdToken();
      const res = await fetch(`${BACKEND_URL}/api/users/${user.uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to update profile');
      }
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

