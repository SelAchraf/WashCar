import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKINGS_KEY = 'washcar_bookings_v2';
const PROFILE_KEY = 'washcar_profile_v1';

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [bookings, setBookings] = useState([]);
  const [profile, setProfile] = useState({
    name: 'Client WashCar',
    email: 'client@example.com',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const b = await AsyncStorage.getItem(BOOKINGS_KEY);
        const p = await AsyncStorage.getItem(PROFILE_KEY);
        if (b) setBookings(JSON.parse(b));
        if (p) setProfile(JSON.parse(p));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persistBookings = useCallback(async (next) => {
    setBookings(next);
    try { await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(next)); } catch {}
  }, []);

  const addBooking = useCallback(async (booking) => {
    const next = [booking, ...bookings];
    await persistBookings(next);
  }, [bookings, persistBookings]);

  const updateBooking = useCallback(async (id, updater) => {
    const next = bookings.map((b) => (b.id === id ? { ...b, ...(typeof updater === 'function' ? updater(b) : updater) } : b));
    await persistBookings(next);
  }, [bookings, persistBookings]);

  const cancelBooking = useCallback(async (id) => {
    const next = bookings.map((b) => (b.id === id ? { ...b, status: 'Annulée' } : b));
    await persistBookings(next);
  }, [bookings, persistBookings]);

  const saveProfile = useCallback(async (data) => {
    const next = { ...profile, ...data };
    setProfile(next);
    try { await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(next)); } catch {}
  }, [profile]);

  const value = useMemo(() => ({
    bookings,
    profile,
    loading,
    addBooking,
    updateBooking,
    cancelBooking,
    saveProfile,
  }), [bookings, profile, loading, addBooking, updateBooking, cancelBooking, saveProfile]);

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within BookingProvider');
  return ctx;
}


