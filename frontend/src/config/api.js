import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Get the backend IP from environment variables
// Falls back to localhost if not set
const getBackendIp = () => {
  const ip = Constants.expoConfig?.extra?.backendIp || 
             process.env.EXPO_PUBLIC_BACKEND_IP || 
             'localhost';
  console.log('🔧 Backend IP detected:', ip);
  return ip;
};

// Determine the correct backend URL based on platform
const getBackendUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:4000';
  }
  // For Android/iOS physical devices, use the dynamically detected IP
  const ip = getBackendIp();
  const url = `http://${ip}:4000`;
  console.log('🌐 Backend URL for', Platform.OS, ':', url);
  return url;
};

export const BACKEND_URL = getBackendUrl();
console.log('✅ BACKEND_URL configured:', BACKEND_URL);