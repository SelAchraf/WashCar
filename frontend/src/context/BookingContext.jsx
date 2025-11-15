import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

// Backend URL - can be overridden by setting global.BACKEND_URL in the app environment
const BACKEND_URL = (global && global.BACKEND_URL) || 'http://localhost:4000';

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

    // If user exists, fetch bookings from backend API
    let isMounted = true;
    setLoading(true);

    (async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch(`${BACKEND_URL}/api/bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!isMounted) return;
        if (!res.ok) {
          console.error('Failed to load bookings from backend', await res.text());
          setBookings([]);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setBookings(data);
        setLoading(false);
      } catch (error) {
        if (isMounted) {
          console.error('Error loading bookings from backend:', error);
          setBookings([]);
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
      setBookings([]);
      setLoading(false);
    };
  }, [user]);

  const addBooking = useCallback(async (booking) => {
    if (!user) {
      throw new Error('User must be logged in to add a booking');
    }
    try {
      const token = await user.getIdToken();
      const bookingData = {
        ...booking,
        createdAt: new Date().toISOString(),
      };
      const res = await fetch(`${BACKEND_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to add booking: ${text}`);
      }
      const newBooking = await res.json();
      // Update local state immediately with the new booking
      setBookings(prevBookings => [newBooking, ...prevBookings]);
      return newBooking;
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
      const token = await user.getIdToken();
      const currentBooking = bookings.find(b => b.id === id);
      const updates = typeof updater === 'function'
        ? updater(currentBooking)
        : updater;
      const res = await fetch(`${BACKEND_URL}/api/bookings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to update booking: ${text}`);
      }
      // Update local state immediately
      setBookings(prevBookings =>
        prevBookings.map(b => b.id === id ? { ...b, ...updates } : b)
      );
      return { success: true };
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


