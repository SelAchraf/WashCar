import { Platform } from 'react-native';

// Determine the correct backend URL based on platform
const getBackendUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:4000';
  }
  // For Android/iOS physical devices, use your computer's IP
  return 'http://192.168.1.12:4000';
};

export const BACKEND_URL = getBackendUrl();