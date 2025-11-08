import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const { user, userProfile, updateUserProfile } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load bookings from Firebase
  useEffect(() => {
    // If no user, clear bookings and return early
    if (!user) {
      setBookings([]);
      setLoading(false);
      return;
    }

    // If user exists, set up the listener
    setLoading(true);
    let unsubscribe = null;
    let isMounted = true;

    try {
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          // Only update state if component is still mounted and user is still logged in
          if (!isMounted) return;
          
          const bookingsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setBookings(bookingsData);
          setLoading(false);
        },
        (error) => {
          // Ignore errors that occur during logout or connection termination
          // These are normal when user logs out and Firebase closes the connection
          if (
            error.code === 'cancelled' || 
            error.code === 'unavailable' ||
            error.message?.includes('terminate') ||
            error.message?.includes('Listen channel') ||
            error.message?.includes('Bad Request')
          ) {
            // Silently ignore connection termination errors during logout
            return;
          }
          // Only log other errors if component is still mounted and user is still logged in
          if (isMounted && user) {
            console.error('Error loading bookings:', error);
            setLoading(false);
          }
        }
      );
    } catch (error) {
      if (isMounted) {
        console.error('Error setting up bookings listener:', error);
        setLoading(false);
      }
    }

    // Cleanup function - called when user logs out or component unmounts
    return () => {
      isMounted = false;
      if (unsubscribe) {
        try {
          // Unsubscribe from Firestore listener
          // This may cause a network error if connection is already closed, which is normal
          unsubscribe();
        } catch (error) {
          // Silently ignore cleanup errors - they're expected during logout
          // The connection may already be closed by Firebase
        }
      }
      // Clear bookings immediately when cleaning up
      setBookings([]);
      setLoading(false);
    };
  }, [user]);

  const addBooking = useCallback(async (booking) => {
    if (!user) {
      throw new Error('User must be logged in to add a booking');
    }

    try {
      const bookingData = {
        ...booking,
        userId: user.uid,
        createdAt: new Date().toISOString(),
      };
      await addDoc(collection(db, 'bookings'), bookingData);
    } catch (error) {
      console.error('Error adding booking:', error);
      throw error;
    }
  }, [user]);

  const updateBooking = useCallback(async (id, updater) => {
    if (!user) {
      throw new Error('User must be logged in to update a booking');
    }

    try {
      const bookingRef = doc(db, 'bookings', id);
      const updates = typeof updater === 'function' 
        ? updater(bookings.find(b => b.id === id))
        : updater;
      await updateDoc(bookingRef, updates);
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  }, [user, bookings]);

  const cancelBooking = useCallback(async (id) => {
    await updateBooking(id, { status: 'Annulée' });
  }, [updateBooking]);

  const saveProfile = useCallback(async (data) => {
    if (!user) {
      throw new Error('User must be logged in to save profile');
    }
    await updateUserProfile(data);
  }, [user, updateUserProfile]);

  const value = useMemo(() => ({
    bookings,
    profile: userProfile || {
      name: '',
      email: '',
      phone: '',
      address: '',
    },
    loading,
    addBooking,
    updateBooking,
    cancelBooking,
    saveProfile,
  }), [bookings, userProfile, loading, addBooking, updateBooking, cancelBooking, saveProfile]);

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within BookingProvider');
  return ctx;
}


