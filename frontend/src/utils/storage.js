import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKINGS_KEY = 'washcar_bookings_v1';

export async function saveBooking(booking) {
  try {
    const existing = await AsyncStorage.getItem(BOOKINGS_KEY);
    const list = existing ? JSON.parse(existing) : [];
    list.push(booking);
    await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(list));
  } catch (e) {
    // noop for mock storage
  }
}

export async function getBookings() {
  try {
    const existing = await AsyncStorage.getItem(BOOKINGS_KEY);
    return existing ? JSON.parse(existing) : [];
  } catch (e) {
    return [];
  }
}


