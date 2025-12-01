import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Get the backend IP from environment variables
// Falls back to localhost if not set
const getBackendIp = () => {
  return Constants.expoConfig?.extra?.backendIp || 
         process.env.EXPO_PUBLIC_BACKEND_IP || 
         'localhost';
};

// Determine the correct backend URL based on platform
const getBackendUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:4000';
  }
  // For Android/iOS physical devices, use the dynamically detected IP
  const ip = getBackendIp();
  return `http://${ip}:4000`;
};

export const BACKEND_URL = getBackendUrl();